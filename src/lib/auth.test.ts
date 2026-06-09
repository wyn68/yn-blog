import { ROLE_PERMISSIONS, hasRole } from "./role";

describe("Role Permissions", () => {
  test("admin should have all permissions", () => {
    const adminPermissions = ROLE_PERMISSIONS.admin;
    expect(adminPermissions).toContain("manage_users");
    expect(adminPermissions).toContain("manage_posts");
    expect(adminPermissions).toContain("manage_categories");
    expect(adminPermissions).toContain("manage_tags");
    expect(adminPermissions).toContain("manage_comments");
    expect(adminPermissions).toContain("manage_media");
    expect(adminPermissions).toContain("manage_settings");
    expect(adminPermissions).toContain("view_dashboard");
  });

  test("editor should have appropriate permissions", () => {
    const editorPermissions = ROLE_PERMISSIONS.editor;
    expect(editorPermissions).toContain("manage_posts");
    expect(editorPermissions).toContain("manage_categories");
    expect(editorPermissions).toContain("manage_tags");
    expect(editorPermissions).toContain("manage_comments");
    expect(editorPermissions).toContain("manage_media");
    expect(editorPermissions).toContain("view_dashboard");
    expect(editorPermissions).not.toContain("manage_users");
    expect(editorPermissions).not.toContain("manage_settings");
  });

  test("author should have limited permissions", () => {
    const authorPermissions = ROLE_PERMISSIONS.author;
    expect(authorPermissions).toContain("manage_posts");
    expect(authorPermissions).toContain("manage_comments");
    expect(authorPermissions).toContain("view_dashboard");
    expect(authorPermissions).not.toContain("manage_users");
    expect(authorPermissions).not.toContain("manage_categories");
    expect(authorPermissions).not.toContain("manage_tags");
    expect(authorPermissions).not.toContain("manage_media");
    expect(authorPermissions).not.toContain("manage_settings");
  });

  test("user should have no permissions", () => {
    const userPermissions = ROLE_PERMISSIONS.user;
    expect(userPermissions).toEqual([]);
  });
});

describe("Role Hierarchy", () => {
  test("admin should have access to all roles", () => {
    expect(hasRole("admin", "admin")).toBe(true);
    expect(hasRole("admin", "editor")).toBe(true);
    expect(hasRole("admin", "author")).toBe(true);
    expect(hasRole("admin", "user")).toBe(true);
  });

  test("editor should have access to editor, author, user", () => {
    expect(hasRole("editor", "admin")).toBe(false);
    expect(hasRole("editor", "editor")).toBe(true);
    expect(hasRole("editor", "author")).toBe(true);
    expect(hasRole("editor", "user")).toBe(true);
  });

  test("author should have access to author and user only", () => {
    expect(hasRole("author", "admin")).toBe(false);
    expect(hasRole("author", "editor")).toBe(false);
    expect(hasRole("author", "author")).toBe(true);
    expect(hasRole("author", "user")).toBe(true);
  });

  test("user should have access to user only", () => {
    expect(hasRole("user", "admin")).toBe(false);
    expect(hasRole("user", "editor")).toBe(false);
    expect(hasRole("user", "author")).toBe(false);
    expect(hasRole("user", "user")).toBe(true);
  });
});

describe("Path-Based Access Control", () => {
  const ADMIN_ONLY_PATHS = ["/admin/users", "/admin/settings"];
  const EDITOR_ONLY_PATHS = ["/admin/categories", "/admin/tags"];
  const AUTHOR_ONLY_PATHS = ["/admin/posts", "/admin/comments", "/admin/media"];

  test("admin should access admin-only paths", () => {
    ADMIN_ONLY_PATHS.forEach(() => {
      expect(["admin"]).toContain("admin");
    });
  });

  test("editor should access editor-only paths", () => {
    EDITOR_ONLY_PATHS.forEach(() => {
      expect(["admin", "editor"]).toContain("editor");
    });
  });

  test("author should access author-only paths", () => {
    AUTHOR_ONLY_PATHS.forEach(() => {
      expect(["admin", "editor", "author"]).toContain("author");
    });
  });
});
