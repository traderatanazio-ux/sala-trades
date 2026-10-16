import { card } from "@/lib/ui";
import type { TradeComCapital } from "@/lib/capital";

type LinhaAtivo = {
  ativo: string;
  trades: number;
  take: number;
  stop: number;
  resultadoR: number;
};

function taxaAcerto(linha: LinhaAtivo) {
  const decisivos = linha.take + linha.stop;
  return decisivos > 0 ? `${Math.round((linha.take / decisivos) * 100)}%` : "—";
}

function Coluna({
  titulo,
  linhas,
  tom,
}: {
  titulo: string;
  linhas: LinhaAtivo[];
  tom: "positivo" | "negativo";
}) {
  const corTitulo = tom === "positivo" ? "text-emerald-400" : "text-red-400";
  const corBarra = tom === "positivo" ? "before:bg-emerald-500" : "before:bg-red-500";
  const corValor = tom === "positivo" ? "text-emerald-400" : "text-red-400";

  return (
    <div className={`relative overflow-hidden ${card} p-4 pl-5 before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${corBarra}`}>
      <h3 className={`mb-3 text-sm font-semibold ${corTitulo}`}>{titulo}</h3>
      {linhas.length === 0 ? (
        <p className="text-sm text-neutral-500">Sem dados no período.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {linhas.map((linha, idx) => (
            <li key={linha.ativo} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-5 text-sm font-semibold text-neutral-500">{idx + 1}º</span>
                <div>
                  <p className="text-sm font-semibold text-neutral-100">{linha.ativo}</p>
                  <p className="text-xs text-neutral-500">
                    {linha.trades} {linha.trades === 1 ? "trade" : "trades"} · {linha.take} take ·{" "}
                    {linha.stop} stop · T.A. {taxaAcerto(linha)}
                  </p>
                </div>
              </div>
              <span className={`text-base font-semibold tabular-nums ${corValor}`}>
                {linha.resultadoR >= 0 ? "+" : ""}
                {linha.resultadoR.toFixed(1)}R
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function AtivosRanking({ trades }: { trades: TradeComCapital[] }) {
  const porAtivo = new Map<string, LinhaAtivo>();
  for (const t of trades) {
    const atual = porAtivo.get(t.ativo) ?? {
      ativo: t.ativo,
      trades: 0,
      take: 0,
      stop: 0,
      resultadoR: 0,
    };
    atual.trades += 1;
    if (t.resultado === "positivo") atual.take += 1;
    if (t.resultado === "negativo") atual.stop += 1;
    atual.resultadoR += t.resultado_r;
    porAtivo.set(t.ativo, atual);
  }

  const ordenados = Array.from(porAtivo.values()).sort(
    (a, b) => b.resultadoR - a.resultadoR || b.trades - a.trades
  );

  const melhores = ordenados.filter((l) => l.resultadoR > 0).slice(0, 3);
  const idsMelhores = new Set(melhores.map((l) => l.ativo));
  const piores = [...ordenados]
    .reverse()
    .filter((l) => l.resultadoR < 0 && !idsMelhores.has(l.ativo))
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Coluna titulo="Top 3 melhores ativos (em R)" linhas={melhores} tom="positivo" />
      <Coluna titulo="Top 3 piores ativos (em R)" linhas={piores} tom="negativo" />
    </div>
  );
}
