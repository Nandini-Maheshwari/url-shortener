"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { HotUrl } from "@/lib/admin-types";

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const password = formData.get("password") as string;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { error: "Invalid password" };
  }

  const token = createSessionToken();
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/admin/login");
}

export async function searchUrlsAction(
  query: string
): Promise<{ data: HotUrl[] | null; error: string | null }> {
  const trimmed = query.trim();
  if (!trimmed) return { data: null, error: null };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("search_admin_urls", {
    q: trimmed,
  });

  if (error) return { data: null, error: error.message };
  return { data: data as HotUrl[], error: null };
}
