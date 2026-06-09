import { createPublicClient } from "@/lib/supabase";
import { redisViewRateLimiter as viewRateLimiter } from "@/lib/redis-rate-limiter";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const clientIp = request.headers.get("x-forwarded-for") || 
                   request.headers.get("x-real-ip") || 
                   "unknown";
  const rateLimitKey = `stats:${clientIp}`;
  
  const { allowed } = await viewRateLimiter.check(rateLimitKey);
  if (!allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = createPublicClient();

  const [{ count: posts }, { count: categories }, { count: tags }, { data: latestPost }] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("tags").select("id", { count: "exact", head: true }),
    supabase
      .from("posts")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  return Response.json({
    posts: posts || 0,
    categories: categories || 0,
    tags: tags || 0,
    lastUpdated: latestPost?.[0]?.created_at
      ? new Date(latestPost[0].created_at).toLocaleDateString("zh-CN")
      : "暂无数据",
  });
}