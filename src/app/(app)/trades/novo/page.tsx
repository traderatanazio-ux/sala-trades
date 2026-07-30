import { createTrade } from "../actions";
import { TradeFields } from "../TradeFields";
import { btnPrimary } from "@/lib/ui";

export default function NovoTradePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-lg font-semibold tracking-tight text-neutral-100">
        Nova operação
      </h1>

      <form action={createTrade} className="flex flex-col gap-6">
        <TradeFields />

        <button type="submit" className={`w-fit ${btnPrimary}`}>
          Registrar operação
        </button>
      </form>
    </div>
  );
}
