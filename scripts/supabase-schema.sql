-- TRADESYS Supabase Schema — INFRA-003 Fas 1
-- Kör detta i Supabase SQL Editor (supabase.com → SQL Editor → New Query)

-- 1. WATCHLIST
create table watchlist (
  id bigint generated always as identity primary key,
  ticker text not null,
  name text not null,
  stop numeric default 0,
  up numeric default 0,
  created_at timestamptz default now()
);

-- 2. PORTFOLIO
create table portfolio (
  id bigint generated always as identity primary key,
  ticker text not null,
  name text not null,
  buy_price numeric default 0,
  stop numeric default 0,
  up numeric default 0,
  currency text default 'USD',
  created_at timestamptz default now()
);

-- 3. TRADE_LOG
create table trade_log (
  id bigint primary key, -- Date.now() from JS
  ticker text not null,
  type text not null,
  entry numeric not null,
  stop numeric not null,
  t1 numeric not null,
  score integer default 0,
  pearson_r numeric,
  regime text,
  note text,
  rr numeric,
  date date not null,
  status text default 'OPEN',
  exit_price numeric,
  outcome text, -- WIN | LOSS | SCRATCH
  pnl_pct numeric,
  created_at timestamptz default now()
);

-- 4. OBSERVATIONS
create table observations (
  id bigint generated always as identity primary key,
  datum date not null,
  ticker text,
  observation text not null,
  source text default 'Session',
  created_at timestamptz default now()
);

-- Enable Row Level Security (public read/write via anon key for single-user app)
alter table watchlist enable row level security;
alter table portfolio enable row level security;
alter table trade_log enable row level security;
alter table observations enable row level security;

create policy "Allow all for anon" on watchlist for all using (true) with check (true);
create policy "Allow all for anon" on portfolio for all using (true) with check (true);
create policy "Allow all for anon" on trade_log for all using (true) with check (true);
create policy "Allow all for anon" on observations for all using (true) with check (true);
