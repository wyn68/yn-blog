import { getSettings } from "@/services/settings";
import { createClient } from "@/lib/supabase";
import { hasRole, type Role } from "@/lib/role";
import { NextResponse } from "next/server";

export async function GET() {
  // 认证检查：仅管理员可访问完整站点设置
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", session.user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!hasRole(profile.role as Role, "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
