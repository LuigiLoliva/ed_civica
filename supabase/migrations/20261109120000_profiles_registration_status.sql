-- =============================================================================
-- Registrazione studenti con approvazione admin
-- - status: pending | active | rejected | suspended
-- - first_name, last_name, class_name, rejection_reason
-- - handle_new_user forza sempre ruolo studente (mai admin da metadata)
-- - RLS: solo utenti active possono scrivere contenuti riservati
-- =============================================================================

create type public.profile_status as enum (
  'pending',
  'active',
  'rejected',
  'suspended'
);

alter table public.profiles
  add column if not exists status public.profile_status not null default 'pending',
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists class_name text,
  add column if not exists rejection_reason text;

-- Account già esistenti (creati manualmente) restano operativi
update public.profiles
set status = 'active'
where status = 'pending';

-- Popola first/last da full_name se assenti
update public.profiles
set
  first_name = coalesce(
    nullif(trim(first_name), ''),
    nullif(split_part(trim(coalesce(full_name, '')), ' ', 1), '')
  ),
  last_name = coalesce(
    nullif(trim(last_name), ''),
    nullif(
      trim(substring(trim(coalesce(full_name, '')) from position(' ' in trim(coalesce(full_name, '')) || ' ') + 1)),
      ''
    )
  )
where first_name is null or last_name is null;

create index if not exists profiles_status_idx on public.profiles (status);
create index if not exists profiles_role_status_idx on public.profiles (role, status);

-- Helper: utente autenticato con status active
create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'active'
  );
$$;

-- Admin effettivo: ruolo admin + status active
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

-- Alla registrazione: SEMPRE ruolo studente e status pending.
-- Role/status da metadata sono ignorati (niente escalation admin / auto-attivazione).
-- Dopo createUser da pannello admin, una Server Action (service role) promuove ad active.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_first text;
  meta_last text;
  meta_class text;
  meta_full text;
begin
  meta_first := nullif(trim(coalesce(new.raw_user_meta_data->>'first_name', '')), '');
  meta_last := nullif(trim(coalesce(new.raw_user_meta_data->>'last_name', '')), '');
  meta_class := nullif(trim(coalesce(new.raw_user_meta_data->>'class_name', '')), '');
  meta_full := nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), '');

  if meta_full is null and (meta_first is not null or meta_last is not null) then
    meta_full := trim(concat_ws(' ', meta_first, meta_last));
  end if;

  if meta_first is null and meta_full is not null then
    meta_first := split_part(meta_full, ' ', 1);
    meta_last := nullif(
      trim(substring(meta_full from length(meta_first) + 2)),
      ''
    );
  end if;

  insert into public.profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    class_name,
    role,
    status
  )
  values (
    new.id,
    new.email,
    coalesce(meta_full, ''),
    meta_first,
    meta_last,
    meta_class,
    'studente', -- MAI da metadata
    'pending'   -- attivazione solo da admin / SQL
  );

  return new;
end;
$$;

-- Impedisce self-update di role e status
drop policy if exists "Profili: aggiornamento del proprio profilo (no role self-escalation)"
  on public.profiles;

create policy "Profili: aggiornamento del proprio profilo (no role/status self-escalation)"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() and public.is_active_user())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and status = (select p.status from public.profiles p where p.id = auth.uid())
  );

-- Articoli: studente non-active non crea/modifica
drop policy if exists "Articoli: studente crea bozze proprie" on public.articles;
create policy "Articoli: studente crea bozze proprie"
  on public.articles for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and public.is_active_user()
    and (
      public.is_admin()
      or status in ('bozza', 'in_revisione')
    )
  );

drop policy if exists "Articoli: studente modifica i propri non pubblicati" on public.articles;
create policy "Articoli: studente modifica i propri non pubblicati"
  on public.articles for update
  to authenticated
  using (
    public.is_admin()
    or (
      author_id = auth.uid()
      and public.is_active_user()
      and status <> 'pubblicato'
    )
  )
  with check (
    public.is_admin()
    or (
      author_id = auth.uid()
      and public.is_active_user()
      and status in ('bozza', 'in_revisione')
    )
  );

drop policy if exists "Articoli: admin elimina; studente elimina bozze proprie" on public.articles;
create policy "Articoli: admin elimina; studente elimina bozze proprie"
  on public.articles for delete
  to authenticated
  using (
    public.is_admin()
    or (
      author_id = auth.uid()
      and public.is_active_user()
      and status = 'bozza'
    )
  );

-- Autori / immagini / fonti: richiedono utente active per scrittura
drop policy if exists "Autori articolo: scrittura owner/admin" on public.article_authors;
create policy "Autori articolo: scrittura owner/admin"
  on public.article_authors for all
  to authenticated
  using (
    public.is_admin()
    or (
      public.is_active_user()
      and exists (
        select 1 from public.articles a
        where a.id = article_id
          and a.author_id = auth.uid()
          and a.status <> 'pubblicato'
      )
    )
  )
  with check (
    public.is_admin()
    or (
      public.is_active_user()
      and exists (
        select 1 from public.articles a
        where a.id = article_id
          and a.author_id = auth.uid()
          and a.status in ('bozza', 'in_revisione')
      )
    )
  );

drop policy if exists "Immagini: scrittura owner/admin" on public.article_images;
create policy "Immagini: scrittura owner/admin"
  on public.article_images for all
  to authenticated
  using (
    public.is_admin()
    or (
      public.is_active_user()
      and exists (
        select 1 from public.articles a
        where a.id = article_id
          and a.author_id = auth.uid()
          and a.status <> 'pubblicato'
      )
    )
  )
  with check (
    public.is_admin()
    or (
      public.is_active_user()
      and exists (
        select 1 from public.articles a
        where a.id = article_id
          and a.author_id = auth.uid()
          and a.status in ('bozza', 'in_revisione')
      )
    )
  );

drop policy if exists "Fonti: scrittura owner/admin" on public.article_sources;
create policy "Fonti: scrittura owner/admin"
  on public.article_sources for all
  to authenticated
  using (
    public.is_admin()
    or (
      public.is_active_user()
      and exists (
        select 1 from public.articles a
        where a.id = article_id
          and a.author_id = auth.uid()
          and a.status <> 'pubblicato'
      )
    )
  )
  with check (
    public.is_admin()
    or (
      public.is_active_user()
      and exists (
        select 1 from public.articles a
        where a.id = article_id
          and a.author_id = auth.uid()
          and a.status in ('bozza', 'in_revisione')
      )
    )
  );

-- Storage upload: solo utenti active
drop policy if exists "Storage immagini: upload autenticati" on storage.objects;
create policy "Storage immagini: upload autenticati"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'article-images'
    and public.is_active_user()
    and (public.is_admin() or auth.uid()::text = (storage.foldername(name))[1])
  );

drop policy if exists "Storage immagini: update owner/admin" on storage.objects;
create policy "Storage immagini: update owner/admin"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'article-images'
    and public.is_active_user()
    and (public.is_admin() or auth.uid()::text = (storage.foldername(name))[1])
  );

drop policy if exists "Storage immagini: delete owner/admin" on storage.objects;
create policy "Storage immagini: delete owner/admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'article-images'
    and public.is_active_user()
    and (public.is_admin() or auth.uid()::text = (storage.foldername(name))[1])
  );
