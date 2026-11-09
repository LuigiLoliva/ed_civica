-- Seed argomenti iniziali (eseguire dopo la migrazione).
-- ATTENZIONE: contenuti dimostrativi — da rivedere con i docenti.

insert into public.topics (name, slug, description, color, sort_order) values
  (
    'ONU: storia e struttura',
    'onu-storia-struttura',
    'Origini, Carta delle Nazioni Unite e organi principali.',
    '#009EDB',
    1
  ),
  (
    'Obiettivo 16',
    'obiettivo-16',
    'Pace, giustizia e istituzioni solide.',
    '#00689D',
    2
  ),
  (
    'Obiettivo 17',
    'obiettivo-17',
    'Partnership per gli obiettivi.',
    '#19486A',
    3
  ),
  (
    'Diritti umani',
    'diritti-umani',
    'Dichiarazione Universale e tutela internazionale dei diritti.',
    '#4A90A4',
    4
  ),
  (
    'Giustizia internazionale',
    'giustizia-internazionale',
    'Corte Internazionale di Giustizia, CPI e diritto internazionale.',
    '#2F6F8F',
    5
  ),
  (
    'Cooperazione e partnership',
    'cooperazione-partnership',
    'Cooperazione tra Stati, società civile, scuole e imprese.',
    '#3D7A9C',
    6
  ),
  (
    'Attualità',
    'attualita',
    'Notizie e approfondimenti collegati a ONU e Agenda 2030.',
    '#5B8FA8',
    7
  )
on conflict (slug) do nothing;
