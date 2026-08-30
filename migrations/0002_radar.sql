-- Radar: per-user freelance lead desk
create table if not exists services (
  id          serial primary key,
  user_id     text not null,
  slug        text not null,
  name        text not null,
  category    text not null,
  blurb       text not null default '',
  rate_label  text not null default '',
  hunt_hint   text not null default '',
  sort_order  int not null default 0,
  active      boolean not null default true
);
create unique index if not exists services_user_slug_idx on services (user_id, slug);
create index if not exists services_user_id_idx on services (user_id);

create table if not exists leads (
  id            serial primary key,
  user_id       text not null,
  name          text not null,
  company       text not null default '',
  role_title    text not null default '',
  contact       text not null default '',
  source        text not null default 'manual',
  service_id    int,
  stage         text not null default 'new',
  value_usd     int not null default 0,
  score         int not null default 50,
  why           text not null default '',
  angle         text not null default '',
  next_action   text not null default '',
  follow_up_on  date,
  notes         text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists leads_user_id_idx on leads (user_id);
create index if not exists leads_user_stage_idx on leads (user_id, stage);
create index if not exists leads_user_follow_idx on leads (user_id, follow_up_on);

create table if not exists drafts (
  id          serial primary key,
  user_id     text not null,
  lead_id     int not null,
  channel     text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists drafts_user_lead_idx on drafts (user_id, lead_id);
