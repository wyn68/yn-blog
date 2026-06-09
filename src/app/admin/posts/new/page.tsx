'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { handleCreatePost } from '@/actions/posts';
import PostForm from '@/components/admin/posts/PostForm';

export default function NewPostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await handleCreatePost(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/posts"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回文章列表
          </Link>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6">新建文章</h1>

      <PostForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
