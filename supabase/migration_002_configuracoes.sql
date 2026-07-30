-- Migração aditiva: configuração de capital (capital inicial + risco por trade)
-- Rode no SQL Editor do Supabase, ADEMAIS do supabase/setup.sql já rodado antes.
-- Não mexe na tabela trades — seguro mesmo se você já tiver trades reais registrados.

create table if not exists configuracoes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  capital_inicial numeric not null default 1000,
  risco_pct numeric not null default 5,
  updated_at timestamptz not null default now()
);

alter table configuracoes enable row level security;

drop policy if exists "Usuários veem apenas sua própria configuração" on configuracoes;
drop policy if exists "Usuários criam apenas sua própria configuração" on configuracoes;
drop policy if exists "Usuários atualizam apenas sua própria configuração" on configuracoes;

create policy "Usuários veem apenas sua própria configuração"
  on configuracoes for select
  using (auth.uid() = user_id);

create policy "Usuários criam apenas sua própria configuração"
  on configuracoes for insert
  with check (auth.uid() = user_id);

create policy "Usuários atualizam apenas sua própria configuração"
  on configuracoes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
