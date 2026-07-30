import type { Trade } from "@/lib/trades";
import { fileInputClass, inputClass, labelClass } from "@/lib/ui";

function toDateInput(value: string | null | undefined) {
  const d = value ? new Date(value) : new Date();
  return d.toLocaleDateString("sv-SE"); // yyyy-MM-dd no fuso horário local
}

export function TradeFields({ trade }: { trade?: Trade }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="ativo">
          Ativo
        </label>
        <input
          id="ativo"
          name="ativo"
          required
          placeholder="PETR4, BTCUSD, EURUSD..."
          defaultValue={trade?.ativo}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="mercado">
          Mercado
        </label>
        <select
          id="mercado"
          name="mercado"
          required
          defaultValue={trade?.mercado ?? "b3"}
          className={inputClass}
        >
          <option value="b3">B3</option>
          <option value="cripto">Cripto</option>
          <option value="forex">Forex</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="direcao">
          Direção
        </label>
        <select
          id="direcao"
          name="direcao"
          required
          defaultValue={trade?.direcao ?? "compra"}
          className={inputClass}
        >
          <option value="compra">Compra</option>
          <option value="venda">Venda</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="data">
          Data
        </label>
        <input
          id="data"
          name="data"
          type="date"
          required
          defaultValue={toDateInput(trade?.data)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className={labelClass} htmlFor="resultado_r">
          Risco retorno
        </label>
        <input
          id="resultado_r"
          name="resultado_r"
          type="number"
          step="any"
          required
          placeholder="2 = 2x de lucro, -1 = 1x de prejuízo, 0 = breakeven"
          defaultValue={trade?.resultado_r}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="print_antes">
          Print de antes {trade?.print_antes_path && "(substituir)"}
        </label>
        <input
          id="print_antes"
          name="print_antes"
          type="file"
          accept="image/*"
          className={fileInputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass} htmlFor="print_depois">
          Print de depois {trade?.print_depois_path && "(substituir)"}
        </label>
        <input
          id="print_depois"
          name="print_depois"
          type="file"
          accept="image/*"
          className={fileInputClass}
        />
      </div>

      <div className="flex flex-col gap-1 sm:col-span-2">
        <label className={labelClass} htmlFor="observacoes">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          defaultValue={trade?.observacoes ?? ""}
          className={inputClass}
        />
      </div>
    </div>
  );
}
