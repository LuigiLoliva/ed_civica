-- =============================================================================
-- Voci Unite — schema iniziale + Row Level Security
-- Obiettivi 16 e 17 · Agenda 2030
-- Eseguire nel SQL Editor di Supabase oppure via CLI: supabase db push
-- =============================================================================

-- Estensioni utili
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tipi enumerati
-- -----------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'studente');
create type public.article_status as enum ('bozza', 'in_revisione', 'pubblicato');
create type public.comment_status as enum ('in_attesa', 'approvato', 'rifiutato');
create type public.quiz_difficulty as enum ('facile', 'medio', 'difficile');
create type public.quiz_question_type as enum (
  'scelta_multipla',
  'vero_falso',
  'risposta_multipla'
);

-- -----------------------------------------------------------------------------
-- Funzioni helper (senza dipendenza da tabelle)
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles (1:1 con auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.user_role not null default 'studente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Helper RLS: dopo profiles (LANGUAGE sql risolve le relazioni a CREATE time)
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Alla registrazione crea il profilo (ruolo default: studente)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'studente')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- topics (argomenti)
-- -----------------------------------------------------------------------------
create table public.topics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  color text not null default '#009EDB',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint topics_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index topics_sort_order_idx on public.topics (sort_order);

create trigger topics_set_updated_at
  before update on public.topics
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- articles
-- -----------------------------------------------------------------------------
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  body text not null default '',
  status public.article_status not null default 'bozza',
  topic_id uuid not null references public.topics (id) on delete restrict,
  author_id uuid not null references public.profiles (id) on delete restrict,
  featured boolean not null default false,
  reading_time_minutes int not null default 1
    check (reading_time_minutes >= 1),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint articles_excerpt_len check (char_length(excerpt) <= 200),
  constraint articles_published_requires_date check (
    status <> 'pubblicato' or published_at is not null
  )
);

create index articles_status_idx on public.articles (status);
create index articles_topic_id_idx on public.articles (topic_id);
create index articles_author_id_idx on public.articles (author_id);
create index articles_published_at_idx on public.articles (published_at desc);
create index articles_featured_idx on public.articles (featured)
  where featured = true;

create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- Solo gli admin possono impostare lo stato "pubblicato"
create or replace function public.enforce_article_publish_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'pubblicato'
     and (tg_op = 'INSERT' or old.status is distinct from 'pubblicato')
     and not public.is_admin() then
    raise exception 'Solo un admin può pubblicare un articolo';
  end if;

  if new.featured is true
     and (tg_op = 'INSERT' or old.featured is distinct from true)
     and not public.is_admin() then
    raise exception 'Solo un admin può mettere un articolo in evidenza';
  end if;

  return new;
end;
$$;

create trigger articles_enforce_publish
  before insert or update on public.articles
  for each row execute function public.enforce_article_publish_role();

-- -----------------------------------------------------------------------------
-- article_authors (nome e cognome degli autori dello scritto)
-- -----------------------------------------------------------------------------
create table public.article_authors (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  first_name text not null check (char_length(trim(first_name)) > 0),
  last_name text not null check (char_length(trim(last_name)) > 0),
  sort_order int not null default 0
);

create index article_authors_article_id_idx on public.article_authors (article_id);

