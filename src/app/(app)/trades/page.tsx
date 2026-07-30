import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  MERCADO_LABEL,
  TIPO_BADGE_CLASS,
  TIPO_BADGE_LABEL,
  type Trade,
} from "@/lib/trades";
import { calcularCurvaCapital } from "@/lib/capital";
import { btnPrimary, btnSecondary, card, inputClass } from "@/lib/ui";

const selectClass = `${inputClass} px-2 py-1.5 text-sm`;

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type SearchParams = {
  mercado?: string;
  resultado?: string;
  ativo?: string;
  de?: string;
  ate?: string;
};

export default async function TradesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: trades, error }, { data: config }] = await Promise.all([
    supabase.from("trades").select("*").order("data", { ascending: true }).returns<Trade[]>(),
    supabase
      .from("configuracoes")
      .select("capital_inicial, risco_pct")
      .eq("user_id", user!.id)
      .maybeSingle(),
  ]);

  const capitalInicial = config?.capital_inicial ?? 1000;
  const riscoPct = config?.risco_pct ?? 5;
  const enriquecidos = calcularCurvaCapital(trades ?? [], { capitalInicial, riscoPct });

  const filtrados = enriquecidos.filter((t) => {
    if (filters.mercado && t.mercado !== filters.mercado) return false;
    if (filters.resultado && t.resultado !== filters.resultado) return false;
    if (filters.ativo && !t.ativo.toLowerCase().includes(filters.ativo.toLowerCase())) return false;
    if (filters.de && new Date(t.data) < new Date(filters.de)) return false;
    if (filters.ate && new Date(t.data) > new Date(filters.ate)) return false;
    return true;
  });

  const linhas = [...filtrados].reverse();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Trades</h1>
          <p className="text-xs text-neutral-500">{filtrados.length} trades</p>
        </div>
        <Link href="/trades/novo" className={btnPrimary}>
          Novo trade
        </Link>
      </div>

      <form method="get" className={`flex flex-wrap items-end gap-3 ${card} p-4`}>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">Ativo</label>
          <input
            name="ativo"
            defaultValue={filters.ativo}
            placeholder="PETR4..."
            className={selectClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">Mercado</label>
          <select name="mercado" defaultValue={filters.mercado ?? ""} className={selectClass}>
            <option value="">Todos</option>
            <option value="b3">B3</option>
            <option value="cripto">Cripto</option>
            <option value="forex">Forex</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">Resultado</label>
          <select name="resultado" defaultValue={filters.resultado ?? ""} className={selectClass}>
            <option value="">Todos</option>
            <option value="positivo">Positivo (TAKE)</option>
            <option value="negativo">Negativo (STOP)</option>
            <option value="breakeven">Breakeven (BE)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">De</label>
          <input type="date" name="de" defaultValue={filters.de} className={selectClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-neutral-500">Até</label>
          <input type="date" name="ate" defaultValue={filters.ate} className={selectClass} />
        </div>

        <button type="submit" className={btnSecondary}>
          Filtrar
        </button>
        <Link
          href="/trades"
          className="text-sm text-neutral-500 transition hover:text-neutral-300"
        >
          Limpar
        </Link>
      </form>

      {error && (
        <p className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-300">
          Erro ao carregar trades: {error.message}
        </p>
      )}

      <div className={`overflow-x-auto ${card}`}>
        <table className="w-full text-sm">
          <thead className="bg-neutral-900/95 text-left text-neutral-400">
            <tr>
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Data</th>
              <th className="px-4 py-2 font-medium">Ativo</th>
              <th className="px-4 py-2 font-medium">Mercado</th>
              <th className="px-4 py-2 font-medium text-right">R</th>
              <th className="px-4 py-2 font-medium text-right">Resultado R$</th>
              <th className="px-4 py-2 font-medium">Tipo</th>
              <th className="px-4 py-2 font-medium text-right">Capital Acum.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/70">
            {linhas.map((trade, idx) => (
              <tr key={trade.id} className="transition-colors hover:bg-neutral-800/40">
                <td className="px-4 py-2 text-neutral-500">{linhas.length - idx}</td>
                <td className="px-4 py-2 text-neutral-300">
                  {new Date(trade.data).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-2">
                  <Link href={`/trades/${trade.id}`} className="text-neutral-100 hover:underline">
                    {trade.ativo}
                  </Link>
                </td>
                <td className="px-4 py-2 text-neutral-300">{MERCADO_LABEL[trade.mercado]}</td>
                <td
                  className={`px-4 py-2 text-right font-medium ${
                    trade.resultado_r > 0
                      ? "text-emerald-400"
                      : trade.resultado_r < 0
                        ? "text-red-400"
                        : "text-neutral-400"
                  }`}
                >
                  {trade.resultado_r >= 0 ? "+" : ""}
                  {trade.resultado_r.toFixed(1)}R
                </td>
                <td
                  className={`px-4 py-2 text-right ${
                    trade.resultadoFinanceiro > 0
                      ? "text-emerald-400"
                      : trade.resultadoFinanceiro < 0
                        ? "text-red-400"
                        : "text-neutral-400"
                  }`}
                >
                  {trade.resultado === "breakeven" ? "—" : formatarMoeda(trade.resultadoFinanceiro)}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${TIPO_BADGE_CLASS[trade.resultado]}`}
                  >
                    {TIPO_BADGE_LABEL[trade.resultado]}
                  </span>
                </td>
                <td className="px-4 py-2 text-right text-neutral-300">
                  {formatarMoeda(trade.capitalAcumulado)}
                </td>
              </tr>
            ))}
            {linhas.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-neutral-500">
                  Nenhum trade encontrado com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
