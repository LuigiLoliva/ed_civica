-- =============================================================================
-- Prompt 2: espande site_settings (creata in 20261109000004) con i campi
-- editabili dall'admin. NON ricrea la tabella né il flag moderazione.
-- =============================================================================

alter table public.site_settings
  add column if not exists site_name text not null default 'Voci Unite';

alter table public.site_settings
  add column if not exists tagline text not null default 'Blog scolastico su ONU e Agenda 2030';

alter table public.site_settings
  add column if not exists description text not null default
    'Progetto di Educazione Civica dedicato all''Organizzazione delle Nazioni Unite e agli Obiettivi di Sviluppo Sostenibile 16 e 17.';

alter table public.site_settings
  add column if not exists school_name text not null default 'Nome della scuola';

alter table public.site_settings
  add column if not exists school_address text not null default '';

alter table public.site_settings
  add column if not exists school_city text not null default '';

alter table public.site_settings
  add column if not exists school_province text not null default '';

alter table public.site_settings
  add column if not exists class_name text not null default 'Classe';

alter table public.site_settings
  add column if not exists school_year text not null default '2025/2026';

alter table public.site_settings
  add column if not exists teachers jsonb not null default
    '[{"name":"Docente referente","role":"Referente di progetto"}]'::jsonb;

alter table public.site_settings
  add column if not exists contact_email text;

alter table public.site_settings
  add column if not exists social_links jsonb not null default '{}'::jsonb;

alter table public.site_settings
  add column if not exists footer_html text not null default
    '<p>Progetto scolastico di Educazione Civica · Contenuti da verificare con i docenti</p>';

alter table public.site_settings
  add column if not exists project_html text not null default
    '<p>Vogliamo trasformare lo studio dell''ONU in un laboratorio digitale: articoli con fonti, commenti moderati, quiz e giochi che aiutino a capire pace, giustizia e partnership.</p>';

alter table public.site_settings
  add column if not exists logo_url text;

alter table public.site_settings
  add column if not exists favicon_url text;

alter table public.site_settings
  add column if not exists student_registration_enabled boolean not null default false;

alter table public.site_settings
  add column if not exists created_at timestamptz not null default now();

-- comments_moderation_enabled resta quello di 20261109000004.

comment on table public.site_settings is
  'Impostazioni sito (riga unica). Prompt 2: contenuti generali + flag moderazione/registrazione.';

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

-- Storage: logo / favicon (max 1 MB, PNG/SVG/WebP)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  1048576,
  array['image/png', 'image/svg+xml', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Storage site-assets: lettura pubblica" on storage.objects;
create policy "Storage site-assets: lettura pubblica"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-assets');

drop policy if exists "Storage site-assets: upload admin" on storage.objects;
create policy "Storage site-assets: upload admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "Storage site-assets: update admin" on storage.objects;
create policy "Storage site-assets: update admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-assets' and public.is_admin())
  with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "Storage site-assets: delete admin" on storage.objects;
create policy "Storage site-assets: delete admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-assets' and public.is_admin());
