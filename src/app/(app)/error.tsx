"use client";

import { useEffect } from "react";
import Link from "next/link";
import { btnPrimary, btnSecondary, card } from "@/lib/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className={`w-full max-w-md p-6 text-center ${card}`}>
        <h1 className="mb-2 text-lg font-semibold text-neutral-100">Algo deu errado</h1>
        <p className="mb-6 text-sm text-neutral-400">
          {error.message || "Não foi possível concluir a ação. Tente novamente."}
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={() => reset()} className={btnPrimary}>
            Tentar novamente
          </button>
          <Link href="/dashboard" className={btnSecondary}>
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
