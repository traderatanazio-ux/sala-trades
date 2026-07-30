export type Mercado = "b3" | "cripto" | "forex";
export type Direcao = "compra" | "venda";
export type Resultado = "positivo" | "negativo" | "breakeven";

export type Trade = {
  id: string;
  user_id: string;
  ativo: string;
  mercado: Mercado;
  direcao: Direcao;
  data: string;
  resultado_r: number;
  resultado: Resultado;
  print_antes_path: string | null;
  print_depois_path: string | null;
  observacoes: string | null;
  created_at: string;
};

export const MERCADO_LABEL: Record<Mercado, string> = {
  b3: "B3",
  cripto: "Cripto",
  forex: "Forex",
};

export const RESULTADO_LABEL: Record<Resultado, string> = {
  positivo: "Positivo",
  negativo: "Negativo",
  breakeven: "Breakeven",
};

export const TIPO_BADGE_LABEL: Record<Resultado, string> = {
  positivo: "TAKE",
  negativo: "STOP",
  breakeven: "BE",
};

export const TIPO_BADGE_CLASS: Record<Resultado, string> = {
  positivo: "bg-emerald-950 text-emerald-400 border-emerald-800",
  negativo: "bg-red-950 text-red-400 border-red-800",
  breakeven: "bg-amber-950 text-amber-400 border-amber-800",
};

export function classificarResultado(resultadoR: number): Resultado {
  if (resultadoR > 0.05) return "positivo";
  if (resultadoR < -0.05) return "negativo";
  return "breakeven";
}

export function formatarR(resultadoR: number): string {
  const sinal = resultadoR > 0 ? "+" : "";
  return `${sinal}${resultadoR.toFixed(2)}x`;
}
