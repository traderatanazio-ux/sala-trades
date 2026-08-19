"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export function PrintsButton({
  ativo,
  antesUrl,
  depoisUrl,
}: {
  ativo: string;
  antesUrl: string | null;
  depoisUrl: string | null;
}) {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [aberto]);

  if (!antesUrl && !depoisUrl) {
    return <span className="text-xs text-neutral-600">—</span>;
  }

  const modal = aberto && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => setAberto(false)}
    >
      <div
        className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-6">
          <h3 className="text-sm font-semibold text-neutral-100">{ativo}</h3>
          <button
            type="button"
            onClick={() => setAberto(false)}
            className="rounded-md border border-neutral-700 px-3 py-1 text-sm text-neutral-300 transition hover:bg-neutral-800"
          >
            Fechar
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {antesUrl && (
            <div>
              <p className="mb-1 text-xs text-neutral-500">Antes</p>
              <a href={antesUrl} target="_blank" rel="noreferrer">
                <Image
                  src={antesUrl}
                  alt="Print de antes"
                  width={900}
                  height={506}
                  unoptimized
                  className="h-auto w-full rounded-lg border border-neutral-800 object-cover"
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
                  width={900}
                  height={506}
                  unoptimized
                  className="h-auto w-full rounded-lg border border-neutral-800 object-cover"
                />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-xs text-sky-400 transition hover:text-sky-300"
      >
        Ver prints
      </button>

      {modal && createPortal(modal, document.body)}
    </>
  );
}
