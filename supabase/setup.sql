-- Setup do banco de dados para o Painel de Histórico de Trades
-- Rode este script inteiro no SQL Editor do seu projeto Supabase (Supabase Dashboard > SQL Editor > New query)
--
-- Este script recria a tabela do zero (drop + create). Se você já tinha trades
-- de teste registrados, eles serão apagados.

drop table if exists trades cascade;
drop type if exists mercado_tipo cascade;
drop type if exists direcao_tipo cascade;
drop type if exists resultado_tipo cascade;

-- 1. Enums
create type mercado_tipo as enum ('b3', 'cripto', 'forex');
create type direcao_tipo as enum ('compra', 'venda');
create type resultado_tipo as enum ('positivo', 'negativo', 'breakeven');

-- 2. Tabela principal
create table trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ativo text not null,
  mercado mercado_tipo not null,
  direcao direcao_tipo not null,
  data timestamptz not null default now(),
  resultado_r numeric not null,
  resultado resultado_tipo not null,
  print_antes_path text,
  print_depois_path text,
  observacoes text,
  created_at timestamptz not null default now()
);

create index trades_user_id_idx on trades(user_id);
create index trades_mercado_idx on trades(mercado);
create index trades_data_idx on trades(data desc);

-- 3. Row Level Security: cada usuário só vê/edita os próprios trades
alter table trades enable row level security;

create policy "Usuários veem apenas seus próprios trades"
  on trades for select
  using (auth.uid() = user_id);

create policy "Usuários inserem apenas seus próprios trades"
  on trades for insert
  with check (auth.uid() = user_id);

create policy "Usuários atualizam apenas seus próprios trades"
  on trades for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuários deletam apenas seus próprios trades"
  on trades for delete
  using (auth.uid() = user_id);

-- 4. Bucket de storage para os prints dos gráficos (privado)
insert into storage.buckets (id, name, public)
values ('prints', 'prints', false)
on conflict (id) do nothing;

drop policy if exists "Usuários leem apenas seus próprios prints" on storage.objects;
drop policy if exists "Usuários enviam apenas para sua própria pasta" on storage.objects;
drop policy if exists "Usuários deletam apenas seus próprios prints" on storage.objects;

create policy "Usuários leem apenas seus próprios prints"
  on storage.objects for select
  using (bucket_id = 'prints' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Usuários enviam apenas para sua própria pasta"
  on storage.objects for insert
  with check (bucket_id = 'prints' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Usuários deletam apenas seus próprios prints"
  on storage.objects for delete
  using (bucket_id = 'prints' and auth.uid()::text = (storage.foldername(name))[1]);

-- Pronto. Se ainda não tiver feito:
-- 1. Vá em Authentication > Users e crie o seu usuário (e-mail/senha) que vai usar para logar no painel.
-- 2. Copie a "Project URL" e a "anon public key" em Project Settings > API para o arquivo .env.local do projeto.
