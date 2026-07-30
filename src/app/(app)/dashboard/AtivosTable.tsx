import { card } from "@/lib/ui";
import type { TradeComCapital } from "@/lib/capital";

export function AtivosTable({ trades }: { trades: TradeComCapital[] }) {
  const porAtivo = new Map<string, TradeComCapital[]>();
  for (const t of trades) {
    const lista = porAtivo.get(t.ativo);
    if (lista) lista.push(t);
    else porAtivo.set(t.ativo, [t]);
  }

  const linhas = Array.from(porAtivo.entries())
    .map(([ativo, ts]) => ({
      ativo,
      quantidade: ts.length,
      take: ts.filter((t) => t.resultado === "positivo").length,
      stop: ts.filter((t) => t.resultado === "negativo").length,
    }))
    .sort((a, b) => b.quantidade - a.quantidade);

  return (
    <div className={`overflow-x-auto ${card}`}>
      <table className="w-full text-sm">
        <thead className="bg-neutral-900/60 text-left text-neutral-400">
          <tr>
            <th className="px-4 py-2 font-medium">Ativo</th>
            <th className="px-4 py-2 font-medium text-right">Trades</th>
            <th className="px-4 py-2 font-medium text-right">Take</th>
            <th className="px-4 py-2 font-medium text-right">Stop</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/70">
          {linhas.map((linha) => (
            <tr key={linha.ativo} className="transition-colors hover:bg-neutral-800/40">
              <td className="px-4 py-2 text-neutral-100">{linha.ativo}</td>
              <td className="px-4 py-2 text-right text-neutral-300">{linha.quantidade}</td>
              <td className="px-4 py-2 text-right text-emerald-400">{linha.take}</td>
              <td className="px-4 py-2 text-right text-red-400">{linha.stop}</td>
            </tr>
          ))}
          {linhas.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                Nenhum trade no período selecionado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
