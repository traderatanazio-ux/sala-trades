import { card } from "@/lib/ui";
import { chaveDia, inicioDaSemana, inicioDoDia, type PorDia } from "@/lib/periodo";

function corCelula(resultadoR: number | undefined, maxAbs: number): string {
  if (resultadoR === undefined) return "rgba(64,64,64,0.35)";
  if (Math.abs(resultadoR) <= 0.05) return "rgba(163,163,163,0.5)";
  const intensidade = Math.min(Math.abs(resultadoR) / maxAbs, 1);
  const alpha = 0.25 + intensidade * 0.65;
  return resultadoR > 0 ? `rgba(16,185,129,${alpha})` : `rgba(239,68,68,${alpha})`;
}

export function HeatmapCalendario({ porDia }: { porDia: PorDia }) {
  const hoje = inicioDoDia(new Date());
  const inicioGrade = inicioDaSemana(new Date(hoje.getTime() - 181 * 24 * 60 * 60 * 1000));

  const semanas: Date[][] = [];
  const cursor = new Date(inicioGrade);
  while (cursor <= hoje) {
    const semana: Date[] = [];
    for (let i = 0; i < 7; i++) {
      semana.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    semanas.push(semana);
  }

  const maxAbs = Math.max(1, ...Array.from(porDia.values()).map((v) => Math.abs(v.resultadoR)));

  return (
    <div className={`${card} p-4`}>
      <h2 className="mb-3 text-sm font-semibold text-neutral-100">
        Regularidade — últimos 6 meses
      </h2>
      <div className="overflow-x-auto">
        <div className="flex w-fit gap-1">
          {semanas.map((semana, si) => (
            <div key={si} className="flex flex-col gap-1">
              {semana.map((dia, di) => {
                if (dia > hoje) {
                  return <div key={di} className="h-3 w-3 rounded-sm" />;
                }
                const chave = chaveDia(dia);
                const valor = porDia.get(chave);
                const titulo = `${dia.toLocaleDateString("pt-BR")}${
                  valor
                    ? ` · ${valor.resultadoR >= 0 ? "+" : ""}${valor.resultadoR.toFixed(1)}R`
                    : " · sem operações"
                }`;
                return (
                  <div
                    key={di}
                    title={titulo}
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: corCelula(valor?.resultadoR, maxAbs) }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: "rgba(239,68,68,0.7)" }} />
        Prejuízo
        <span className="ml-3 h-3 w-3 rounded-sm" style={{ backgroundColor: "rgba(163,163,163,0.5)" }} />
        Neutro
        <span className="ml-3 h-3 w-3 rounded-sm" style={{ backgroundColor: "rgba(16,185,129,0.7)" }} />
        Lucro
        <span className="ml-3 h-3 w-3 rounded-sm" style={{ backgroundColor: "rgba(64,64,64,0.35)" }} />
        Sem operação
      </div>
    </div>
  );
}
