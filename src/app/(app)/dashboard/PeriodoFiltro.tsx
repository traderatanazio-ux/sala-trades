import Link from "next/link";
import { btnSecondary, card, inputClass } from "@/lib/ui";
import type { PeriodoOpcao } from "@/lib/periodo";

const selectClass = `${inputClass} px-2 py-1.5 text-sm`;

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function MesesRapidos({
  meses,
  de,
  ate,
}: {
  meses: string[];
  de?: string;
  ate?: string;
}) {
  if (meses.length === 0) return null;

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <span className="text-xs text-neutral-500">Ir direto para um mês:</span>
      {meses.map((chave) => {
        const [ano, mes] = chave.split("-").map(Number);
        const primeiroDia = new Date(ano, mes - 1, 1).toLocaleDateString("sv-SE");
        const ultimoDia = new Date(ano, mes, 0).toLocaleDateString("sv-SE");
        const label = capitalizar(
          new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
            month: "short",
            year: "numeric",
          })
        );
        const ativo = de === primeiroDia && ate === ultimoDia;

        return (
          <Link
            key={chave}
            href={`/dashboard?periodo=personalizado&de=${primeiroDia}&ate=${ultimoDia}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              ativo
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-neutral-700 text-neutral-400 hover:bg-neutral-800"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export function PeriodoFiltro({
  periodo,
  de,
  ate,
  meses,
}: {
  periodo: PeriodoOpcao;
  de?: string;
  ate?: string;
  meses: string[];
}) {
  return (
    <form method="get" className={`flex flex-wrap items-end gap-3 ${card} p-4`}>
      <MesesRapidos meses={meses} de={de} ate={ate} />
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
