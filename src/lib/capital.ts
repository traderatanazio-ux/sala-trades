import type { Trade } from "@/lib/trades";

export type ConfiguracaoCapital = {
  capitalInicial: number;
  riscoPct: number;
};

export type TradeComCapital = Trade & {
  riscoValor: number;
  resultadoFinanceiro: number;
  capitalAcumulado: number;
};

export function calcularCurvaCapital(
  trades: Trade[],
  config: ConfiguracaoCapital
): TradeComCapital[] {
  const ordenados = [...trades].sort(
    (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
  );

  let capitalAtual = config.capitalInicial;

  return ordenados.map((trade) => {
    const riscoValor = capitalAtual * (config.riscoPct / 100);
    const resultadoFinanceiro = trade.resultado_r * riscoValor;
    capitalAtual += resultadoFinanceiro;
    return { ...trade, riscoValor, resultadoFinanceiro, capitalAcumulado: capitalAtual };
  });
}

/** Retorna a razão ganhos/perdas. Infinity se não houver perdas e houver ganhos. */
export function calcularProfitFactor(enriquecidos: TradeComCapital[]): number {
  const ganhos = enriquecidos
    .filter((t) => t.resultadoFinanceiro > 0)
    .reduce((acc, t) => acc + t.resultadoFinanceiro, 0);
  const perdas = Math.abs(
    enriquecidos
      .filter((t) => t.resultadoFinanceiro < 0)
      .reduce((acc, t) => acc + t.resultadoFinanceiro, 0)
  );

  if (perdas === 0) return ganhos > 0 ? Infinity : 0;
  return ganhos / perdas;
}

export type DrawdownMaximo = {
  valor: number;
  percentual: number;
  picoIdx: number;
  fundoIdx: number;
};

export function calcularDrawdownMaximo(
  enriquecidos: TradeComCapital[],
  capitalInicial: number
): DrawdownMaximo {
  let pico = capitalInicial;
  let picoIdx = -1;
  let maxDrawdown = 0;
  let maxDrawdownPct = 0;
  let melhorPicoIdx = -1;
  let melhorFundoIdx = -1;

  enriquecidos.forEach((t, idx) => {
    if (t.capitalAcumulado > pico) {
      pico = t.capitalAcumulado;
      picoIdx = idx;
    }
    const drawdown = pico - t.capitalAcumulado;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      maxDrawdownPct = pico > 0 ? (drawdown / pico) * 100 : 0;
      melhorPicoIdx = picoIdx;
      melhorFundoIdx = idx;
    }
  });

  return {
    valor: maxDrawdown,
    percentual: maxDrawdownPct,
    picoIdx: melhorPicoIdx,
    fundoIdx: melhorFundoIdx,
  };
}
