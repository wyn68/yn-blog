export interface MenuItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  roles?: string[];
  children?: MenuItem[];
}

import {
  Home,
  FileText,
  FolderOpen,
  Tags,
  Info,
  LayoutDashboard,
  Folder,
  Tag,
  MessageSquare,
  Image,
  Settings,
  User,
  Users,
  Mail,
  Trash2,
  Cog,
  Bell,
  Activity,
  Link2,
} from "lucide-react";

export const iconMap: Record<string, React.ElementType> = {
  Home,
  FileText,
  FolderOpen,
  Tags,
  Info,
  LayoutDashboard,
  Folder,
  Tag,
  MessageSquare,
  Image,
  Settings,
  User,
  Users,
  Mail,
  Trash2,
  Cog,
  Bell,
  Activity,
  Announcement: FileText,
  Link2,
};

export const publicMenuItems: MenuItem[] = [
  { id: "home", name: "首页", href: "/", icon: "Home" },
  { id: "posts", name: "文章", href: "/posts", icon: "FileText" },
  { id: "announcements", name: "公告", href: "/announcements", icon: "Announcement" },
  { id: "categories", name: "分类", href: "/categories", icon: "FolderOpen" },
  { id: "tags", name: "标签", href: "/tags", icon: "Tags" },
  { id: "links", name: "友链", href: "/links", icon: "Link2" },
  { id: "about", name: "关于", href: "/about", icon: "Info" },
];

export const adminMenuItems: MenuItem[] = [
  { id: "dashboard", name: "仪表盘", href: "/admin", icon: "LayoutDashboard", roles: ["admin", "editor", "author"] },
  { id: "posts", name: "文章管理", href: "/admin/posts", icon: "FileText", roles: ["admin", "editor", "author"] },
  { id: "announcements", name: "公告管理", href: "/admin/announcements", icon: "FileText", roles: ["admin"] },
  { id: "categories", name: "分类管理", href: "/admin/categories", icon: "Folder", roles: ["admin", "editor"] },
  { id: "tags", name: "标签管理", href: "/admin/tags", icon: "Tag", roles: ["admin", "editor"] },
  { id: "comments", name: "评论管理", href: "/admin/comments", icon: "MessageSquare", roles: ["admin", "editor"] },
  { id: "links", name: "友链管理", href: "#", icon: "Link2", roles: ["admin", "editor"], children: [
    { id: "links-list", name: "友链列表", href: "/admin/links", icon: "Link2" },
    { id: "link-applications", name: "友链申请", href: "/admin/link-applications", icon: "Link2" },
  ]},
  { id: "users", name: "用户管理", href: "#", icon: "Users", roles: ["admin"], children: [
    { id: "users-list", name: "用户列表", href: "/admin/users", icon: "Users" },
    { id: "role-applications", name: "角色申请", href: "/admin/users/role-applications", icon: "Users" },
  ]},
  { id: "media", name: "媒体管理", href: "/admin/media", icon: "Image", roles: ["admin", "editor", "author"] },
  { id: "notifications", name: "通知中心", href: "/admin/notifications", icon: "Bell", roles: ["admin"] },
  { id: "email-whitelist", name: "邮箱白名单", href: "/admin/email-whitelist", icon: "Mail", roles: ["admin"] },
  { id: "cleanup-logs", name: "清理日志", href: "/admin/cleanup-logs", icon: "Trash2", roles: ["admin"] },
  { id: "audit-logs", name: "审计日志", href: "/admin/audit-logs", icon: "Activity", roles: ["admin"] },
  { id: "settings", name: "站点设置", href: "/admin/settings", icon: "Settings", roles: ["admin"] },
];

export const userMenuItems: MenuItem[] = [
  { id: "profile", name: "个人中心", href: "/profile", icon: "User" },
  { id: "settings", name: "设置", href: "/settings", icon: "Cog" },
  { id: "admin", name: "后台管理", href: "/admin", icon: "LayoutDashboard", roles: ["admin", "editor", "author"] },
];
