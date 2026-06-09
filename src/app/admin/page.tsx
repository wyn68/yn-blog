import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Folder, Tag, MessageSquare, TrendingUp, Plus, Eye, Clock, Link2, Users, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { hasRole, type Role } from "@/lib/role";
import { getDashboardStats } from "@/services/dashboard";
import { getPostStatusLabel, getPostStatusColor, type PostStatus } from "@/lib/status";

export default async function AdminDashboard() {
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
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const userRole = profile.role as Role;
  const isEditorOrHigher = hasRole(userRole, 'editor');
  const isAdmin = hasRole(userRole, 'admin');

  // 使用统一的 service 层获取仪表盘数据
  const dashboard = await getDashboardStats({
    role: userRole,
    authorId: profile.id,
  });

  const stats = [
    {
      label: "已发布文章",
      value: dashboard.publishedPosts,
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-600",
    },
    {
      label: "分类",
      value: isEditorOrHigher ? dashboard.categories : "-",
      icon: Folder,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
      textColor: "text-green-600",
    },
    {
      label: "标签",
      value: isEditorOrHigher ? dashboard.tags : "-",
      icon: Tag,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-600",
    },
    {
      label: "已通过评论",
      value: dashboard.approvedComments,
      icon: MessageSquare,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10",
      textColor: "text-orange-600",
    },
  ];

  const pendingCommentsCount = dashboard.pendingComments;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">欢迎回来</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">这是您的博客管理后台</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:opacity-90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          新建文章
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`card p-4 sm:p-6 animate-fade-in-up stagger-${i + 1}`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.textColor}`} />
              </div>
              {typeof stat.value === 'number' && (
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {isEditorOrHigher && (dashboard.pendingComments > 0 || dashboard.pendingLinkApplications > 0 || dashboard.pendingRoleApplications > 0 || dashboard.unreadMessages > 0) && (
        <div className="space-y-3">
          {dashboard.pendingComments > 0 && (
            <Link
              href="/admin/comments"
              className="card p-4 sm:p-6 flex items-center justify-between hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold">待审核评论</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">有 {dashboard.pendingComments} 条评论等待审核</p>
                </div>
              </div>
              <span className="px-2 sm:px-3 py-1 bg-yellow-500/10 text-yellow-600 text-xs sm:text-sm font-medium rounded-full group-hover:bg-yellow-500/20 transition-colors">
                查看
              </span>
            </Link>
          )}

          {dashboard.pendingLinkApplications > 0 && (
            <Link
              href="/admin/link-applications"
              className="card p-4 sm:p-6 flex items-center justify-between hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Link2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">待处理友链申请</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">有 {dashboard.pendingLinkApplications} 条友链申请等待处理</p>
                </div>
              </div>
              <span className="px-2 sm:px-3 py-1 bg-blue-500/10 text-blue-600 text-xs sm:text-sm font-medium rounded-full group-hover:bg-blue-500/20 transition-colors">
                查看
              </span>
            </Link>
          )}

          {dashboard.pendingRoleApplications > 0 && (
            <Link
              href="/admin/users/role-applications"
              className="card p-4 sm:p-6 flex items-center justify-between hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">待处理角色申请</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">有 {dashboard.pendingRoleApplications} 条角色申请等待处理</p>
                </div>
              </div>
              <span className="px-2 sm:px-3 py-1 bg-purple-500/10 text-purple-600 text-xs sm:text-sm font-medium rounded-full group-hover:bg-purple-500/20 transition-colors">
                查看
              </span>
            </Link>
          )}

          {dashboard.unreadMessages > 0 && (
            <Link
              href="/admin/notifications"
              className="card p-4 sm:p-6 flex items-center justify-between hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">未读用户留言</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">有 {dashboard.unreadMessages} 条用户留言未读</p>
                </div>
              </div>
              <span className="px-2 sm:px-3 py-1 bg-green-500/10 text-green-600 text-xs sm:text-sm font-medium rounded-full group-hover:bg-green-500/20 transition-colors">
                查看
              </span>
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold">最近文章</h2>
            <Link href="/admin/posts" className="text-xs sm:text-sm text-primary hover:underline">
              查看全部
            </Link>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {dashboard.recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between py-2 sm:py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/30" />
                  <div className="min-w-0">
                    <h3 className="font-medium text-sm sm:text-base truncate">{post.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(post.created_at).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getPostStatusColor(post.status as PostStatus)}`}>
                    {getPostStatusLabel(post.status as PostStatus)}
                  </span>
                  <Link
                    href={`/posts/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">快捷操作</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Link
              href="/admin/posts/new"
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <span className="font-medium text-sm">新建文章</span>
            </Link>
            
            {isEditorOrHigher && (
              <>
                <Link
                  href="/admin/categories/new"
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Folder className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <span className="font-medium text-sm">新建分类</span>
                </Link>
                <Link
                  href="/admin/tags/new"
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                  <span className="font-medium text-sm">新建标签</span>
                </Link>
              </>
            )}
            
            <Link
              href="/admin/media"
              className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
              <span className="font-medium text-sm">媒体管理</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
