-- Fase 5: colonne aggiuntive per quiz pubblici (slug + revisione docente).
-- Additive sulla schema fondamenta; non sostituisce 20261109000001_init_schema.sql.

alter table public.quizzes
  add column if not exists slug text;

alter table public.quizzes
  add column if not exists needs_teacher_review boolean not null default true;

-- Unique slug solo quando valorizzato (seed TS usa slug; publish admin lo compilerà).
create unique index if not exists quizzes_slug_unique_idx
  on public.quizzes (slug)
  where slug is not null;
