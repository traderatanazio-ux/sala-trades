# Painel de Trades

Registro privado de operações (B3, Cripto, Forex): cada trade é registrado com entrada/stop/alvo, print do gráfico e observações, e depois fechado com o resultado — para acompanhar win rate, R:R médio e resultado por mercado ao longo do tempo.

Stack: Next.js (App Router) + Supabase (banco de dados, autenticação e armazenamento de imagens) + Vercel (hospedagem).

## 1. Criar o projeto no Supabase

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e um novo projeto.
2. No painel do projeto, vá em **SQL Editor** → **New query**, cole todo o conteúdo do arquivo [`supabase/setup.sql`](supabase/setup.sql) deste repositório e rode. Isso cria a tabela `trades`, as regras de segurança (cada usuário só vê os próprios dados) e o bucket de storage para os prints.
3. Vá em **Authentication → Users → Add user** e crie o seu usuário (e-mail e senha) — será o login do painel. Não é necessário permitir cadastro público; o app não tem tela de "criar conta".
4. Vá em **Project Settings → API** e copie:
   - **Project URL**
   - **anon public key**

## 2. Configurar o projeto localmente

1. Copie `.env.local.example` para `.env.local`.
2. Preencha com os valores copiados do Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

3. Instale as dependências e rode localmente:

```bash
npm install
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000), faça login com o usuário criado no passo 1.3, e teste: criar um trade em "Novo trade", fechar a operação na página de detalhe, conferir o dashboard e os filtros em "Trades".

## 3. Publicar na web (Vercel)

1. Suba este projeto para um repositório no GitHub (crie o repositório e faça o push).
2. Crie uma conta gratuita em [vercel.com](https://vercel.com) e clique em **Add New → Project**, importando o repositório do GitHub.
3. Em **Environment Variables**, adicione as mesmas duas variáveis do `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em **Deploy**. Em poucos minutos o site estará no ar num link `*.vercel.app` (dá pra configurar um domínio próprio depois, se quiser).

Como o acesso é protegido por login e as regras de segurança do banco (RLS) restringem os dados ao seu usuário, o site pode ficar público na internet sem expor os dados — só quem tiver seu e-mail/senha entra.

## Estrutura do projeto

- `src/app/login` — tela de login.
- `src/app/(app)/dashboard` — estatísticas e gráficos (win rate, R:R médio, resultado por mercado, curva de resultado acumulado).
- `src/app/(app)/trades` — lista de trades com filtros, formulário de novo trade e página de detalhe/fechamento de cada operação.
- `src/lib/supabase` — clientes Supabase (browser, server, middleware/proxy de autenticação).
- `src/lib/trades.ts` — tipos e cálculo do resultado em R (múltiplos de risco).
- `supabase/setup.sql` — script único de setup do banco de dados.

## Comandos

```bash
npm run dev    # ambiente de desenvolvimento
npm run build  # build de produção
npm run lint   # checagem de lint
```
