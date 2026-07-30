import type { TradeComCapital } from "@/lib/capital";

export function inicioDoDia(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function inicioDaSemana(d: Date): Date {
  const r = inicioDoDia(d);
  const diaSemana = r.getDay(); // 0 = domingo
  const diff = (diaSemana + 6) % 7; // dias desde a segunda-feira
  r.setDate(r.getDate() - diff);
  return r;
}

export function inicioDoMes(d: Date): Date {
  const r = inicioDoDia(d);
  r.setDate(1);
  return r;
}

export type ResumoPeriodo = {
  resultadoR: number;
  quantidade: number;
  ganhos: number;
  perdas: number;
  breakeven: number;
};

export function resumoPeriodo(
  trades: TradeComCapital[],
  inicio: Date,
  fim: Date
): ResumoPeriodo {
  const noPeriodo = trades.filter((t) => {
    const d = new Date(t.data);
    return d >= inicio && d < fim;
  });

  return {
    resultadoR: noPeriodo.reduce((acc, t) => acc + t.resultado_r, 0),
    quantidade: noPeriodo.length,
    ganhos: noPeriodo.filter((t) => t.resultado === "positivo").length,
    perdas: noPeriodo.filter((t) => t.resultado === "negativo").length,
    breakeven: noPeriodo.filter((t) => t.resultado === "breakeven").length,
  };
}

export type PeriodoOpcao = "hoje" | "semana" | "mes" | "30dias" | "personalizado" | "tudo";

export function filtrarPorPeriodo(
  trades: TradeComCapital[],
  periodo: PeriodoOpcao,
  de?: string,
  ate?: string
): TradeComCapital[] {
  const agora = new Date();
  let inicio: Date | null = null;
  let fim: Date | null = null;

  switch (periodo) {
    case "hoje":
      inicio = inicioDoDia(agora);
      break;
    case "semana":
      inicio = inicioDaSemana(agora);
      break;
    case "mes":
      inicio = inicioDoMes(agora);
      break;
    case "30dias":
      inicio = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "personalizado":
      inicio = de ? new Date(de) : null;
      fim = ate ? new Date(new Date(ate).getTime() + 24 * 60 * 60 * 1000) : null;
      break;
    case "tudo":
    default:
      return trades;
  }

  return trades.filter((t) => {
    const d = new Date(t.data);
    if (inicio && d < inicio) return false;
    if (fim && d >= fim) return false;
    return true;
  });
}

export type PorDia = Map<string, { resultadoR: number; resultadoFinanceiro: number }>;

export function chaveDia(data: string | Date): string {
  // formato yyyy-MM-dd no fuso horário local (evita virar o dia por causa de UTC)
  return new Date(data).toLocaleDateString("sv-SE");
}

export function agruparPorDia(trades: TradeComCapital[]): PorDia {
  const mapa: PorDia = new Map();
  for (const t of trades) {
    const chave = chaveDia(t.data);
    const atual = mapa.get(chave) ?? { resultadoR: 0, resultadoFinanceiro: 0 };
    atual.resultadoR += t.resultado_r;
    atual.resultadoFinanceiro += t.resultadoFinanceiro;
    mapa.set(chave, atual);
  }
  return mapa;
}

export type DiasStats = {
  diasOperados: number;
  diasPositivos: number;
  diasNegativos: number;
  diasZero: number;
  melhorDia: { data: string; resultadoR: number } | null;
  piorDia: { data: string; resultadoR: number } | null;
};

export function calcularDiasStats(porDia: PorDia): DiasStats {
  let diasPositivos = 0;
  let diasNegativos = 0;
  let diasZero = 0;
  let melhorDia: { data: string; resultadoR: number } | null = null;
  let piorDia: { data: string; resultadoR: number } | null = null;

  for (const [data, valor] of porDia.entries()) {
    if (valor.resultadoR > 0.05) diasPositivos++;
    else if (valor.resultadoR < -0.05) diasNegativos++;
    else diasZero++;

    if (!melhorDia || valor.resultadoR > melhorDia.resultadoR) {
      melhorDia = { data, resultadoR: valor.resultadoR };
    }
    if (!piorDia || valor.resultadoR < piorDia.resultadoR) {
      piorDia = { data, resultadoR: valor.resultadoR };
    }
  }

  return {
    diasOperados: porDia.size,
    diasPositivos,
    diasNegativos,
    diasZero,
    melhorDia,
    piorDia,
  };
}