-- -----------------------------------------------------------------------------
-- article_images (max 4 per articolo — vincolo DB)
-- -----------------------------------------------------------------------------
create table public.article_images (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  storage_path text not null,
  alt_text text not null check (char_length(trim(alt_text)) > 0),
  caption text,
  credit text,
  is_cover boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index article_images_article_id_idx on public.article_images (article_id);

-- Al massimo una copertina per articolo
create unique index article_images_one_cover_idx
  on public.article_images (article_id)
  where is_cover = true;

-- Trigger: massimo 4 immagini per articolo
create or replace function public.enforce_max_four_images()
returns trigger
language plpgsql
as $$
declare
  image_count int;
begin
  select count(*) into image_count
  from public.article_images
  where article_id = new.article_id
    and (tg_op = 'INSERT' or id <> new.id);

  if image_count >= 4 then
    raise exception 'Massimo 4 immagini per articolo';
  end if;

  return new;
end;
$$;

create trigger article_images_max_four
  before insert on public.article_images
  for each row execute function public.enforce_max_four_images();

-- -----------------------------------------------------------------------------
-- article_sources (almeno 1 fonte obbligatorio a livello applicativo;
--                  il DB garantisce URL e campi non vuoti)
-- -----------------------------------------------------------------------------
create table public.article_sources (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  url text not null check (url ~* '^https?://'),
  consulted_at date not null,
  sort_order int not null default 0
);

create index article_sources_article_id_idx on public.article_sources (article_id);

-- -----------------------------------------------------------------------------
-- comments
-- -----------------------------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  parent_id uuid references public.comments (id) on delete cascade,
  author_name text not null check (char_length(trim(author_name)) between 1 and 80),
  author_email text,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  status public.comment_status not null default 'in_attesa',
  reported boolean not null default false,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_article_id_idx on public.comments (article_id);
create index comments_status_idx on public.comments (status);
create index comments_parent_id_idx on public.comments (parent_id);

create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

-- Impedisce risposte a risposte (solo 1 livello)
create or replace function public.enforce_comment_nesting()
returns trigger
language plpgsql
as $$
declare
  parent_parent uuid;
begin
  if new.parent_id is not null then
    select parent_id into parent_parent
    from public.comments
    where id = new.parent_id;

    if parent_parent is not null then
      raise exception 'I commenti ammettono un solo livello di risposta';
    end if;
  end if;
  return new;
end;
$$;

create trigger comments_enforce_nesting
  before insert on public.comments
  for each row execute function public.enforce_comment_nesting();

-- -----------------------------------------------------------------------------
-- quizzes / questions / options
-- -----------------------------------------------------------------------------
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  topic_id uuid references public.topics (id) on delete set null,
  difficulty public.quiz_difficulty not null default 'medio',
  published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quizzes_published_idx on public.quizzes (published);

create trigger quizzes_set_updated_at
  before update on public.quizzes
  for each row execute function public.set_updated_at();

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  prompt text not null,
  question_type public.quiz_question_type not null,
  explanation text not null default '',
  source_url text,
  sort_order int not null default 0
);

create index quiz_questions_quiz_id_idx on public.quiz_questions (quiz_id);

create table public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions (id) on delete cascade,
  label text not null,
  is_correct boolean not null default false,
  sort_order int not null default 0
);

create index quiz_options_question_id_idx on public.quiz_options (question_id);

-- -----------------------------------------------------------------------------
-- game_content (payload JSON modificabile per i mini-giochi)
-- -----------------------------------------------------------------------------
create table public.game_content (
  id uuid primary key default gen_random_uuid(),
  game_key text not null unique,
  title text not null,
  description text,
  payload jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

create trigger game_content_set_updated_at
  before update on public.game_content
  for each row execute function public.set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.articles enable row level security;
alter table public.article_authors enable row level security;
alter table public.article_images enable row level security;
alter table public.article_sources enable row level security;
alter table public.comments enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options enable row level security;
alter table public.game_content enable row level security;

-- ---- profiles ----
create policy "Profili: lettura del proprio profilo"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "Profili: aggiornamento del proprio profilo (no role self-escalation)"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
  );

create policy "Profili: admin gestisce tutti"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---- topics ----
create policy "Argomenti: lettura pubblica"
  on public.topics for select
  to anon, authenticated
  using (true);

create policy "Argomenti: solo admin scrive"
  on public.topics for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---- articles ----
create policy "Articoli: pubblici se pubblicati"
  on public.articles for select
  to anon, authenticated
  using (
    status = 'pubblicato'
    or author_id = auth.uid()
    or public.is_admin()
  );

create policy "Articoli: studente crea bozze proprie"
  on public.articles for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and (
      public.is_admin()
      or status in ('bozza', 'in_revisione')
    )
  );

create policy "Articoli: studente modifica i propri non pubblicati"
  on public.articles for update
  to authenticated
  using (
    public.is_admin()
    or (author_id = auth.uid() and status <> 'pubblicato')
  )
  with check (
    public.is_admin()
    or (author_id = auth.uid() and status in ('bozza', 'in_revisione'))
  );

create policy "Articoli: admin elimina; studente elimina bozze proprie"
  on public.articles for delete
  to authenticated
  using (
    public.is_admin()
    or (author_id = auth.uid() and status = 'bozza')
  );

-- ---- article_authors / images / sources ----
-- Lettura: se l'articolo è leggibile
create policy "Autori articolo: lettura se articolo leggibile"
  on public.article_authors for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.articles a
      where a.id = article_id
        and (
          a.status = 'pubblicato'
          or a.author_id = auth.uid()
          or public.is_admin()
        )
    )
  );

