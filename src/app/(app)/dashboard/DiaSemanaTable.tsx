import { card } from "@/lib/ui";
import type { TradeComCapital } from "@/lib/capital";

const DIAS_SEMANA = [
  { indice: 1, label: "Segunda-feira" },
  { indice: 2, label: "Terça-feira" },
  { indice: 3, label: "Quarta-feira" },
  { indice: 4, label: "Quinta-feira" },
  { indice: 5, label: "Sexta-feira" },
];

export function DiaSemanaTable({ trades }: { trades: TradeComCapital[] }) {
  const linhas = DIAS_SEMANA.map(({ indice, label }) => {
    const doDia = trades.filter((t) => new Date(t.data).getDay() === indice);
    const take = doDia.filter((t) => t.resultado === "positivo").length;
    const stop = doDia.filter((t) => t.resultado === "negativo").length;
    const resultadoR = doDia.reduce((acc, t) => acc + t.resultado_r, 0);
    const decisivos = take + stop;
    const taxaAcerto = decisivos > 0 ? (take / decisivos) * 100 : 0;

    return { label, quantidade: doDia.length, take, stop, resultadoR, taxaAcerto };
  });

  const melhorDia = linhas.reduce<(typeof linhas)[number] | null>((melhor, linha) => {
    if (linha.quantidade === 0) return melhor;
    if (!melhor || linha.resultadoR > melhor.resultadoR) return linha;
    return melhor;
  }, null);

  return (
    <div className="flex flex-col gap-2">
      <div className={`overflow-x-auto ${card}`}>
        <table className="w-full text-sm">
          <thead className="bg-neutral-900/60 text-left text-neutral-400">
            <tr>
              <th className="px-4 py-2 font-medium">Dia da semana</th>
              <th className="px-4 py-2 font-medium text-right">Trades</th>
              <th className="px-4 py-2 font-medium text-right">Take</th>
              <th className="px-4 py-2 font-medium text-right">Stop</th>
              <th className="px-4 py-2 font-medium text-right">Resultado (R)</th>
              <th className="px-4 py-2 font-medium text-right">Taxa de acerto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/70">
            {linhas.map((linha) => (
              <tr key={linha.label} className="transition-colors hover:bg-neutral-800/40">
                <td className="px-4 py-2 text-neutral-100">
                  {linha.label}
                  {melhorDia && linha.label === melhorDia.label && (
                    <span className="ml-2 rounded-full border border-emerald-800 bg-emerald-950 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                      melhor dia
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-right text-neutral-300">{linha.quantidade}</td>
                <td className="px-4 py-2 text-right text-emerald-400">{linha.take}</td>
                <td className="px-4 py-2 text-right text-red-400">{linha.stop}</td>
                <td
                  className={`px-4 py-2 text-right font-medium ${
                    linha.resultadoR > 0
                      ? "text-emerald-400"
                      : linha.resultadoR < 0
                        ? "text-red-400"
                        : "text-neutral-400"
                  }`}
                >
                  {linha.quantidade > 0
                    ? `${linha.resultadoR >= 0 ? "+" : ""}${linha.resultadoR.toFixed(1)}R`
                    : "—"}
                </td>
                <td className="px-4 py-2 text-right text-neutral-300">
                  {linha.quantidade > 0 ? `${linha.taxaAcerto.toFixed(0)}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {melhorDia && (
        <p className="text-xs text-neutral-500">
          Melhor dia (histórico completo):{" "}
          <span className="text-emerald-400">{melhorDia.label}</span> (
          {melhorDia.resultadoR >= 0 ? "+" : ""}
          {melhorDia.resultadoR.toFixed(1)}R em {melhorDia.quantidade} trades).
        </p>
      )}
    </div>
  );
}
