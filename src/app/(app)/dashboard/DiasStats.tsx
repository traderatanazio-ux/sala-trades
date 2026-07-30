import { card } from "@/lib/ui";
import type { DiasStats as DiasStatsType } from "@/lib/periodo";

function formatarDia(data: string) {
  return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
}

function StatMini({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
}) {
  const cor =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "negative"
        ? "text-red-400"
        : "text-neutral-100";

  return (
    <div className={`${card} p-4`}>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold tracking-tight tabular-nums ${cor}`}>{value}</p>
    </div>
  );
}

export function DiasStats({ stats }: { stats: DiasStatsType }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <StatMini label="Dias operados" value={String(stats.diasOperados)} />
      <StatMini label="Dias positivos" value={String(stats.diasPositivos)} tone="positive" />
      <StatMini label="Dias negativos" value={String(stats.diasNegativos)} tone="negative" />
      <StatMini label="Dias no zero" value={String(stats.diasZero)} />
      <StatMini
        label="Melhor dia"
        value={
          stats.melhorDia
            ? `+${stats.melhorDia.resultadoR.toFixed(1)}R`
            : "—"
        }
        tone="positive"
      />
      <StatMini
        label="Pior dia"
        value={
          stats.piorDia
            ? `${stats.piorDia.resultadoR.toFixed(1)}R`
            : "—"
        }
        tone="negative"
      />
      {stats.melhorDia && (
        <p className="col-span-full -mt-2 text-xs text-neutral-500">
          Melhor dia: {formatarDia(stats.melhorDia.data)}
          {stats.piorDia && ` · Pior dia: ${formatarDia(stats.piorDia.data)}`}
        </p>
      )}
    </div>
  );
}
