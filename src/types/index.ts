export type Role = "admin" | "editor" | "author" | "user";

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  role: Role;
  role_application_status: "pending" | "approved" | "rejected" | null;
  role_application_notified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Link {
  id: string;
  name: string;
  url: string;
  description: string | null;
  avatar: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LinkApplication {
  id: string;
  name: string;
  url: string;
  description: string | null;
  avatar: string | null;
  applicant_name: string | null;
  applicant_email: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  review_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  status: "draft" | "published" | "archived";
  author_id: string;
  category_id: string | null;
  view_count: number;
  like_count: number;
  created_at: string;
  updated_at: string;
  reading_time?: number;
  comment_count?: number;
  profiles?: {
    id?: string;
    username: string;
    user_id?: string;
    avatar_url?: string | null;
  };
  categories?: {
    name: string;
    slug: string;
  };
}

export interface PostTag {
  post_id: string;
  tag_id: string;
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  status: "approved" | "pending" | "rejected";
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
  posts?: {
    title: string;
    slug: string;
  };
}

export interface MediaFile {
  id: string;
  name: string;
  path: string;
  type: string;
  size: number;
  uploaded_by: string;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user: {
    id: string;
    email: string | null;
  };
  expires_at: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  is_published: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  username: string | null;
  role: string | null;
  action: string;
  target: string | null;
  check_type: string | null;
  created_at: string;
}
