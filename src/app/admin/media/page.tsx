'use client';

import { useState } from 'react';
import { Upload, Search } from 'lucide-react';
import { handleUploadFile, handleDeleteMediaFile } from '@/actions/media';
import { MediaFileCard } from '@/components/admin/media/MediaFileCard';
import { useMediaManagement, useSettings, useAdminUser } from '@/hooks/admin';
import { useToast } from '@/components/ui/Toast';
import { DeleteConfirmModal } from '@/components/admin';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SETTINGS_KEYS } from '@/lib/settings';

export default function MediaPage() {
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { mediaFiles, isLoading, error: mediaError, filterFiles, removeFile, refetch, setError } = useMediaManagement();
  const { success, error: showError } = useToast();
  const { getSetting } = useSettings();
  const { user } = useAdminUser();
  
  const isSettingEnabled = getSetting(SETTINGS_KEYS.MEDIA_UPLOAD_ENABLED, 'true') === 'true';
  const canUpload = user ? user.role === 'admin' || user.role === 'editor' : false;
  const canDelete = user ? user.role === 'admin' || user.role === 'editor' : false;
  const isUploadEnabled = isSettingEnabled && canUpload;

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    fileId: null as string | null,
    isLoading: false,
  });

  const filteredFiles = filterFiles(searchTerm);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const file = formData.get('file') as File;
    
    if (!file || file.size === 0) {
      showError('上传失败', '请先选择要上传的文件');
      return;
    }
    
    setUploading(true);
    
    try {
      await handleUploadFile(formData);
      success('上传成功', '文件已上传');
      form.reset();
      await refetch();
    } catch (err) {
      showError('上传失败', (err as Error).message);
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.fileId) return;
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await handleDeleteMediaFile(deleteModal.fileId);
      removeFile(deleteModal.fileId);
      success('删除成功', '文件已删除');
      setDeleteModal({ isOpen: false, fileId: null, isLoading: false });
    } catch (e) {
      showError('删除失败', (e as Error).message);
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const openDeleteModal = (fileId: string) => {
    setDeleteModal({ isOpen: true, fileId, isLoading: false });
  };

  if (isLoading) {
    return <LoadingSpinner text="加载媒体文件中..." />;
  }

  if (mediaError) {
    return (
      <div className="card p-8 text-center">
        <div className="text-destructive mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">加载失败</h3>
        <p className="text-muted-foreground mb-4">{mediaError}</p>
        <button
          onClick={() => refetch()}
          className="btn btn-primary"
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">媒体管理</h1>
          <p className="text-muted-foreground text-sm sm:text-base">管理上传的图片和文件</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索文件名..."
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {isUploadEnabled ? (
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">上传文件</h3>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <input
              type="file"
              name="file"
              accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
              className="input w-full"
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-lg bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading}
              formEncType="multipart/form-data"
            >
              <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {uploading ? '上传中...' : '上传文件'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card p-4 sm:p-6 mb-4 sm:mb-6 bg-muted/50">
          <h3 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base text-muted-foreground">上传文件</h3>
          <p className="text-sm text-muted-foreground">
            {!isSettingEnabled ? '媒体上传功能已被管理员禁用' : '您的权限不足，无法上传文件'}
          </p>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 sm:p-4 font-medium whitespace-nowrap text-sm">预览</th>
                <th className="text-left p-3 sm:p-4 font-medium whitespace-nowrap text-sm">文件名</th>
                <th className="text-left p-3 sm:p-4 font-medium whitespace-nowrap text-sm">大小</th>
                <th className="text-left p-3 sm:p-4 font-medium whitespace-nowrap text-sm">上传者</th>
                <th className="text-left p-3 sm:p-4 font-medium whitespace-nowrap text-sm">上传时间</th>
                <th className="text-right p-3 sm:p-4 font-medium whitespace-nowrap text-sm">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles?.map((file) => (
                <MediaFileCard key={file.id} file={file} onDelete={canDelete ? openDeleteModal : undefined} />
              ))}
            </tbody>
          </table>
        </div>

        {(!mediaFiles || mediaFiles.length === 0) && (
          <div className="text-center py-8 sm:py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm-4-2V9h1v2h-1zm-2-2H7V7h6v2z" clipRule="evenodd" />
            </svg>
            <p className="text-muted-foreground text-sm sm:text-base">暂无媒体文件</p>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, fileId: null, isLoading: false })}
        onConfirm={handleDelete}
        isLoading={deleteModal.isLoading}
        title="删除文件"
        description="确定要删除这个媒体文件吗？此操作无法撤销。"
      />
    </div>
  );
}