import { importarLote } from "../actions";
import { btnPrimary, card, fileInputClass } from "@/lib/ui";

export default function ImportarLotePage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-lg font-semibold text-neutral-100">Importar prints em lote</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Selecione todas as imagens numeradas na ordem: a 1ª e a 2ª formam o antes/depois do
        primeiro trade, a 3ª e a 4ª do segundo, e assim por diante. Cada par vira um trade novo
        com ativo <span className="font-semibold text-neutral-200">A DEFINIR</span>, data de hoje
        e resultado 0 — depois é só ir em Trades, buscar por &quot;a definir&quot; e preencher o
        ativo, a data e o resultado de cada um.
      </p>

      <form action={importarLote} className={`flex flex-col gap-4 ${card} p-4`}>
        <input
          type="file"
          name="prints"
          multiple
          required
          accept="image/*"
          className={fileInputClass}
        />
        <button type="submit" className={`w-fit ${btnPrimary}`}>
          Importar
        </button>
      </form>
    </div>
  );
}
