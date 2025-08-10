// src/lib/storage.ts
import { supabase } from "@/lib/supabaseClient"; // se exportar default, troque para: import supabase from "@/lib/supabaseClient";

export type UploadOpts = {
  bucket: "uploads" | "propostas" | "contratos";
  file: any;              // File | Blob
  subpath?: string;       // ex.: "propostas/123"
  upsert?: boolean;
  expiresIn?: number;     // segundos (default 3600)
};

export async function uploadUserFile(opts: UploadOpts) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Não autenticado");
  const uid = user.id;

  const name = (opts.file && (opts.file as any).name) ? String((opts.file as any).name) : "file.bin";
  const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase() : "bin";
  const base = opts.subpath ? `${String(opts.subpath).replace(/^\/+|\/+$/g, "")}/` : "";
  const path = `user/${uid}/${base}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(opts.bucket)
    .upload(path, opts.file, { upsert: !!opts.upsert });
  if (upErr) throw upErr;

  const expires = typeof opts.expiresIn === "number" ? opts.expiresIn : 3600;
  const { data: signed, error: sErr } = await supabase.storage
    .from(opts.bucket)
    .createSignedUrl(path, expires);
  if (sErr) throw sErr;

  return { path, signedUrl: signed!.signedUrl as string };
}

export async function signedUrl(bucket: UploadOpts["bucket"], path: string, expiresIn = 3600) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data!.signedUrl as string;
}

export async function removeFile(bucket: UploadOpts["bucket"], path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
