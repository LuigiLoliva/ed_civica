-- Fase 4 (additiva): dettaglio segnalazioni commenti.
-- Lo schema base (`comments` + status + reported + nesting) è in 20261109000001_init_schema.sql.

create table if not exists public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments (id) on delete cascade,
  reason text not null check (char_length(trim(reason)) between 1 and 500),
  reporter_ip_hash text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists comment_reports_comment_id_idx
  on public.comment_reports (comment_id, created_at desc);

alter table public.comment_reports enable row level security;

drop policy if exists "Segnalazioni: admin gestione completa" on public.comment_reports;
create policy "Segnalazioni: admin gestione completa"
  on public.comment_reports
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

comment on table public.comment_reports is
  'Motivi di segnalazione; comments.reported resta il flag rapido lato UI.';
