'use client';

import { useState, useCallback, useEffect } from 'react';
import { Check, X, Trash2, User } from 'lucide-react';
import { handleRoleApplication, getPendingRoleApplications, RoleApplicationWithUser } from '@/actions/roleApplications';
import { AdminTable, AdminPageHeader, DeleteConfirmModal } from '@/components/admin';
import { useToast } from '@/components/ui/Toast';

export default function AdminRoleApplications() {
  const [data, setData] = useState<RoleApplicationWithUser[] | null>(null);
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
    username: '',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const applications = await getPendingRoleApplications();
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
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [loadData]);

  const handleApprove = async () => {
    if (!actionModal.applicationId) return;

    setActionModal((prev) => ({ ...prev, isLoading: true }));
    const toastId = loadingToast('正在批准角色申请...');

    try {
      const result = await handleRoleApplication(actionModal.applicationId, 'approve');
      if (result.success) {
        dismiss(toastId);
        success('角色申请已批准', '用户角色已更新为作者');
        await loadData();
      } else {
        dismiss(toastId);
        error('批准失败', result.error || '批准失败');
      }
    } catch (err) {
      dismiss(toastId);
      error('批准失败', err instanceof Error ? err.message : '批准失败');
    } finally {
      setActionModal({ isOpen: false, applicationId: null, action: 'approve', isLoading: false, username: '' });
    }
  };

  const handleReject = async () => {
    if (!actionModal.applicationId) return;

    setActionModal((prev) => ({ ...prev, isLoading: true }));
    const toastId = loadingToast('正在拒绝角色申请...');

    try {
      const result = await handleRoleApplication(actionModal.applicationId, 'reject');
      if (result.success) {
        dismiss(toastId);
        success('角色申请已拒绝', '');
        await loadData();
      } else {
        dismiss(toastId);
        error('拒绝失败', result.error || '拒绝失败');
      }
    } catch (err) {
      dismiss(toastId);
      error('拒绝失败', err instanceof Error ? err.message : '拒绝失败');
    } finally {
      setActionModal({ isOpen: false, applicationId: null, action: 'approve', isLoading: false, username: '' });
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.applicationId) return;

    setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    const toastId = loadingToast('正在删除角色申请...');

    try {
      await handleRoleApplication(deleteModal.applicationId, 'reject');
      dismiss(toastId);
      success('角色申请已删除', '');
      await loadData();
    } catch (err) {
      dismiss(toastId);
      error('删除失败', err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeleteModal({ isOpen: false, applicationId: null, isLoading: false });
    }
  };

  const openActionConfirm = (applicationId: string, username: string, action: 'approve' | 'reject') => {
    setActionModal({ isOpen: true, applicationId, action, isLoading: false, username });
  };

  const openDeleteConfirm = (applicationId: string) => {
    setDeleteModal({ isOpen: true, applicationId, isLoading: false });
  };

  const columns = [
    {
      key: 'user',
      header: '申请人',
      render: (application: RoleApplicationWithUser) => (
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{application.username || '未设置用户名'}</p>
            <p className="text-xs text-muted-foreground">{application.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'reason',
      header: '申请理由',
      className: 'text-muted-foreground',
      render: (application: RoleApplicationWithUser) => (
        <span
          className="text-sm max-w-[200px] block truncate cursor-default"
          title={application.reason || ''}
        >
          {application.reason || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: '状态',
      render: (application: RoleApplicationWithUser) => (
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
      render: (application: RoleApplicationWithUser) =>
        new Date(application.created_at).toLocaleString('zh-CN'),
    },
  ];

  const actions = [
    {
      label: '批准',
      icon: <Check className="h-4 w-4" />,
      visible: (application: RoleApplicationWithUser) => 
        application.status === 'pending',
      onClick: (application: RoleApplicationWithUser) => {
        openActionConfirm(application.id, application.username || '', 'approve');
      },
      className: 'text-green-600 hover:text-green-700 hover:bg-green-50',
    },
    {
      label: '拒绝',
      icon: <X className="h-4 w-4" />,
      visible: (application: RoleApplicationWithUser) => 
        application.status === 'pending',
      onClick: (application: RoleApplicationWithUser) => {
        openActionConfirm(application.id, application.username || '', 'reject');
      },
      className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
    },
    {
      label: '',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (application: RoleApplicationWithUser) => openDeleteConfirm(application.id),
      destructive: true,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="角色申请管理"
        description="管理用户角色升级申请，审核并批准或拒绝申请"
      />

      <AdminTable
        data={data}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        emptyMessage="暂无角色申请"
        searchable
        searchFields={['username', 'email', 'reason'] as const}
        searchPlaceholder="搜索用户名、邮箱或申请理由..."
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
                ? `确定要批准 "${actionModal.username}" 的作者角色申请吗？批准后用户角色将更新为作者。`
                : `确定要拒绝 "${actionModal.username}" 的作者角色申请吗？`
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
        description="确定要删除此角色申请吗？此操作不可撤销。"
        isLoading={deleteModal.isLoading}
      />
    </div>
  );
}