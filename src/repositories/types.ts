import type { Post, Category, Tag, Comment, Profile } from "@/types";

export interface PostWithRelations extends Post {
  profiles?: {
    id?: string;
    username: string;
    avatar_url?: string | null;
  };
  categories?: {
    name: string;
    slug: string;
  };
}

export interface CategoryWithPostCount extends Category {
  count?: number;
}

export interface CategoryWithPosts extends Category {
  posts?: Array<{ id: string }>;
}

export interface TagWithPostCount extends Tag {
  count?: number;
}

export interface TagWithPostTags extends Tag {
  post_tags?: Array<{ post_id: string }>;
}

export interface CommentWithRelations extends Comment {
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
  posts?: {
    title: string;
    slug: string;
  };
}

export interface EmailDomain {
  id: string;
  domain: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface FavoriteWithPost extends Favorite {
  posts?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image: string | null;
    created_at: string;
    categories?: {
      name: string;
      slug: string;
    };
  };
}

export interface SessionInfo {
  session: {
    user: {
      id: string;
      email?: string;
      role?: string;
    };
    expires_at: number;
  } | null;
  profile: Profile | null;
}

export interface SiteConfig {
  siteTitle: string;
  siteDescription: string;
  siteAuthor: string;
  postsPerPage: number;
  socialTwitter: string;
  socialGithub: string;
  seoTitle: string;
  seoDescription: string;
}

export interface HeroBannerConfig {
  title: string;
  subtitle: string;
  tag: string;
  images: Array<{
    id: number;
    url: string;
    title: string;
    subtitle: string;
  }>;
}

export interface TopCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export type CreateInput<T> = Omit<T, "id" | "created_at" | "updated_at">;

export type UpdateInput<T> = Partial<T>;
