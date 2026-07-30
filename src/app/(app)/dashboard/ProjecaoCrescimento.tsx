"use client";

import { useState } from "react";
import type { ProjecaoCrescimento as Projecao } from "@/lib/capital";
import { card } from "@/lib/ui";

const OPCOES = [1, 3, 6] as const;

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function ProjecaoCrescimento({
  projecoes,
}: {
  projecoes: Record<1 | 3 | 6, Projecao>;
}) {
  const [meses, setMeses] = useState<1 | 3 | 6>(3);
  const projecao = projecoes[meses];

  return (
    <div
      className={`${card} bg-gradient-to-br from-neutral-900/60 via-neutral-900/60 to-sky-950/30 p-4`}
    >
      <h2 className="text-sm font-semibold text-neutral-100">Projeção de crescimento</h2>
      <p className="mb-4 text-xs text-neutral-500">
        Quanto você teria em {meses} {meses === 1 ? "mês" : "meses"}? Baseado na média dos trades
        já registrados.
      </p>

      <div className="mb-4 flex items-center gap-4">
        <span className="text-xs text-neutral-500">1 mês</span>
        <input
          type="range"
          min={0}
          max={OPCOES.length - 1}
          step={1}
          value={OPCOES.indexOf(meses)}
          onChange={(e) => setMeses(OPCOES[Number(e.target.value)])}
          className="w-full accent-emerald-500"
        />
        <span className="text-xs text-neutral-500">6 meses</span>
      </div>

      <div className="flex flex-wrap gap-8">
        <div>
          <p className="text-xs text-neutral-500">Capital projetado</p>
          <p className="text-2xl font-semibold text-sky-400">
            {formatarMoeda(projecao.capitalProjetado)}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Lucro estimado</p>
          <p className="text-2xl font-semibold text-emerald-400">
            {formatarMoeda(projecao.lucroEstimado)}
            <span className="ml-2 text-sm text-neutral-500">
              {projecao.retornoPct >= 0 ? "+" : ""}
              {projecao.retornoPct.toFixed(1)}%
            </span>
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs italic text-neutral-600">
        Projeção baseada nos trades feitos até hoje. Resultados passados não garantem resultados
        futuros.
      </p>
    </div>
  );
}
