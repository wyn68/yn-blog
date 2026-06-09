import type { Metadata } from "next";
import { getLinks } from "@/services/links";
import type { Link } from "@/types";
import LinksClient from "./LinksClient";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "友链",
  description: "友情链接 - 发现更多有趣的网站和博客",
  alternates: {
    canonical: `${baseUrl}/links`,
  },
};

export default async function LinksPage() {
  let links: Link[] = [];
  try {
    links = await getLinks();
  } catch (error) {
    console.error("Failed to load links:", error);
  }

  return <LinksClient links={links} />;
}
