-- Runtime fix: commenti su articoli mock (solo slug) + insert senza service role.
-- Gli articoli pubblici attuali vivono in mock-data (non in public.articles):
-- senza public_slug gli insert fallivano o finivano sul file store effimero di Vercel.
-- Ripristina policy di insert/segnalazione controllate; la Server Action resta
-- il percorso ufficiale (rate limit + sanitizzazione + Turnstile opzionale).

alter table public.comments
  alter column article_id drop not null;

alter table public.comments
  add column if not exists public_slug text;

alter table public.comments
  drop constraint if exists comments_article_ref_check;

alter table public.comments
  add constraint comments_article_ref_check
  check (
    article_id is not null
    or (public_slug is not null and char_length(trim(public_slug)) between 1 and 120)
  );

create index if not exists comments_public_slug_idx
  on public.comments (public_slug)
  where public_slug is not null;

comment on column public.comments.public_slug is
  'Slug articolo pubblico (mock o non ancora in DB). Usato se article_id è null.';

-- Insert pubblico: solo in_attesa (la Server Action/RPC decide se promuovere).
drop policy if exists "Commenti: inserimento pubblico in attesa" on public.comments;
drop policy if exists "Commenti: inserimento pubblico controllato" on public.comments;
create policy "Commenti: inserimento pubblico in attesa"
  on public.comments for insert
  to anon, authenticated
  with check (
    status = 'in_attesa'
    and reported = false
    and (article_id is not null or public_slug is not null)
  );

-- Segnalazione: flag reported su commenti già approvati
drop policy if exists "Commenti: segnalazione (update reported)" on public.comments;
create policy "Commenti: segnalazione (update reported)"
  on public.comments for update
  to anon, authenticated
  using (status = 'approvato')
  with check (reported = true);

-- RPC: inserisce rispettando il flag moderazione (anche senza service role).
create or replace function public.submit_public_comment(
  p_article_id uuid,
  p_public_slug text,
  p_parent_id uuid,
  p_author_name text,
  p_author_email text,
  p_body text,
  p_ip_hash text
)
returns public.comments
language plpgsql
security definer
set search_path = public
as $$
declare
  moderation_on boolean := true;
  new_status public.comment_status;
  cleaned_slug text;
  row_out public.comments;
begin
  cleaned_slug := nullif(trim(coalesce(p_public_slug, '')), '');

  if p_article_id is null and cleaned_slug is null then
    raise exception 'Articolo non specificato';
  end if;

  if char_length(trim(coalesce(p_author_name, ''))) < 2
     or char_length(trim(coalesce(p_author_name, ''))) > 50 then
    raise exception 'Nome non valido';
  end if;

  if char_length(trim(coalesce(p_body, ''))) < 2
     or char_length(trim(coalesce(p_body, ''))) > 1000 then
    raise exception 'Testo non valido';
  end if;

  select coalesce(s.comments_moderation_enabled, true)
    into moderation_on
  from public.site_settings s
  where s.id = 1;

  if not found then
    moderation_on := true;
  end if;

  new_status := case when moderation_on then 'in_attesa'::public.comment_status
                     else 'approvato'::public.comment_status end;

  insert into public.comments (
    article_id,
    public_slug,
    parent_id,
    author_name,
    author_email,
    body,
    status,
    reported,
    ip_hash
  ) values (
    p_article_id,
    cleaned_slug,
    p_parent_id,
    trim(p_author_name),
    nullif(trim(coalesce(p_author_email, '')), ''),
    trim(p_body),
    new_status,
    false,
    p_ip_hash
  )
  returning * into row_out;

  return row_out;
end;
$$;

revoke all on function public.submit_public_comment(
  uuid, text, uuid, text, text, text, text
) from public;

grant execute on function public.submit_public_comment(
  uuid, text, uuid, text, text, text, text
) to anon, authenticated;

comment on function public.submit_public_comment is
  'Insert commento pubblico con status da site_settings.comments_moderation_enabled.';
