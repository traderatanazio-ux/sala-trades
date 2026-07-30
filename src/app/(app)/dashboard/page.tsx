import { createClient } from "@/lib/supabase/server";
import { MERCADO_LABEL, type Mercado, type Resultado, type Trade } from "@/lib/trades";
import {
  calcularCurvaCapital,
  calcularDrawdownMaximo,
  calcularProfitFactor,
  projetarCrescimento,
} from "@/lib/capital";
import {
  agruparPorDia,
  calcularDiasStats,
  filtrarPorPeriodo,
  inicioDaSemana,
  inicioDoDia,
  inicioDoMes,
  resumoPeriodo,
  type PeriodoOpcao,
} from "@/lib/periodo";
import { card } from "@/lib/ui";
import { CapitalCurveChart } from "./CapitalCurveChart";
import { MercadoChart } from "./MercadoChart";
import { TradesPorMesChart } from "./TradesPorMesChart";
import { ConfiguracaoCapitalForm } from "./ConfiguracaoCapitalForm";
import { ProjecaoCrescimento } from "./ProjecaoCrescimento";
import { PeriodoFiltro } from "./PeriodoFiltro";
import { ResumoPeriodoCard } from "./ResumoPeriodoCard";
import { MercadoTable } from "./MercadoTable";
import { AtivosTable } from "./AtivosTable";
import { DiasStats } from "./DiasStats";
import { HeatmapCalendario } from "./HeatmapCalendario";

type Tone = "default" | "positive" | "negative" | "info";

const TONE_ACCENT: Record<Tone, string> = {
  default: "before:bg-neutral-700",
  positive: "before:bg-emerald-500",
  negative: "before:bg-red-500",
  info: "before:bg-sky-500",
};

const TONE_TEXT: Record<Tone, string> = {
  default: "text-neutral-100",
  positive: "text-emerald-400",
  negative: "text-red-400",
  info: "text-sky-400",
};

function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div
      className={`relative overflow-hidden ${card} p-4 pl-5 before:absolute before:left-0 before:top-0 before:h-full before:w-1 ${TONE_ACCENT[tone]}`}
    >
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight tabular-nums ${TONE_TEXT[tone]}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

const RESULTADO_DOT: Record<Resultado, string> = {
  positivo: "bg-emerald-400",
  negativo: "bg-red-400",
  breakeven: "bg-neutral-400",
};

const RESULTADOS: Resultado[] = ["positivo", "negativo", "breakeven"];
const RESULTADO_LABEL_CURTO: Record<Resultado, string> = {
  positivo: "Positivos",
  negativo: "Negativos",
  breakeven: "Breakeven",
};

function formatarMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type SearchParams = {
  periodo?: PeriodoOpcao;
  de?: string;
  ate?: string;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { periodo = "tudo", de, ate } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: trades }, { data: config }] = await Promise.all([
    supabase.from("trades").select("*").order("data", { ascending: true }).returns<Trade[]>(),
    supabase
      .from("configuracoes")
      .select("capital_inicial, risco_pct")
      .eq("user_id", user!.id)
      .maybeSingle(),
  ]);

  const capitalInicial = config?.capital_inicial ?? 1000;
  const riscoPct = config?.risco_pct ?? 5;

  const todos = trades ?? [];
  const enriquecidos = calcularCurvaCapital(todos, { capitalInicial, riscoPct });
  const capitalAtual = enriquecidos.length > 0 ? enriquecidos[enriquecidos.length - 1].capitalAcumulado : capitalInicial;

  // --- Métricas controladas pelo filtro de período/mês ---
  const noPeriodo = filtrarPorPeriodo(enriquecidos, periodo, de, ate);

  const primeiroDoPeriodo = noPeriodo[0];
  const idxPrimeiroDoPeriodo = primeiroDoPeriodo
    ? enriquecidos.findIndex((t) => t.id === primeiroDoPeriodo.id)
    : -1;
  const capitalAntesPeriodo =
    idxPrimeiroDoPeriodo > 0 ? enriquecidos[idxPrimeiroDoPeriodo - 1].capitalAcumulado : capitalInicial;
  const capitalDepoisPeriodo =
    noPeriodo.length > 0 ? noPeriodo[noPeriodo.length - 1].capitalAcumulado : capitalAntesPeriodo;

  const decisivosPeriodoArr = noPeriodo.filter((t) => t.resultado !== "breakeven");
  const rMedioSemBE =
    decisivosPeriodoArr.length > 0
      ? decisivosPeriodoArr.reduce((acc, t) => acc + t.resultado_r, 0) / decisivosPeriodoArr.length
      : 0;
  const retornoTotalPct =
    capitalAntesPeriodo > 0
      ? ((capitalDepoisPeriodo - capitalAntesPeriodo) / capitalAntesPeriodo) * 100
      : 0;
  const somaRPeriodo = noPeriodo.reduce((acc, t) => acc + t.resultado_r, 0);
  const retornoSimplesPct = somaRPeriodo * riscoPct;
  const profitFactor = calcularProfitFactor(noPeriodo);
  const drawdown = calcularDrawdownMaximo(noPeriodo, capitalAntesPeriodo);

  const curvaData = [
    { label: "Início", capital: Number(capitalInicial.toFixed(2)) },
    ...enriquecidos.map((t) => ({
      label: new Date(t.data).toLocaleDateString("pt-BR"),
      capital: Number(t.capitalAcumulado.toFixed(2)),
    })),
  ];
  const drawdownArea =
    drawdown.valor > 0
      ? { x1: curvaData[drawdown.picoIdx + 1].label, x2: curvaData[drawdown.fundoIdx + 1].label }
      : null;

  const mercados: Mercado[] = ["b3", "cripto", "forex"];
  const mercadoData = mercados.map((mercado) => {
    const doMercado = enriquecidos.filter((t) => t.mercado === mercado);
    const resultadoR$ = doMercado.reduce((acc, t) => acc + t.resultadoFinanceiro, 0);
    return { mercado: MERCADO_LABEL[mercado], resultadoR: Number(resultadoR$.toFixed(2)) };
  });

  const porMes = new Map<string, number>();
  for (const t of todos) {
    const d = new Date(t.data);
    const chave = `${d.toLocaleString("pt-BR", { month: "short" })}/${String(d.getFullYear()).slice(2)}`;
    porMes.set(chave, (porMes.get(chave) ?? 0) + 1);
  }
  const mesData = Array.from(porMes.entries()).map(([mes, quantidade]) => ({ mes, quantidade }));

  const projecoes = {
    1: projetarCrescimento(enriquecidos, riscoPct, capitalAtual, 1),
    3: projetarCrescimento(enriquecidos, riscoPct, capitalAtual, 3),
    6: projetarCrescimento(enriquecidos, riscoPct, capitalAtual, 6),
  };

  // --- Resumo fixo: hoje / esta semana / este mês (independente do filtro) ---
  const agora = new Date();
  const fimHoje = new Date(inicioDoDia(agora).getTime() + 24 * 60 * 60 * 1000);
  const resumoHoje = resumoPeriodo(enriquecidos, inicioDoDia(agora), fimHoje);
  const resumoSemana = resumoPeriodo(enriquecidos, inicioDaSemana(agora), fimHoje);
  const resumoMes = resumoPeriodo(enriquecidos, inicioDoMes(agora), fimHoje);

  const totalPeriodo = noPeriodo.length;
  const vencedoresPeriodo = noPeriodo.filter((t) => t.resultado === "positivo").length;
  const perdedoresPeriodo = noPeriodo.filter((t) => t.resultado === "negativo").length;
  const taxaAcertoPeriodo = totalPeriodo > 0 ? (vencedoresPeriodo / totalPeriodo) * 100 : 0;
  const decisivosPeriodo = vencedoresPeriodo + perdedoresPeriodo;
  const taxaAcertoSemBEPeriodo =
    decisivosPeriodo > 0 ? (vencedoresPeriodo / decisivosPeriodo) * 100 : 0;
  const distribuicaoPeriodo = RESULTADOS.map((resultado) => ({
    resultado,
    quantidade: noPeriodo.filter((t) => t.resultado === resultado).length,
  }));

  const mesesDisponiveis = Array.from(
    new Set(
      enriquecidos.map((t) => {
        const d = new Date(t.data);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      })
    )
  ).sort((a, b) => (a < b ? 1 : -1));

  // --- Regularidade diária: últimos 6 meses (independente do filtro) ---
  const seisMesesAtras = new Date(agora.getTime() - 182 * 24 * 60 * 60 * 1000);
  const trades6Meses = enriquecidos.filter((t) => new Date(t.data) >= seisMesesAtras);
  const porDia = agruparPorDia(trades6Meses);
  const diasStats = calcularDiasStats(porDia);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold tracking-tight text-neutral-100">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResumoPeriodoCard label="Hoje" resumo={resumoHoje} />
        <ResumoPeriodoCard label="Esta semana" resumo={resumoSemana} />
        <ResumoPeriodoCard label="Este mês" resumo={resumoMes} />
      </div>

      <p className="-mb-2 text-xs text-neutral-500">
        Refletem o período selecionado no filtro logo abaixo (padrão: histórico completo).
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Retorno (juros compostos)"
          value={`${retornoTotalPct >= 0 ? "+" : ""}${retornoTotalPct.toFixed(1)}%`}
          tone={retornoTotalPct >= 0 ? "positive" : "negative"}
        />
        <StatCard
          label="Retorno (sem compostos)"
          value={`${retornoSimplesPct >= 0 ? "+" : ""}${retornoSimplesPct.toFixed(1)}%`}
          hint={`${somaRPeriodo >= 0 ? "+" : ""}${somaRPeriodo.toFixed(1)}R × ${riscoPct}%`}
          tone={retornoSimplesPct >= 0 ? "positive" : "negative"}
        />
        <StatCard label="R:R médio — só take/stop" value={`${rMedioSemBE.toFixed(2)}R`} />
        <StatCard
          label="Profit factor"
          value={profitFactor === Infinity ? "∞" : profitFactor.toFixed(2)}
          tone={profitFactor >= 1 ? "positive" : "negative"}
        />
        <StatCard
          label="Drawdown máximo"
          value={formatarMoeda(drawdown.valor)}
          hint={`${drawdown.percentual.toFixed(1)}% do pico`}
          tone="negative"
        />
      </div>

      <ConfiguracaoCapitalForm capitalInicial={capitalInicial} riscoPct={riscoPct} />

      <PeriodoFiltro periodo={periodo} de={de} ate={ate} meses={mesesDisponiveis} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total de trades (período)" value={String(totalPeriodo)} tone="info" />
        <StatCard
          label="T.A. — todos os trades"
          value={`${taxaAcertoPeriodo.toFixed(0)}%`}
          hint={`${vencedoresPeriodo}/${totalPeriodo} (take, stop e BE)`}
          tone="info"
        />
        <StatCard
          label="T.A. — só take e stop"
          value={`${taxaAcertoSemBEPeriodo.toFixed(0)}%`}
          hint={`${vencedoresPeriodo}/${decisivosPeriodo} (sem BE)`}
          tone="info"
        />
      </div>

      <div className={`${card} p-4`}>
        <h2 className="mb-3 text-sm font-semibold text-neutral-100">
          Distribuição de resultados (período)
        </h2>
        <div className="flex flex-wrap gap-4">
          {distribuicaoPeriodo.map(({ resultado, quantidade }) => (
            <div key={resultado} className="flex items-center gap-2 text-sm text-neutral-300">
              <span className={`h-2.5 w-2.5 rounded-full ${RESULTADO_DOT[resultado]}`} />
              {RESULTADO_LABEL_CURTO[resultado]}: {quantidade}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-neutral-100">
          Resultado por mercado (período)
        </h2>
        <MercadoTable trades={noPeriodo} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-neutral-100">
          Ativos mais operados (período)
        </h2>
        <AtivosTable trades={noPeriodo} />
      </div>

      <div className={`${card} p-4`}>
        <h2 className="mb-2 text-sm font-semibold text-neutral-100">
          Curva de capital (R$)
          <span className="ml-2 text-xs font-normal text-red-400">
            área vermelha = drawdown máximo
          </span>
        </h2>
        <CapitalCurveChart data={curvaData} drawdownArea={drawdownArea} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={`${card} p-4`}>
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">
            Resultado por mercado (R$) — histórico completo
          </h2>
          <MercadoChart data={mercadoData} />
        </div>

        <div className={`${card} p-4`}>
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">
            Quantidade de trades por mês
          </h2>
          <TradesPorMesChart data={mesData} />
        </div>
      </div>

      <DiasStats stats={diasStats} />
      <HeatmapCalendario porDia={porDia} />

      <ProjecaoCrescimento projecoes={projecoes} />
    </div>
  );
}
