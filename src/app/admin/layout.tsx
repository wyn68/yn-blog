import { redirect } from "next/navigation";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase";
import { hasRole, type Role } from "@/lib/role";
import { Skeleton } from "@/components/ui/Skeleton";

const AdminLayoutClient = dynamic(() => import("./AdminLayoutClient"), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-96" />
      </div>
    </div>
  ),
});

/**
 * 管理后台布局。
 * 注意：middleware.ts 已做初步的 session 和角色检查，
 * 此处主要获取完整的 profile 数据用于渲染，并做二次校验以防 middleware 遗漏。
 * 两者保持角色检查逻辑一致（均使用 hasRole + ROLE_PERMISSIONS）。
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // 使用与 middleware 一致的 hasRole 函数
  if (!hasRole(profile.role as Role, "author")) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const loginUrl = new URL("/login", baseUrl);
    loginUrl.searchParams.set("error", "permission_denied");
    redirect(loginUrl.href);
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-96" />
        </div>
      </div>
    }>
      <AdminLayoutClient
        userEmail={user.email || ''}
        userId={user.id}
        profile={profile}
      >
        {children}
      </AdminLayoutClient>
    </Suspense>
  );
}
