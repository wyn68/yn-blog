"use client";

import { FileQuestion, Search, MessageCircle, Image, Folder } from "lucide-react";
import LoadingLink from "@/components/LoadingLink";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

interface EmptyStateProps {
  type: "posts" | "search" | "comments" | "media" | "categories" | "general";
  title?: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const emptyStateConfig = {
  posts: {
    icon: FileQuestion,
    title: "暂无文章",
    description: "还没有发布任何文章，开始创作吧！",
  },
  search: {
    icon: Search,
    title: "未找到结果",
    description: "没有找到匹配的文章，请尝试其他关键词。",
  },
  comments: {
    icon: MessageCircle,
    title: "暂无评论",
    description: "快来发表第一条评论吧！",
  },
  media: {
    icon: Image,
    title: "暂无媒体文件",
    description: "上传图片或其他媒体文件。",
  },
  categories: {
    icon: Folder,
    title: "暂无分类",
    description: "创建分类来整理您的文章。",
  },
  general: {
    icon: FileQuestion,
    title: "这里什么都没有",
    description: "暂时没有内容。",
  },
};

export default function EmptyState({ type, title, description, action }: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <Card variant="outline" padding="lg" className="mb-6">
        <CardContent className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      <h3 className="text-lg font-semibold mb-2">{title || config.title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description || config.description}</p>
      {action && (
        action.href ? (
          <LoadingLink href={action.href}>
            <Button>{action.label}</Button>
          </LoadingLink>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  );
}
