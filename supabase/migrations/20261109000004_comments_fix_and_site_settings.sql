-- Prompt 1: allinea limiti commenti, restringe RLS agli insert via Server Action,
-- e introduce site_settings minimale (flag moderazione; Prompt 2 espanderà i campi).

-- -----------------------------------------------------------------------------
-- Limiti allineati a Zod (nome 2-50, testo 2-1000)
-- -----------------------------------------------------------------------------
alter table public.comments
  drop constraint if exists comments_author_name_check;

alter table public.comments
  add constraint comments_author_name_check
  check (char_length(trim(author_name)) between 2 and 50);

alter table public.comments
  drop constraint if exists comments_body_check;

alter table public.comments
  add constraint comments_body_check
  check (char_length(trim(body)) between 2 and 1000);

-- -----------------------------------------------------------------------------
-- RLS: lettura pubblica solo approvati; scrittura pubblica solo via service role
-- (Server Action). Rimuove insert/update anon che bypassavano la moderazione.
-- -----------------------------------------------------------------------------
drop policy if exists "Commenti: inserimento pubblico in attesa" on public.comments;
drop policy if exists "Commenti: segnalazione (update reported)" on public.comments;

-- Select approvati + admin e moderazione admin restano in 20261109000001.

-- -----------------------------------------------------------------------------
-- site_settings (riga singola) — flag moderazione commenti
-- -----------------------------------------------------------------------------
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  comments_moderation_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

insert into public.site_settings (id, comments_moderation_enabled)
values (1, true)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "Impostazioni: lettura pubblica" on public.site_settings;
create policy "Impostazioni: lettura pubblica"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Impostazioni: solo admin scrive" on public.site_settings;
create policy "Impostazioni: solo admin scrive"
  on public.site_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

comment on table public.site_settings is
  'Impostazioni sito (riga unica). Prompt 1: solo moderazione commenti; Prompt 2 espande i campi.';