create policy "Autori articolo: scrittura owner/admin"
  on public.article_authors for all
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.articles a
      where a.id = article_id
        and a.author_id = auth.uid()
        and a.status <> 'pubblicato'
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.articles a
      where a.id = article_id
        and a.author_id = auth.uid()
        and a.status in ('bozza', 'in_revisione')
    )
  );

create policy "Immagini: lettura se articolo leggibile"
  on public.article_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.articles a
      where a.id = article_id
        and (
          a.status = 'pubblicato'
          or a.author_id = auth.uid()
          or public.is_admin()
        )
    )
  );

create policy "Immagini: scrittura owner/admin"
  on public.article_images for all
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.articles a
      where a.id = article_id
        and a.author_id = auth.uid()
        and a.status <> 'pubblicato'
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.articles a
      where a.id = article_id
        and a.author_id = auth.uid()
        and a.status in ('bozza', 'in_revisione')
    )
  );

create policy "Fonti: lettura se articolo leggibile"
  on public.article_sources for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.articles a
      where a.id = article_id
        and (
          a.status = 'pubblicato'
          or a.author_id = auth.uid()
          or public.is_admin()
        )
    )
  );

create policy "Fonti: scrittura owner/admin"
  on public.article_sources for all
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.articles a
      where a.id = article_id
        and a.author_id = auth.uid()
        and a.status <> 'pubblicato'
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.articles a
      where a.id = article_id
        and a.author_id = auth.uid()
        and a.status in ('bozza', 'in_revisione')
    )
  );

-- ---- comments ----
create policy "Commenti: pubblici solo se approvati"
  on public.comments for select
  to anon, authenticated
  using (
    status = 'approvato'
    or public.is_admin()
  );

-- Gli insert pubblici passano tipicamente da Server Action con service role
-- o anon con status forzato a in_attesa. Qui consentiamo insert anon con
-- status in_attesa; l'app server deve comunque sanitizzare e rate-limitare.
create policy "Commenti: inserimento pubblico in attesa"
  on public.comments for insert
  to anon, authenticated
  with check (status = 'in_attesa' and reported = false);

create policy "Commenti: segnalazione (update reported)"
  on public.comments for update
  to anon, authenticated
  using (status = 'approvato')
  with check (reported = true);

create policy "Commenti: admin moderazione completa"
  on public.comments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---- quizzes ----
create policy "Quiz: lettura se pubblicati"
  on public.quizzes for select
  to anon, authenticated
  using (published = true or public.is_admin());

create policy "Quiz: solo admin scrive"
  on public.quizzes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Domande quiz: lettura se quiz pubblicato"
  on public.quiz_questions for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.published = true
    )
  );

create policy "Domande quiz: solo admin scrive"
  on public.quiz_questions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Opzioni quiz: lettura se quiz pubblicato"
  on public.quiz_options for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.quiz_questions qq
      join public.quizzes q on q.id = qq.quiz_id
      where qq.id = question_id and q.published = true
    )
  );

create policy "Opzioni quiz: solo admin scrive"
  on public.quiz_options for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---- game_content ----
create policy "Giochi: lettura se pubblicati"
  on public.game_content for select
  to anon, authenticated
  using (published = true or public.is_admin());

create policy "Giochi: solo admin scrive"
  on public.game_content for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- Storage: bucket immagini articoli (policy storage)
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-images',
  'article-images',
  true,
  3145728, -- 3 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Storage immagini: lettura pubblica" on storage.objects;
create policy "Storage immagini: lettura pubblica"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'article-images');

drop policy if exists "Storage immagini: upload autenticati" on storage.objects;
create policy "Storage immagini: upload autenticati"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'article-images'
    and (public.is_admin() or auth.uid()::text = (storage.foldername(name))[1])
  );

drop policy if exists "Storage immagini: update owner/admin" on storage.objects;
create policy "Storage immagini: update owner/admin"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'article-images'
    and (public.is_admin() or auth.uid()::text = (storage.foldername(name))[1])
  );

drop policy if exists "Storage immagini: delete owner/admin" on storage.objects;
create policy "Storage immagini: delete owner/admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'article-images'
    and (public.is_admin() or auth.uid()::text = (storage.foldername(name))[1])
  );
