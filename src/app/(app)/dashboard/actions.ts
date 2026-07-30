"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function atualizarConfiguracaoCapital(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const capital_inicial = Number(formData.get("capital_inicial"));
  const risco_pct = Number(formData.get("risco_pct"));

  if (!Number.isFinite(capital_inicial) || !Number.isFinite(risco_pct)) {
    throw new Error("Capital inicial e risco por trade devem ser números válidos.");
  }

  const { error } = await supabase.from("configuracoes").upsert({
    user_id: user.id,
    capital_inicial,
    risco_pct,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(`Falha ao salvar configuração: ${error.message}`);

  revalidatePath("/dashboard");
  revalidatePath("/trades");
}
