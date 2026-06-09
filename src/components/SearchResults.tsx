"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";

interface SearchPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  created_at: string;
  categories?: { name: string };
  profiles?: { id?: string; username: string; avatar_url?: string | null };
}

interface SearchResultsProps {
  posts: SearchPost[];
  query: string;
}

export default function SearchResults({ posts, query }: SearchResultsProps) {
  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {posts?.map((post) => (
          <article key={post.id} className="card p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {post.categories && (
                  <span className="text-xs px-2 py-1 bg-accent rounded-full">
                    {post.categories.name}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 hover:text-primary transition-colors">
                <LoadingLink href={`/posts/${post.slug}`}>{post.title}</LoadingLink>
              </h2>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {post.excerpt || post.content.substring(0, 150)}...
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                <span className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <div className="relative w-5 h-5 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                    {post.profiles?.avatar_url ? (
                      <Image
                        src={post.profiles.avatar_url}
                        alt={post.profiles.username}
                        fill
                        sizes="20px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-xs">{post.profiles?.username?.charAt(0).toUpperCase() || "?"}</span>
                    )}
                  </div>
                  {post.profiles?.username || "匿名作者"}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString("zh-CN")}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {(!posts || posts.length === 0) && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {query ? "没有找到相关文章" : "请输入搜索关键词"}
          </p>
        </div>
      )}
    </>
  );
}