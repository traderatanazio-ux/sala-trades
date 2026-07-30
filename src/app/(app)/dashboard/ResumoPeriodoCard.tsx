import { card } from "@/lib/ui";
import type { ResumoPeriodo } from "@/lib/periodo";

export function ResumoPeriodoCard({
  label,
  resumo,
}: {
  label: string;
  resumo: ResumoPeriodo;
}) {
  const cor =
    resumo.resultadoR > 0
      ? "text-emerald-400"
      : resumo.resultadoR < 0
        ? "text-red-400"
        : "text-neutral-300";

  return (
    <div className={`${card} p-4`}>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight tabular-nums ${cor}`}>
        {resumo.resultadoR >= 0 ? "+" : ""}
        {resumo.resultadoR.toFixed(1)}R
      </p>
      <p className="mt-1 text-sm text-neutral-400">
        {resumo.quantidade} {resumo.quantidade === 1 ? "operação" : "operações"}
      </p>
      {resumo.quantidade > 0 && (
        <p className="mt-0.5 text-xs text-neutral-500">
          {resumo.ganhos} {resumo.ganhos === 1 ? "ganho" : "ganhos"}, {resumo.perdas}{" "}
          {resumo.perdas === 1 ? "perda" : "perdas"} e {resumo.breakeven} breakeven
        </p>
      )}
    </div>
  );
}
