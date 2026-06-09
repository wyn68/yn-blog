export type CommentStatus = 'pending' | 'approved' | 'rejected';

export type PostStatus = 'draft' | 'published' | 'archived';

export const COMMENT_STATUS_LABELS: Record<CommentStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
};

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '归档',
};

export const COMMENT_STATUS_COLORS: Record<CommentStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  approved: 'bg-green-500/10 text-green-600',
  rejected: 'bg-red-500/10 text-red-600',
};

export const POST_STATUS_COLORS: Record<PostStatus, string> = {
  draft: 'bg-yellow-500/10 text-yellow-600',
  published: 'bg-green-500/10 text-green-600',
  archived: 'bg-gray-500/10 text-gray-600',
};

export function getCommentStatusLabel(status: CommentStatus): string {
  return COMMENT_STATUS_LABELS[status];
}

export function getPostStatusLabel(status: PostStatus): string {
  return POST_STATUS_LABELS[status];
}

export function getCommentStatusColor(status: CommentStatus): string {
  return COMMENT_STATUS_COLORS[status];
}

export function getPostStatusColor(status: PostStatus): string {
  return POST_STATUS_COLORS[status];
}

export function isImageType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function getFileIcon(mimeType: string): string {
  if (isImageType(mimeType)) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('document') || mimeType.includes('text/')) return 'document';
  return 'file';
}