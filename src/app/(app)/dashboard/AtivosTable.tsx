import { card } from "@/lib/ui";
import type { TradeComCapital } from "@/lib/capital";

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function AtivosTable({ trades }: { trades: TradeComCapital[] }) {
  const porAtivo = new Map<string, TradeComCapital[]>();
  for (const t of trades) {
    const lista = porAtivo.get(t.ativo);
    if (lista) lista.push(t);
    else porAtivo.set(t.ativo, [t]);
  }

  const linhas = Array.from(porAtivo.entries())
    .map(([ativo, ts]) => {
      const vencedores = ts.filter((t) => t.resultado === "positivo").length;
      return {
        ativo,
        quantidade: ts.length,
        resultadoR: ts.reduce((acc, t) => acc + t.resultado_r, 0),
        resultadoFinanceiro: ts.reduce((acc, t) => acc + t.resultadoFinanceiro, 0),
        taxaAcerto: ts.length > 0 ? (vencedores / ts.length) * 100 : 0,
      };
    })
    .sort((a, b) => b.quantidade - a.quantidade);

  return (
    <div className={`overflow-x-auto ${card}`}>
      <table className="w-full text-sm">
        <thead className="bg-neutral-900/60 text-left text-neutral-400">
          <tr>
            <th className="px-4 py-2 font-medium">Ativo</th>
            <th className="px-4 py-2 font-medium text-right">Trades</th>
            <th className="px-4 py-2 font-medium text-right">Resultado (R)</th>
            <th className="px-4 py-2 font-medium text-right">Resultado (R$)</th>
            <th className="px-4 py-2 font-medium text-right">Taxa de acerto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/70">
          {linhas.map((linha) => (
            <tr key={linha.ativo} className="transition-colors hover:bg-neutral-800/40">
              <td className="px-4 py-2 text-neutral-100">{linha.ativo}</td>
              <td className="px-4 py-2 text-right text-neutral-300">{linha.quantidade}</td>
              <td
                className={`px-4 py-2 text-right font-medium ${
                  linha.resultadoR > 0
                    ? "text-emerald-400"
                    : linha.resultadoR < 0
                      ? "text-red-400"
                      : "text-neutral-400"
                }`}
              >
                {linha.resultadoR >= 0 ? "+" : ""}
                {linha.resultadoR.toFixed(1)}R
              </td>
              <td
                className={`px-4 py-2 text-right ${
                  linha.resultadoFinanceiro > 0
                    ? "text-emerald-400"
                    : linha.resultadoFinanceiro < 0
                      ? "text-red-400"
                      : "text-neutral-400"
                }`}
              >
                {formatarMoeda(linha.resultadoFinanceiro)}
              </td>
              <td className="px-4 py-2 text-right text-neutral-300">
                {linha.taxaAcerto.toFixed(0)}%
              </td>
            </tr>
          ))}
          {linhas.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                Nenhum trade no período selecionado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
