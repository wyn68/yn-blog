import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { hasRole, type Role } from "@/lib/role";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const ADMIN_ONLY_PATHS = [
  "/admin/users",
  "/admin/settings",
];

const EDITOR_ONLY_PATHS = [
  "/admin/categories",
  "/admin/tags",
];

const AUTHOR_ONLY_PATHS = [
  "/admin/posts",
  "/admin/comments",
  "/admin/media",
];

function getRequiredRole(pathname: string): Role {
  if (ADMIN_ONLY_PATHS.some(path => pathname.startsWith(path))) {
    return "admin";
  }
  if (EDITOR_ONLY_PATHS.some(path => pathname.startsWith(path))) {
    return "editor";
  }
  if (AUTHOR_ONLY_PATHS.some(path => pathname.startsWith(path)) || pathname === "/admin") {
    return "author";
  }
  return "user";
}

async function getUserRoleFromProfile(supabase: ReturnType<typeof createServerClient>, userId: string): Promise<Role> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .single();
  
  if (error || !profile?.role) {
    return "user";
  }
  
  return profile.role as Role;
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname === "/login" || isApiRoute(pathname)) {
    // 创建单一 response 对象，cookie 操作在此对象上执行
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // 直接在当前 response 上设置 cookie，而非创建新 response
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // 直接在当前 response 上清除 cookie，而非创建新 response
          response.cookies.set({ name, value: "", maxAge: 0, ...options });
        },
      },
    });

    const { data: { session } } = await supabase.auth.getSession();

    if (pathname.startsWith("/admin")) {
      if (!session) {
        if (isApiRoute(pathname)) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // 优先从 JWT app_metadata 读取角色（由 sync_role_to_jwt 触发器自动同步），
      // 仅在 JWT 中无角色时回退到数据库查询
      const jwtRole = session.user.app_metadata?.role as Role | undefined;
      const userRole: Role = jwtRole && ['admin', 'editor', 'author', 'user'].includes(jwtRole)
        ? jwtRole
        : await getUserRoleFromProfile(supabase, session.user.id);

      const requiredRole = getRequiredRole(pathname);
      
      if (!hasRole(userRole, requiredRole)) {
        if (isApiRoute(pathname)) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "permission_denied");
        return NextResponse.redirect(loginUrl);
      }
    }

    if (pathname === "/login" && session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  }

  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|rss.xml).*)',
  ],
};
