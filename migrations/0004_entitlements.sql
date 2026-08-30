-- Radar access: free tease vs $5 lifetime unlock
create table if not exists entitlements (
  user_id              text primary key,
  plan                 text not null default 'tease',
  stripe_customer_id   text not null default '',
  stripe_checkout_id   text not null default '',
  hunts_used           int not null default 0,
  tease_started_at     timestamptz,
  unlocked_at          timestamptz,
  updated_at           timestamptz not null default now()
);
