"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase";

export async function handleLogout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}