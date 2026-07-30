import Link from "next/link";
import { logout } from "@/app/login/actions";
import { NavLinks } from "./NavLinks";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-neutral-100">
      <header className="sticky top-0 z-10 border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-sky-500 text-xs font-bold text-neutral-950">
                TA
              </span>
              <span className="font-semibold tracking-tight text-neutral-100">
                Painel de Trades
              </span>
            </Link>
            <NavLinks />
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md px-3 py-1.5 text-sm text-neutral-400 transition hover:bg-red-950/40 hover:text-red-400"
            >
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
