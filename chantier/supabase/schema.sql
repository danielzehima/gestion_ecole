-- Schéma prévu pour la version SaaS (multi-utilisateurs, multi-chantiers).
-- Pas encore utilisé par l'application : elle stocke pour l'instant les
-- données dans le navigateur. À appliquer quand on passera sur Supabase.

create table if not exists chantiers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  morning_hour smallint not null default 7,
  evening_hour smallint not null default 17,
  rdv_lead_minutes smallint not null default 60,
  created_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  chantier_id uuid not null references chantiers (id) on delete cascade,
  type text not null check (type in ('travail', 'rdv', 'journal')),
  title text not null,
  date date not null,
  time time,
  location text default '',
  notes text default '',
  validated boolean not null default false,
  validated_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists items_chantier_date on items (chantier_id, date);

-- Rappels déjà envoyés par l'agent serveur (évite les doublons e-mail/SMS)
create table if not exists sent_reminders (
  chantier_id uuid not null references chantiers (id) on delete cascade,
  key text not null,
  sent_at timestamptz not null default now(),
  primary key (chantier_id, key)
);

alter table chantiers enable row level security;
alter table items enable row level security;
alter table sent_reminders enable row level security;

create policy "propriétaire du chantier" on chantiers
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "éléments de mes chantiers" on items
  for all using (exists (select 1 from chantiers c where c.id = chantier_id and c.owner_id = auth.uid()))
  with check (exists (select 1 from chantiers c where c.id = chantier_id and c.owner_id = auth.uid()));

create policy "rappels de mes chantiers" on sent_reminders
  for select using (exists (select 1 from chantiers c where c.id = chantier_id and c.owner_id = auth.uid()));
