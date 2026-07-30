"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  classificarResultado,
  type Direcao,
  type Mercado,
} from "@/lib/trades";

function parseNumber(value: FormDataEntryValue | null): number | null {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function getUserOrRedirect() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

async function uploadImageIfPresent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  formData: FormData,
  fieldName: string
): Promise<string | undefined> {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size === 0) return undefined;

  const ext = file.name.split(".").pop() || "png";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("prints").upload(path, file, {
    contentType: file.type || undefined,
  });

  if (error) throw new Error(`Falha ao enviar imagem: ${error.message}`);
  return path;
}

export async function createTrade(formData: FormData) {
  const { supabase, user } = await getUserOrRedirect();

  const resultado_r = parseNumber(formData.get("resultado_r"));
  if (resultado_r === null) {
    throw new Error("Risco retorno é obrigatório.");
  }

  const print_antes_path = await uploadImageIfPresent(
    supabase,
    user.id,
    formData,
    "print_antes"
  );
  const print_depois_path = await uploadImageIfPresent(
    supabase,
    user.id,
    formData,
    "print_depois"
  );

  const { data, error } = await supabase
    .from("trades")
    .insert({
      user_id: user.id,
      ativo: String(formData.get("ativo") ?? "").toUpperCase(),
      mercado: formData.get("mercado") as Mercado,
      direcao: formData.get("direcao") as Direcao,
      data: String(formData.get("data") || new Date().toISOString()),
      resultado_r,
      resultado: classificarResultado(resultado_r),
      observacoes: (formData.get("observacoes") as string) || null,
      print_antes_path,
      print_depois_path,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Falha ao criar trade: ${error.message}`);

  revalidatePath("/trades");
  revalidatePath("/dashboard");
  redirect(`/trades/${data.id}`);
}

export async function updateTradeDetails(id: string, formData: FormData) {
  const { supabase, user } = await getUserOrRedirect();

  const resultado_r = parseNumber(formData.get("resultado_r"));
  if (resultado_r === null) {
    throw new Error("Risco retorno é obrigatório.");
  }

  const print_antes_path = await uploadImageIfPresent(
    supabase,
    user.id,
    formData,
    "print_antes"
  );
  const print_depois_path = await uploadImageIfPresent(
    supabase,
    user.id,
    formData,
    "print_depois"
  );

  const { error } = await supabase
    .from("trades")
    .update({
      ativo: String(formData.get("ativo") ?? "").toUpperCase(),
      mercado: formData.get("mercado") as Mercado,
      direcao: formData.get("direcao") as Direcao,
      data: String(formData.get("data")),
      resultado_r,
      resultado: classificarResultado(resultado_r),
      observacoes: (formData.get("observacoes") as string) || null,
      ...(print_antes_path ? { print_antes_path } : {}),
      ...(print_depois_path ? { print_depois_path } : {}),
    })
    .eq("id", id);

  if (error) throw new Error(`Falha ao atualizar trade: ${error.message}`);

  revalidatePath("/trades");
  revalidatePath(`/trades/${id}`);
  revalidatePath("/dashboard");
  redirect(`/trades/${id}`);
}

export async function deleteTrade(id: string) {
  const { supabase } = await getUserOrRedirect();

  const { data: trade } = await supabase
    .from("trades")
    .select("print_antes_path, print_depois_path")
    .eq("id", id)
    .single();

  const paths = [trade?.print_antes_path, trade?.print_depois_path].filter(
    (p): p is string => Boolean(p)
  );
  if (paths.length > 0) {
    await supabase.storage.from("prints").remove(paths);
  }

  const { error } = await supabase.from("trades").delete().eq("id", id);
  if (error) throw new Error(`Falha ao excluir trade: ${error.message}`);

  revalidatePath("/trades");
  revalidatePath("/dashboard");
  redirect("/trades");
}
