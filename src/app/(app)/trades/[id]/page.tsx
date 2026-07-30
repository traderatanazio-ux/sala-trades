import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatarR, MERCADO_LABEL, RESULTADO_LABEL, type Trade } from "@/lib/trades";
import { updateTradeDetails } from "../actions";
import { TradeFields } from "../TradeFields";
import { DeleteButton } from "../DeleteButton";
import { btnSecondary, card } from "@/lib/ui";

const RESULTADO_COLOR: Record<Trade["resultado"], string> = {
  positivo: "text-emerald-400",
  negativo: "text-red-400",
  breakeven: "text-neutral-400",
};

async function signedUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string | null
) {
  if (!path) return null;
  const { data } = await supabase.storage
    .from("prints")
    .createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export default async function TradeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: trade } = await supabase
    .from("trades")
    .select("*")
    .eq("id", id)
    .single<Trade>();

  if (!trade) notFound();

  const [antesUrl, depoisUrl] = await Promise.all([
    signedUrl(supabase, trade.print_antes_path),
    signedUrl(supabase, trade.print_depois_path),
  ]);

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">
            {trade.ativo} — {MERCADO_LABEL[trade.mercado]}
          </h1>
          <p className={`text-sm font-medium ${RESULTADO_COLOR[trade.resultado]}`}>
            {RESULTADO_LABEL[trade.resultado]} · {formatarR(trade.resultado_r)}
          </p>
        </div>
        <DeleteButton id={trade.id} />
      </div>

      {(antesUrl || depoisUrl) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {antesUrl && (
            <div>
              <p className="mb-1 text-xs text-neutral-500">Antes</p>
              <a href={antesUrl} target="_blank" rel="noreferrer">
                <Image
                  src={antesUrl}
                  alt="Print de antes"
                  width={400}
                  height={225}
                  unoptimized
                  className="rounded-lg border border-neutral-800 object-cover shadow-md shadow-black/30"
                />
              </a>
            </div>
          )}
          {depoisUrl && (
            <div>
              <p className="mb-1 text-xs text-neutral-500">Depois</p>
              <a href={depoisUrl} target="_blank" rel="noreferrer">
                <Image
                  src={depoisUrl}
                  alt="Print de depois"
                  width={400}
                  height={225}
                  unoptimized
                  className="rounded-lg border border-neutral-800 object-cover shadow-md shadow-black/30"
                />
              </a>
            </div>
          )}
        </div>
      )}

      <section className={`${card} p-5`}>
        <h2 className="mb-4 text-sm font-semibold text-neutral-100">
          Dados da operação
        </h2>
        <form
          action={updateTradeDetails.bind(null, trade.id)}
          className="flex flex-col gap-6"
        >
          <TradeFields trade={trade} />
          <button type="submit" className={`w-fit ${btnSecondary}`}>
            Salvar alterações
          </button>
        </form>
      </section>

      {trade.observacoes && (
        <section className={`${card} p-5`}>
          <h2 className="mb-2 text-sm font-semibold text-neutral-100">
            Observações
          </h2>
          <p className="whitespace-pre-wrap text-sm text-neutral-300">
            {trade.observacoes}
          </p>
        </section>
      )}
    </div>
  );
}
