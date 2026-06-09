export type Role = "admin" | "editor" | "author" | "user";

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: [
    "manage_users",
    "manage_posts",
    "manage_categories",
    "manage_tags",
    "manage_comments",
    "manage_media",
    "manage_settings",
    "view_dashboard",
  ],
  editor: [
    "manage_posts",
    "manage_categories",
    "manage_tags",
    "manage_comments",
    "manage_media",
    "view_dashboard",
  ],
  author: [
    "manage_posts",
    "manage_comments",
    "view_dashboard",
  ],
  user: [],
};

export function hasRole(profileRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    admin: 4,
    editor: 3,
    author: 2,
    user: 1,
  };
  return roleHierarchy[profileRole] >= roleHierarchy[requiredRole];
}
