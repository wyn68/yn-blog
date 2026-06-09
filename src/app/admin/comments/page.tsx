'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { handleApproveComment, handleRejectComment, handleDeleteComment } from '@/actions/comments';
import { CommentCard } from '@/components/admin/comments/CommentCard';
import { useCommentManagement } from '@/hooks/admin';
import { useToast } from '@/components/ui/Toast';
import { DeleteConfirmModal, ConfirmModal } from '@/components/admin';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type ConfirmAction = 'approve' | 'reject' | 'restore' | 'hide';

export default function CommentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    pendingComments,
    approvedComments,
    rejectedComments,
    isLoading,
    filterComments,
    updateCommentStatus,
    removeComment,
  } = useCommentManagement();
  const { success, error } = useToast();

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    commentId: null as string | null,
    isLoading: false,
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    commentId: null as string | null,
    action: 'approve' as ConfirmAction,
    isLoading: false,
  });

  const filteredPending = filterComments(pendingComments, searchTerm);
  const filteredApproved = filterComments(approvedComments, searchTerm);
  const filteredRejected = filterComments(rejectedComments, searchTerm);

  const handleConfirmAction = async () => {
    if (!confirmModal.commentId) return;
    setConfirmModal((prev) => ({ ...prev, isLoading: true }));

    try {
      const { commentId, action } = confirmModal;

      switch (action) {
        case 'approve':
          await handleApproveComment(commentId);
          updateCommentStatus(commentId, 'approved');
          success('操作成功', '评论已通过');
          break;
        case 'reject':
          await handleRejectComment(commentId);
          updateCommentStatus(commentId, 'rejected');
          success('操作成功', '评论已拒绝');
          break;
        case 'restore':
          await handleApproveComment(commentId);
          updateCommentStatus(commentId, 'approved');
          success('操作成功', '评论已恢复');
          break;
        case 'hide':
          await handleRejectComment(commentId);
          updateCommentStatus(commentId, 'rejected');
          success('操作成功', '评论已隐藏');
          break;
      }
    } catch (err) {
      error('操作失败', err instanceof Error ? err.message : '操作失败');
    } finally {
      setConfirmModal({ isOpen: false, commentId: null, action: 'approve', isLoading: false });
    }
  };

  const openConfirmModal = (commentId: string, action: ConfirmAction) => {
    setConfirmModal({ isOpen: true, commentId, action, isLoading: false });
  };

  const handleDelete = async () => {
    if (!deleteModal.commentId) return;
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await handleDeleteComment(deleteModal.commentId);
      removeComment(deleteModal.commentId);
      success('操作成功', '评论已删除');
      setDeleteModal({ isOpen: false, commentId: null, isLoading: false });
    } catch (err) {
      error('操作失败', err instanceof Error ? err.message : '操作失败');
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const openDeleteModal = (commentId: string) => {
    setDeleteModal({ isOpen: true, commentId, isLoading: false });
  };

  const getConfirmModalConfig = () => {
    const { action } = confirmModal;
    const configs = {
      approve: {
        title: '确认通过',
        description: '确定要通过这条评论吗？通过后评论将对所有用户可见。',
        confirmText: '通过',
        isDestructive: false,
      },
      reject: {
        title: '确认拒绝',
        description: '确定要拒绝这条评论吗？拒绝后评论将被隐藏，但可恢复。',
        confirmText: '拒绝',
        isDestructive: false,
      },
      restore: {
        title: '确认恢复',
        description: '确定要恢复这条评论吗？恢复后评论将重新对所有用户可见。',
        confirmText: '恢复',
        isDestructive: false,
      },
      hide: {
        title: '确认隐藏',
        description: '确定要隐藏这条评论吗？隐藏后评论将不可见，但可恢复。',
        confirmText: '隐藏',
        isDestructive: false,
      },
    };
    return configs[action];
  };

  const confirmConfig = getConfirmModalConfig();

  if (isLoading) {
    return <LoadingSpinner text="加载评论中..." />;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">评论管理</h1>
          <p className="text-muted-foreground text-sm sm:text-base">管理博客评论</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索评论内容..."
            className="input pl-10 w-full"
          />
        </div>
      </div>

      <div className="mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
          待审核评论 ({filteredPending.length})
        </h2>

        <div className="space-y-3 sm:space-y-4">
          {filteredPending?.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onApprove={() => openConfirmModal(comment.id, 'approve')}
              onReject={() => openConfirmModal(comment.id, 'reject')}
              onDelete={openDeleteModal}
            />
          ))}

          {(!filteredPending || filteredPending.length === 0) && (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
              暂无待审核评论
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          已通过评论 ({filteredApproved.length})
        </h2>

        <div className="space-y-3 sm:space-y-4">
          {filteredApproved?.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onHide={() => openConfirmModal(comment.id, 'hide')}
              onDelete={openDeleteModal}
            />
          ))}

          {(!filteredApproved || filteredApproved.length === 0) && (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
              暂无已通过评论
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 sm:mt-8">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          已拒绝评论 ({filteredRejected.length})
        </h2>

        <div className="space-y-3 sm:space-y-4">
          {filteredRejected?.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onRestore={() => openConfirmModal(comment.id, 'restore')}
              onDelete={openDeleteModal}
            />
          ))}

          {(!filteredRejected || filteredRejected.length === 0) && (
            <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
              暂无已拒绝评论
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, commentId: null, isLoading: false })}
        onConfirm={handleDelete}
        isLoading={deleteModal.isLoading}
        title="删除评论"
        description="确定要删除这条评论吗？此操作无法撤销。"
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, commentId: null, action: 'approve', isLoading: false })}
        onConfirm={handleConfirmAction}
        isLoading={confirmModal.isLoading}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        isDestructive={confirmConfig.isDestructive}
      />
    </div>
  );
}