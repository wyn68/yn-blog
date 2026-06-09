/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { searchPosts } from "@/services/posts";
import { Skeleton } from "@/components/ui/Skeleton";

const SearchResults = dynamic(() => import("@/components/SearchResults"), {
  loading: () => (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card p-6">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  ),
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q: string }> }): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q || "";

  return {
    title: query ? `搜索: ${query}` : "搜索",
    description: query
      ? `搜索 "${query}" 的结果 - YN Blog`
      : "在 YN Blog 中搜索文章",
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/search${query ? `?q=${encodeURIComponent(query)}` : ""}`,
    },
  };
}

async function fetchSearchResults(query: string) {
  if (!query) return [];
  return await searchPosts(query);
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const { q } = await searchParams;
  const query = q || "";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold mb-2">搜索结果</h1>
        <p className="text-muted-foreground text-sm sm:text-base">搜索 {query ? `"${query}"` : ""} 的结果</p>
      </div>

      <Suspense fallback={
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      }>
        <SearchResults posts={await fetchSearchResults(query)} query={query} />
      </Suspense>
    </div>
  );
}