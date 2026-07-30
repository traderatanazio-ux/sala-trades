"use client";

import { deleteTrade } from "../actions";
import { btnDanger } from "@/lib/ui";

export function DeleteButton({ id }: { id: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm("Excluir esta operação permanentemente?")) {
          deleteTrade(id);
        }
      }}
      className={btnDanger}
    >
      Excluir operação
    </button>
  );
}
