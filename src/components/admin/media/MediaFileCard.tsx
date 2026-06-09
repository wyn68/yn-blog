'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { ImageIcon, Trash2 } from 'lucide-react';
import { formatFileSize } from '@/services/media';
import { isImageType } from '@/lib/status';
import { createClient } from '@/lib/supabase';

interface MediaFile {
  id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

interface MediaFileCardProps {
  file: MediaFile;
  onDelete?: (fileId: string) => void;
}

export function MediaFileCard({ file, onDelete }: MediaFileCardProps) {
  const isImage = isImageType(file.type);
  const [imageError, setImageError] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const publicUrl = useMemo(() => {
    const { data } = supabase.storage.from('media').getPublicUrl(file.path);
    return data.publicUrl;
  }, [supabase, file.path]);

  return (
    <tr key={file.id} className="border-b border-border hover:bg-accent/50 transition-colors">
      <td className="p-4">
        {isImage && !imageError ? (
          <div className="w-12 h-12 rounded overflow-hidden bg-muted relative">
            <Image
              src={publicUrl}
              alt={file.name}
              fill
              sizes="48px"
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded bg-accent flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </td>
      <td className="p-4 font-medium truncate max-w-xs">{file.name}</td>
      <td className="p-4 text-muted-foreground whitespace-nowrap">{formatFileSize(file.size)}</td>
      <td className="p-4 text-muted-foreground whitespace-nowrap">{file.profiles?.username || '未知'}</td>
      <td className="p-4 text-muted-foreground whitespace-nowrap">
        {new Date(file.created_at).toLocaleDateString('zh-CN')}
      </td>
      <td className="p-4 text-right">
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(file.id)}
            className="btn btn-ghost p-2 text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </td>
    </tr>
  );
}