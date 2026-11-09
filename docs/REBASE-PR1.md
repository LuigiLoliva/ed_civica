# Allineamento PR #1 (sito pubblico) sulla fondazione

**Fonte di verità per shell app, token, shadcn, Supabase, RLS:**  
branch `cursor/voci-unite-fondamenta-1c73` / PR #2 — **non** la scaffold parallela di PR #1.

PR #1 (`cursor/voci-unite-sito-pubblico-5004`) riparte da `main` greenfield con un secondo scaffold Next (mock data, Tailwind custom, **senza** shadcn/Supabase). **Non unire entrambe le PR su `main` alla cieca**: genererebbero conflitti massivi su `package.json`, `layout`, `globals.css`, `site-config`, route pubbliche.

## Ordine consigliato

1. **Merge prima la fondazione (PR #2)** su `main`.
2. **Poi** riallinea PR #1 sopra `main` aggiornato (o stacked su #2 se usate stack PR).

## Come riallineare PR #1 (dopo merge di #2)

```bash
git fetch origin
git checkout cursor/voci-unite-sito-pubblico-5004
git rebase origin/main
# In caso di conflitti: tenere i file di fondazione per
# package.json, lockfile, globals.css, layout root, site-config,
# lib/supabase/*, middleware, supabase/*, components/ui/*
# e riportare SOLO le UI/pagine pubbliche + mock/data da #1.
```

### Cosa portare da #1
- Componenti e pagine pubbliche ricche: home (stats animate), card articoli, filtri, dettaglio articolo, progetto, gioca (UI)
- `src/lib/mock-data.ts` (finché non c’è seed Supabase) adattato ai tipi in `src/types/database.ts`
- Eventuali miglioramenti copy / SEO delle pagine

### Cosa NON sovrascrivere dalla scaffold #1
- `package.json` / lockfile (dipendenze shadcn, Supabase, RHF, Zod, …)
- `src/app/globals.css` e token shadcn
- `src/lib/site-config.ts` della fondazione (estendere, non sostituire)
- `src/lib/supabase/**`, `src/middleware.ts`, `supabase/**`
- `src/components/ui/**` (shadcn)
- Struttura route group `(public)/` della fondazione: migrare le pagine #1 sotto `src/app/(public)/…`

### Alternativa stack (prima del merge)
Se PR #2 non è ancora mergiata:

```bash
git checkout cursor/voci-unite-sito-pubblico-5004
git rebase origin/cursor/voci-unite-fondamenta-1c73
```

Stesso criterio di risoluzione conflitti.

## Criterio di accettazione dopo rebase
- `npm run build` ok sulla base fondazione
- Home/articoli di #1 usano token `primary` / `goal-16` / `goal-17` e componenti shadcn dove sensato
- Nessun secondo design system parallelo
