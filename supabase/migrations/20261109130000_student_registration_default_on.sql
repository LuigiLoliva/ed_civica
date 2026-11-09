-- Uso scolastico: la registrazione autonoma è attiva di default.
-- Gli account restano "pending" fino all'approvazione admin in /admin/utenti.
-- L'admin può comunque disattivare l'interruttore da /admin/impostazioni.

alter table public.site_settings
  alter column student_registration_enabled set default true;

update public.site_settings
set student_registration_enabled = true,
    updated_at = now()
where id = 1
  and student_registration_enabled is distinct from true;
