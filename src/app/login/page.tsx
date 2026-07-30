import { login } from "./actions";
import { btnPrimary, inputClass, labelClass } from "@/lib/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-800/80 bg-neutral-900/70 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 text-base font-bold text-neutral-950 shadow-lg shadow-emerald-500/20">
            TA
          </span>
          <h1 className="text-xl font-semibold text-neutral-100">Painel de Trades</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Acesso privado — entre com suas credenciais.
          </p>
        </div>

        <form action={login} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className={labelClass}>
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className={labelClass}>
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-900/60 bg-red-950/60 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <button type="submit" className={`mt-2 ${btnPrimary}`}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
