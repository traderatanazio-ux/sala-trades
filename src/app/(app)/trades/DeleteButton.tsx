"use client";

import { deleteTrade } from "./actions";
import { btnDanger } from "@/lib/ui";

export function DeleteButton({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm("Excluir esta operação permanentemente?")) {
          deleteTrade(id);
        }
      }}
      className={compact ? "text-xs text-red-400 transition hover:text-red-300" : btnDanger}
    >
      {compact ? "Excluir" : "Excluir operação"}
    </button>
  );
}
