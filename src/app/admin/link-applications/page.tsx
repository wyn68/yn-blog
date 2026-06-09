'use client';

import { useState, useCallback, useEffect } from 'react';
import { Check, X, Trash2, ExternalLink } from 'lucide-react';
import { handleApproveLinkApplication, handleRejectLinkApplication, handleDeleteLinkApplication } from '@/actions/linkApplications';
import { getAllLinkApplicationsUncached } from '@/services/linkApplications';
import type { LinkApplication } from '@/types';
import { AdminTable, AdminPageHeader, DeleteConfirmModal } from '@/components/admin';
import { useToast } from '@/components/ui/Toast';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

export default function AdminLinkApplications() {
  const [data, setData] = useState<LinkApplication[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { success, error, loading: loadingToast, dismiss } = useToast();

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    applicationId: null as string | null,
    isLoading: false,
  });

  const [actionModal, setActionModal] = useState({
    isOpen: false,
    applicationId: null as string | null,
    action: 'approve' as 'approve' | 'reject',
    isLoading: false,
    applicationName: '',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const applications = await getAllLinkApplicationsUncached();
      setData(applications);
    } catch (err) {
      error('加载失败', err instanceof Error ? err.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  const handleApprove = async () => {
    if (!actionModal.applicationId) return;

    setActionModal((prev) => ({ ...prev, isLoading: true }));
    const toastId = loadingToast('正在批准友链申请...');

    try {
      await handleApproveLinkApplication(actionModal.applicationId);
      dismiss(toastId);
      success('友链申请已批准', '已自动添加为友链');
      await loadData(); // 重新加载数据
    } catch (err) {
      dismiss(toastId);
      error('批准失败', err instanceof Error ? err.message : '批准失败');
    } finally {
      setActionModal({ isOpen: false, applicationId: null, action: 'approve', isLoading: false, applicationName: '' });
    }
  };

  const handleReject = async () => {
    if (!actionModal.applicationId) return;

    setActionModal((prev) => ({ ...prev, isLoading: true }));
    const toastId = loadingToast('正在拒绝友链申请...');

    try {
      await handleRejectLinkApplication(actionModal.applicationId);
      dismiss(toastId);
      success('友链申请已拒绝', '');
      await loadData(); // 重新加载数据
    } catch (err) {
      dismiss(toastId);
      error('拒绝失败', err instanceof Error ? err.message : '拒绝失败');
    } finally {
      setActionModal({ isOpen: false, applicationId: null, action: 'approve', isLoading: false, applicationName: '' });
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.applicationId) return;

    setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    const toastId = loadingToast('正在删除友链申请...');

    try {
      await handleDeleteLinkApplication(deleteModal.applicationId);
      dismiss(toastId);
      success('友链申请已删除', '');
      await loadData(); // 重新加载数据
    } catch (err) {
      dismiss(toastId);
      error('删除失败', err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeleteModal({ isOpen: false, applicationId: null, isLoading: false });
    }
  };

  const openActionConfirm = (applicationId: string, applicationName: string, action: 'approve' | 'reject') => {
    setActionModal({ isOpen: true, applicationId, action, isLoading: false, applicationName });
  };

  const openDeleteConfirm = (applicationId: string) => {
    setDeleteModal({ isOpen: true, applicationId, isLoading: false });
  };

  const columns = [
    {
      key: 'name',
      header: '网站名称',
      render: (application: LinkApplication) => (
        <div className="flex items-center gap-2">
          {application.avatar && (
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <OptimizedImage
                src={application.avatar}
                alt={application.name}
                className="w-full h-full object-cover"
                fill={true}
                aspectRatio="1/1"
                sizes="24px"
              />
            </div>
          )}
          <span className="font-medium">{application.name}</span>
        </div>
      ),
    },
    {
      key: 'url',
      header: '网站链接',
      className: 'text-muted-foreground',
      render: (application: LinkApplication) => (
        <a
          href={application.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          <span className="truncate max-w-[200px]">{application.url}</span>
        </a>
      ),
    },
    {
      key: 'applicant_name',
      header: '申请人',
      className: 'text-muted-foreground',
      render: (application: LinkApplication) => application.applicant_name || '-',
    },
    {
      key: 'applicant_email',
      header: '联系邮箱',
      className: 'text-muted-foreground',
      render: (application: LinkApplication) => application.applicant_email || '-',
    },
    {
      key: 'status',
      header: '状态',
      render: (application: LinkApplication) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          application.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          application.status === 'approved' ? 'bg-green-100 text-green-700' :
          'bg-red-100 text-red-700'
        }`}>
          {application.status === 'pending' ? '待审核' :
           application.status === 'approved' ? '已批准' : '已拒绝'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: '申请时间',
      className: 'text-muted-foreground',
      render: (application: LinkApplication) =>
        new Date(application.created_at).toLocaleString('zh-CN'),
    },
  ];

  const actions = [
    {
      label: '批准',
      icon: <Check className="h-4 w-4" />,
      visible: (application: LinkApplication) => 
        application.status === 'pending' || application.status === 'rejected',
      onClick: (application: LinkApplication) => {
        openActionConfirm(application.id, application.name, 'approve');
      },
      className: 'text-green-600 hover:text-green-700 hover:bg-green-50',
    },
    {
      label: '拒绝',
      icon: <X className="h-4 w-4" />,
      visible: (application: LinkApplication) => 
        application.status === 'pending',
      onClick: (application: LinkApplication) => {
        openActionConfirm(application.id, application.name, 'reject');
      },
      className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
    },
    {
      label: '',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (application: LinkApplication) => openDeleteConfirm(application.id),
      destructive: true,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="友链申请管理"
        description="管理友链申请，审核并批准或拒绝申请"
      />

      <AdminTable
        data={data}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        emptyMessage="暂无友链申请"
        searchable
        searchFields={['name', 'url', 'applicant_name', 'applicant_email'] as const}
        searchPlaceholder="搜索网站名称、链接、申请人..."
        onRefresh={loadData}
      />

      {actionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setActionModal({ ...actionModal, isOpen: false })}></div>
          <div className="relative bg-background rounded-lg shadow-xl w-full max-w-md p-6 z-10">
            <h3 className="text-lg font-semibold mb-2">
              {actionModal.action === 'approve' ? '确认批准' : '确认拒绝'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {actionModal.action === 'approve' 
                ? `确定要批准 "${actionModal.applicationName}" 的友链申请吗？批准后将自动添加为友链。`
                : `确定要拒绝 "${actionModal.applicationName}" 的友链申请吗？`
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setActionModal({ ...actionModal, isOpen: false })}
                className="flex-1 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={actionModal.action === 'approve' ? handleApprove : handleReject}
                disabled={actionModal.isLoading}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                  actionModal.action === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {actionModal.isLoading ? '处理中...' : (actionModal.action === 'approve' ? '批准' : '拒绝')}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, applicationId: null, isLoading: false })}
        onConfirm={handleDelete}
        title="确认删除"
        description="确定要删除此友链申请吗？此操作不可撤销。"
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
}