# Voci Unite

Blog scolastico di Educazione Civica su **ONU** e **Agenda 2030**, con approfondimento sugli **Obiettivi 16** (Pace, giustizia e istituzioni solide) e **17** (Partnership per gli obiettivi).

Stack: **Next.js 15** (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Vercel.

> Nome e dati scuola sono configurabili in [`src/lib/site-config.ts`](src/lib/site-config.ts).

---

## Stato del progetto

| Fase | Contenuto | Stato |
|------|-----------|--------|
| 1 | Fondamenta (app, design system, schema DB/RLS, auth) | Branch `cursor/voci-unite-fondamenta-1c73` (fonte di verità shell/token/Supabase) |
| 2 | Sito pubblico (home, articoli, progetto) | PR parallela — **riallineare sulla fondazione**, vedi [`docs/REBASE-PR1.md`](docs/REBASE-PR1.md) |
| 3 | Pannello admin / studenti | Da fare |
| 4 | Commenti + anti-spam | Da fare |
| 5 | Quiz e mini-giochi | Da fare |
| 6 | Privacy, test, deploy finale | Da fare |

> **Non mergiare alla cieca** la scaffold parallela del sito pubblico insieme a questa fondazione: usano due setup Next diversi. Merge prima la fondazione, poi rebase del sito pubblico come da guida.

---

## Requisiti

- Node.js 20+ (consigliato 22)
- Account [Supabase](https://supabase.com) (piano gratuito ok)
- Account [Vercel](https://vercel.com) per il deploy
- (Opzionale) [Supabase CLI](https://supabase.com/docs/guides/cli) per applicare le migrazioni

---

## Installazione locale

```bash
git clone https://github.com/LuigiLoliva/ed_civica.git
cd ed_civica
npm install
cp .env.example .env.local
```

Compila `.env.local` con i valori del progetto Supabase (vedi sotto), poi:

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

Script utili:

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Server di sviluppo (Turbopack) |
| `npm run build` | Build di produzione |
| `npm run start` | Avvia la build |
| `npm run lint` | ESLint |

---

## Configurazione Supabase (passo-passo)

1. Crea un progetto su [supabase.com](https://supabase.com) (regione EU se possibile).
2. In **Project Settings → API** copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (**solo server**, non esporre al browser)
3. Applica lo schema:
   - **Opzione A (SQL Editor)**: apri `supabase/migrations/20261109000001_init_schema.sql`, incolla ed esegui; poi esegui `supabase/seed/01_topics.sql`.
   - **Opzione B (CLI)**: `supabase login` → `supabase link --project-ref <REF>` → `supabase db push` → esegui il seed.
4. In **Authentication → Providers** lascia attivo Email/Password.
5. Disattiva (o limita) le registrazioni pubbliche se vuoi creare solo account da docente: in Fase 3 gli admin creeranno gli account studenti dal pannello.
6. Verifica in **Storage** che esista il bucket pubblico `article-images` (creato dalla migrazione).

### Creare il primo account admin

1. Crea un utente da **Authentication → Users → Add user** (email + password).
2. Nel **SQL Editor** promuovi il profilo:

```sql
update public.profiles
set role = 'admin',
    full_name = 'Nome Cognome Docente'
where email = 'tua.email@scuola.it';
```

3. Accedi da `/auth/login` con email e password. Il middleware protegge `/admin`; dopo il login vedi ruolo e link di logout. Senza variabili Supabase, `/admin` resta ispezionabile in anteprima locale.

---

## Variabili d'ambiente

Vedi [`.env.example`](.env.example). Su Vercel imposta le stesse chiavi in **Project → Settings → Environment Variables**.

| Variabile | Dove | Note |
|-----------|------|------|
| `NEXT_PUBLIC_SITE_URL` | Client/Server | URL canonico (es. `https://voci-unite.vercel.app`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Client/Server | URL progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client/Server | Chiave anon (RLS attiva) |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo server | Bypass RLS: usarla solo in Server Actions controllate |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Client | Fase 4 — Cloudflare Turnstile |
| `TURNSTILE_SECRET_KEY` | Solo server | Fase 4 |

**Non inventare e non condividere secret.** Se una chiave è stata esposta, ruotala subito dalla dashboard Supabase.

---

## Struttura cartelle (sintesi)

```
src/
  app/
    (public)/          # Sito pubblico (home, articoli, gioca, progetto, privacy)
    admin/             # Pannello riservato
    auth/              # Login e callback Supabase
  components/          # UI (shadcn), layout, icone SVG
  lib/
    site-config.ts     # Nome sito, scuola, colori, limiti
    supabase/          # Client browser, server, middleware
    validations/       # Schema Zod
  types/database.ts    # Tipi allineati allo schema SQL
supabase/
  migrations/          # Schema + RLS
  seed/                # Argomenti iniziali
```

---

## Design system

- **Primario (ONU):** `#009EDB`
- **Obiettivo 16:** `#00689D`
- **Obiettivo 17:** `#19486A`
- **Font titoli:** Fraunces (serif)
- **Font interfaccia:** Inter (sans)
- Componenti: shadcn/ui + token CSS in `src/app/globals.css`
- Motivi SVG leggeri: ulivo, globo, rete, bilancia (`src/components/icons/onu-motifs.tsx`)

---

## Deploy su Vercel

1. Importa il repository GitHub su Vercel.
2. Framework preset: Next.js.
3. Imposta le variabili d'ambiente (come sopra).
4. Deploy. Ad ogni push su `main` Vercel ricostruisce il sito.
5. In Supabase → Authentication → URL Configuration aggiungi l'URL di produzione e `https://<progetto>.vercel.app/auth/callback`.

---

## Guida d'uso (anteprima)

### Docenti (ruolo `admin`)
- Pubblicano/depubblicano articoli, gestiscono argomenti, utenti, commenti e quiz.
- Flusso articolo: **bozza → in revisione → pubblicato**.

### Studenti (ruolo `studente`)
- Creano e modificano **solo i propri** articoli non pubblicati.
- Possono inviare un articolo **in revisione**; la pubblicazione è riservata ai docenti.

### Visitatori
- Leggono articoli pubblicati, giocano ai quiz/giochi, lasciano commenti (moderati).

> Pannello completo, commenti, quiz e seed articoli: fasi successive della roadmap.

---

## Privacy e contenuti

- Raccogliere il minimo di dati personali (scuola con possibili minorenni).
- Pagine stub: `/privacy` e `/cookie` — **da far validare** a dirigente/docente referente.
- Immagini: solo materiale proprio, libero da diritti o con licenza; crediti obbligatori.
- Testi e quiz generati dall’IA vanno **verificati** su fonti ufficiali (un.org, sdgs.un.org, ASviS, MAECI).

---

## Licenza / progetto scolastico

Progetto didattico. Aggiornare scuola, classe e docenti in `src/lib/site-config.ts` prima del lancio.
