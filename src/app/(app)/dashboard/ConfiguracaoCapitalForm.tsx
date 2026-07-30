import { atualizarConfiguracaoCapital } from "./actions";
import { btnPrimary, card, inputClass, labelClass } from "@/lib/ui";

export function ConfiguracaoCapitalForm({
  capitalInicial,
  riscoPct,
}: {
  capitalInicial: number;
  riscoPct: number;
}) {
  return (
    <form
      action={atualizarConfiguracaoCapital}
      className={`flex flex-wrap items-end gap-4 ${card} p-4`}
    >
      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="capital_inicial">
          Capital inicial (R$)
        </label>
        <input
          id="capital_inicial"
          name="capital_inicial"
          type="number"
          step="any"
          required
          defaultValue={capitalInicial}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="risco_pct">
          Risco por trade (%)
        </label>
        <input
          id="risco_pct"
          name="risco_pct"
          type="number"
          step="any"
          required
          defaultValue={riscoPct}
          className={inputClass}
        />
      </div>

      <button type="submit" className={btnPrimary}>
        Salvar
      </button>
    </form>
  );
}
