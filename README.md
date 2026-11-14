# Voci Unite

Blog scolastico di Educazione Civica su **ONU** e **Agenda 2030**, con approfondimento sugli **Obiettivi 16** (Pace, giustizia e istituzioni solide) e **17** (Partnership per gli obiettivi).

Stack: **Next.js 15** (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Vercel · Vitest · Playwright.

> Nome, scuola, footer, logo e interruttori si modificano da **Admin → Impostazioni** (`/admin/impostazioni`). Nav/colori statici restano in [`src/lib/site-config.ts`](src/lib/site-config.ts).

---

## Stato del progetto

| Fase | Contenuto | Stato |
|------|-----------|--------|
| 1 | Fondamenta (app, design system, schema DB/RLS, auth) | Completata |
| 2 | Sito pubblico (home, articoli, progetto) | Completata (mock) |
| 3 | Pannello admin / studenti | Completata (mock + shell Supabase) |
| 4 | Commenti + anti-spam | Completata (store locale / stub Turnstile) |
| 5 | Quiz e mini-giochi | Completata |
| 6 | Privacy, test, a11y/SEO, deploy docs | Completata (questa fase) |

**Blocco operativo:** per pubblicare online con login reale, commenti persistenti e storage immagini serve un **progetto Supabase** (e variabili Vercel). Senza di esso il sito pubblico funziona con dati mock.

---

## Requisiti

- Node.js 20+ (consigliato 22)
- Account [Supabase](https://supabase.com) (piano gratuito ok) per auth/DB/storage
- Account [Vercel](https://vercel.com) per il deploy
- (Opzionale) [Supabase CLI](https://supabase.com/docs/guides/cli) per applicare le migrazioni
- (Opzionale) browser Chromium per i test Playwright (`npx playwright install chromium`)

---

## Installazione locale

```bash
git clone https://github.com/LuigiLoliva/ed_civica.git
cd ed_civica
npm install
cp .env.example .env.local
```

Compila `.env.local` **solo** con valori del tuo progetto (vedi sotto). Per esplorare il sito pubblico mock puoi avviare anche senza chiavi Supabase:

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

### Script utili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Server di sviluppo (Turbopack) |
| `npm run build` | Build di produzione |
| `npm run start` | Avvia la build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm test` | Test unitari Vitest |
| `npm run test:e2e` | Smoke e2e Playwright (sito pubblico mock) |

---

## Configurazione Supabase (passo-passo)

1. Crea un progetto su [supabase.com](https://supabase.com) (regione **EU** se possibile).
2. In **Project Settings → API** copia nel `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (**solo server**, mai nel browser né in commit)
3. Applica lo schema SQL:
   - **Opzione A (SQL Editor)**: esegui in ordine
     1. `supabase/migrations/20261109000001_init_schema.sql`
     2. `supabase/migrations/20261109000002_comment_reports.sql`
     3. `supabase/migrations/20261109000003_quiz_fase5_columns.sql`
     4. `supabase/migrations/20261109000004_comments_fix_and_site_settings.sql`
     5. `supabase/migrations/20261109110000_site_settings_expand.sql`
     6. `supabase/migrations/20261109120000_profiles_registration_status.sql`
     7. `supabase/migrations/20261109130000_student_registration_default_on.sql`
     8. `supabase/migrations/20261114000001_comments_public_slug_rls.sql` (commenti su articoli mock + RPC)
     9. `supabase/seed/01_topics.sql`
     10. `supabase/seed/03_site_settings.sql` (esempi scuola/docenti modificabili)
   - **Opzione B (CLI)**: `supabase login` → `supabase link --project-ref <REF>` → `supabase db push` → esegui i seed.
4. In **Authentication → Providers** lascia attivo Email/Password. Consigliata la conferma email.
5. La **registrazione studenti** è **attiva di default** (pagina `/registrati`). Gli account restano `pending` finché un docente non li approva in **Utenti**. Per disattivarla: **Admin → Impostazioni** → interruttore «Registrazione studenti» → **Salva modifiche**. Il sito forza comunque `role=studente` e `status=pending` (nessuna escalation ad admin).
6. Verifica in **Storage** i bucket pubblici `article-images` e `site-assets` (logo/favicon).
7. (Produzione) Configura **URL Configuration** con il dominio Vercel e i redirect `/auth/callback` e `/auth/reset-password`.

### Creare il primo account admin

1. **Authentication → Users → Add user** (email + password).
2. Nel **SQL Editor** promuovi il profilo (ruolo **e** status attivo):

```sql
update public.profiles
set role = 'admin',
    status = 'active',
    full_name = 'Nome Cognome Docente',
    first_name = 'Nome',
    last_name = 'Cognome Docente'
where email = 'tua.email@scuola.it';
```

3. Accedi da `/auth/login`. Solo account con `status = 'active'` entrano in `/admin`.
4. Senza variabili Supabase, `/admin` resta ispezionabile in anteprima locale (mock).

### Approvare gli studenti (guida docenti)

1. Con registrazione attiva (default), gli studenti usano `/registrati`. Per spegnerla: **Impostazioni** → interruttore → **Salva**.
2. Gli studenti si registrano → account in stato **pending** (non possono accedere al pannello).
3. In **Utenti** (`/admin/utenti`) apri **Richieste di registrazione** (badge nel menu): **Approva**, **Rifiuta** (motivo opzionale), **Elimina**, oppure approva più richieste insieme.
4. Dopo l’approvazione lo studente accede con email/password. Puoi **Sospendere** / **Riattivare** in qualsiasi momento, **creare studenti manualmente** (già attivi) o eliminare del tutto un account.
5. Email di notifica (opzionali): se imposti `RESEND_API_KEY` (e opzionalmente `RESEND_FROM`) il sistema avvisa admin e studente; senza queste variabili il flusso funziona comunque con il badge in Utenti.

---

## Variabili d'ambiente

Vedi [`.env.example`](.env.example). Su Vercel imposta le stesse chiavi in **Project → Settings → Environment Variables**.

| Variabile | Dove | Note |
|-----------|------|------|
| `NEXT_PUBLIC_SITE_URL` | Client/Server | URL canonico (es. `https://tuo-progetto.vercel.app`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Client/Server | URL progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client/Server | Chiave anon (RLS attiva) |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo server | Bypass RLS: solo in Server Actions controllate |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Client | Cloudflare Turnstile (opzionale) |
| `TURNSTILE_SECRET_KEY` | Solo server | Opzionale: senza chiave la verifica è saltata (rate-limit attivo) |
| `TURNSTILE_BYPASS` | Server | Solo sviluppo (`true`); ignorato in produzione |
| `COMMENT_IP_HASH_SALT` | Server | Sale per hash IP commenti |
| `RESEND_API_KEY` | Solo server | Opzionale: email approvazione/registrazione |
| `RESEND_FROM` | Solo server | Opzionale: mittente Resend (default onboarding@resend.dev) |

**Non inventare e non condividere secret.** Se una chiave è stata esposta, ruotala subito dalla dashboard Supabase / Cloudflare.

---

## Deploy su Vercel

1. Importa il repository GitHub su Vercel (framework: Next.js).
2. Imposta le variabili d'ambiente (come sopra), **senza** lasciare placeholder vuoti in produzione per Supabase.
3. Deploy. Ad ogni push su `main` Vercel ricostruisce il sito.
4. In Supabase → Authentication → URL Configuration aggiungi:
   - Site URL di produzione
   - Redirect: `https://<progetto>.vercel.app/auth/callback`
5. Verifica `/privacy`, `/cookie`, login admin e un articolo di prova.

---

## Guida d'uso

### Docenti (ruolo `admin`)

- Accedono da **Area riservata** (`/auth/login`).
- Pubblicano / depubblicano articoli, gestiscono argomenti, utenti, commenti e quiz.
- Flusso articolo: **bozza → in revisione → pubblicato**.
- Moderano i commenti in `/admin/commenti` (approva, rifiuta, elimina, segnalazioni; badge nel menu).
- Aggiornano nome sito, scuola, indirizzo, docenti, social, footer, pagina «Il progetto», logo/favicon e interruttori (moderazione commenti, registrazione studenti) in `/admin/impostazioni`.
- Validano Privacy/Cookie Policy e contenuti (testi, quiz, immagini) prima del lancio pubblico.

### Studenti (ruolo `studente`)

- Con registrazione attiva: `/registrati` → attesa approvazione docente → accesso.
- Creano e modificano **solo i propri** articoli non pubblicati (solo se `status=active`).
- Inseriscono autori (precompilati da nome/cognome del profilo), fonti (≥1), immagini (max 4, con alt text e crediti).
- Inviaono l'articolo **in revisione**; la pubblicazione è riservata ai docenti.
- Non gestiscono utenti, argomenti globali né moderazione commenti.

### Visitatori

- Leggono articoli pubblicati, giocano a quiz/mini-giochi, lasciano commenti (moderati).
- Consultano Privacy e Cookie Policy dal footer.
- Nessun login richiesto per leggere e giocare.

---

## Test

```bash
# Validazioni Zod, sanitizzazione commenti, rate-limit stub
npm test

# Smoke e2e pubblico (mock, senza Supabase live)
npx playwright install chromium   # solo la prima volta
npm run test:e2e
```

Il flusso e2e completo *studente crea → admin pubblica → articolo visibile* richiede Supabase reale e seed; lo smoke attuale verifica home, privacy/cookie, articoli mock, robots/sitemap e raggiungibilità di login/admin.

---

## Privacy e accessibilità

- Pagine `/privacy` e `/cookie` con testo base italiano **da far validare** a dirigente / docente referente / DPO.
- Avviso cookie tecnico dismissibile (nessun tracking pubblicitario).
- Skip link, menu mobile, `lang="it"`, header di sicurezza, metadata SEO/Open Graph, `robots.ts` e `sitemap.ts`.
- `prefers-reduced-motion` rispettato dove ci sono animazioni.

---

## Struttura cartelle (sintesi)

```
src/
  app/(public)/     # Home, articoli, gioca, progetto, privacy, cookie
  app/admin/        # Pannello riservato
  app/auth/         # Login e callback
  components/       # UI, layout, giochi, quiz, commenti
  lib/              # site-config, site-settings, supabase, validations, comments
  data/             # Seed quiz e giochi (+ fallback locale impostazioni)
supabase/           # Migrazioni SQL + seed
tests/              # Vitest
e2e/                # Playwright
```

---

## Design system

- **Primario (ONU):** `#009EDB`
- **Obiettivo 16:** `#00689D`
- **Obiettivo 17:** `#19486A`
- **Font titoli:** Fraunces · **Interfaccia:** Inter
- Token CSS in `src/app/globals.css` · motivi SVG in `src/components/icons/onu-motifs.tsx`

---

## Licenza / progetto scolastico

Progetto didattico. Aggiornare scuola, classe e docenti da **Admin → Impostazioni** prima del lancio. I contenuti generati dall’IA vanno **verificati** su fonti ufficiali (un.org, sdgs.un.org, ASviS, MAECI).
