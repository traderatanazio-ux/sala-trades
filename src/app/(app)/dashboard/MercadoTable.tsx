import { card } from "@/lib/ui";
import { MERCADO_LABEL, type Mercado } from "@/lib/trades";
import type { TradeComCapital } from "@/lib/capital";

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const MERCADOS: Mercado[] = ["b3", "cripto", "forex"];

export function MercadoTable({ trades }: { trades: TradeComCapital[] }) {
  return (
    <div className={`overflow-x-auto ${card}`}>
      <table className="w-full text-sm">
        <thead className="bg-neutral-900/60 text-left text-neutral-400">
          <tr>
            <th className="px-4 py-2 font-medium">Mercado</th>
            <th className="px-4 py-2 font-medium text-right">Trades</th>
            <th className="px-4 py-2 font-medium text-right">Resultado</th>
            <th className="px-4 py-2 font-medium text-right">Taxa de acerto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/70">
          {MERCADOS.map((mercado) => {
            const doMercado = trades.filter((t) => t.mercado === mercado);
            const resultado = doMercado.reduce((acc, t) => acc + t.resultadoFinanceiro, 0);
            const vencedores = doMercado.filter((t) => t.resultado === "positivo").length;
            const taxaAcerto = doMercado.length > 0 ? (vencedores / doMercado.length) * 100 : 0;

            return (
              <tr key={mercado} className="transition-colors hover:bg-neutral-800/40">
                <td className="px-4 py-2 text-neutral-100">{MERCADO_LABEL[mercado]}</td>
                <td className="px-4 py-2 text-right text-neutral-300">{doMercado.length}</td>
                <td
                  className={`px-4 py-2 text-right font-medium ${
                    resultado > 0
                      ? "text-emerald-400"
                      : resultado < 0
                        ? "text-red-400"
                        : "text-neutral-400"
                  }`}
                >
                  {doMercado.length > 0 ? formatarMoeda(resultado) : "—"}
                </td>
                <td className="px-4 py-2 text-right text-neutral-300">
                  {doMercado.length > 0 ? `${taxaAcerto.toFixed(0)}%` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
