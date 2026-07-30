import Link from "next/link";
import { btnSecondary, card, inputClass } from "@/lib/ui";
import type { PeriodoOpcao } from "@/lib/periodo";

const selectClass = `${inputClass} px-2 py-1.5 text-sm`;

export function PeriodoFiltro({
  periodo,
  de,
  ate,
}: {
  periodo: PeriodoOpcao;
  de?: string;
  ate?: string;
}) {
  return (
    <form method="get" className={`flex flex-wrap items-end gap-3 ${card} p-4`}>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-500">Período</label>
        <select name="periodo" defaultValue={periodo} className={selectClass}>
          <option value="tudo">Histórico completo</option>
          <option value="hoje">Hoje</option>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mês</option>
          <option value="30dias">Últimos 30 dias</option>
          <option value="personalizado">Personalizado</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-500">De</label>
        <input type="date" name="de" defaultValue={de} className={selectClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-neutral-500">Até</label>
        <input type="date" name="ate" defaultValue={ate} className={selectClass} />
      </div>

      <button type="submit" className={btnSecondary}>
        Aplicar
      </button>
      <Link href="/dashboard" className="text-sm text-neutral-500 transition hover:text-neutral-300">
        Limpar
      </Link>
      <p className="w-full text-xs text-neutral-600">
        Os campos De/Até só têm efeito com o período Personalizado. Este filtro afeta apenas
        total de trades, taxa de acerto, distribuição e a tabela por mercado — a curva de
        capital, profit factor, drawdown e projeção sempre consideram o histórico completo.
      </p>
    </form>
  );
}
