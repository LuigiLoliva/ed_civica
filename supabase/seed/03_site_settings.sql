-- Seed impostazioni del sito (esempio chiaramente modificabile dall'admin).
-- Eseguire dopo supabase/migrations/20261109110000_site_settings.sql
-- ATTENZIONE: valori dimostrativi — sostituirli da /admin/impostazioni.

insert into public.site_settings (
  id,
  site_name,
  tagline,
  description,
  school_name,
  school_address,
  school_city,
  school_province,
  class_name,
  school_year,
  teachers,
  contact_email,
  social_links,
  footer_html,
  project_html,
  comments_moderation_enabled,
  student_registration_enabled
) values (
  1,
  'Voci Unite',
  'Blog scolastico su ONU e Agenda 2030',
  'Progetto di Educazione Civica dedicato all''Organizzazione delle Nazioni Unite e agli Obiettivi di Sviluppo Sostenibile 16 e 17.',
  'I.I.S. Esempio — da aggiornare',
  'Via della Scuola 1',
  'Città esempio',
  'XX',
  '3ª A',
  '2025/2026',
  '[
    {"name": "Maria Rossi", "role": "Docente referente"},
    {"name": "Luca Bianchi", "role": "Co-referente Educazione Civica"}
  ]'::jsonb,
  'progetto.vociunite@scuola-esempio.it',
  '{
    "instagram": "https://www.instagram.com/",
    "schoolWebsite": "https://www.istruzione.it/"
  }'::jsonb,
  '<p>Progetto scolastico di Educazione Civica · Contenuti da verificare con i docenti. Modifica questo testo da <strong>Admin → Impostazioni</strong>.</p>',
  '<p>Vogliamo trasformare lo studio dell''ONU in un laboratorio digitale: articoli con fonti, commenti moderati, quiz e giochi che aiutino a capire pace, giustizia e partnership.</p><p><em>Testo di esempio — modifica da Admin → Impostazioni.</em></p>',
  true,
  true
)
on conflict (id) do update set
  site_name = excluded.site_name,
  tagline = excluded.tagline,
  description = excluded.description,
  school_name = excluded.school_name,
  school_address = excluded.school_address,
  school_city = excluded.school_city,
  school_province = excluded.school_province,
  class_name = excluded.class_name,
  school_year = excluded.school_year,
  teachers = excluded.teachers,
  contact_email = excluded.contact_email,
  social_links = excluded.social_links,
  footer_html = excluded.footer_html,
  project_html = excluded.project_html,
  comments_moderation_enabled = excluded.comments_moderation_enabled,
  student_registration_enabled = excluded.student_registration_enabled,
  updated_at = now();
