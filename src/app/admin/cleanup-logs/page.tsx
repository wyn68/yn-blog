"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Clock, Calendar, Play, AlertCircle, User, AlertTriangle, Database } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getUnverifiedUsers, deleteUnverifiedUser, cleanupAllUnverifiedUsers, getCleanupLogs, UnverifiedUser } from "@/actions/cleanup";
import { ConfirmModal } from "@/components/admin";

interface CleanupLog {
  id: string;
  deleted_count: number;
  deleted_user_ids: string[];
  cleanup_time: string;
}

export default function CleanupLogsPage() {
  const [logs, setLogs] = useState<CleanupLog[]>([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState<UnverifiedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [deleteSingleModal, setDeleteSingleModal] = useState({
    isOpen: false,
    userId: null as string | null,
    email: "",
    isLoading: false,
  });

  const [cleanupAllModal, setCleanupAllModal] = useState({
    isOpen: false,
    userCount: 0,
    isLoading: false,
  });

  const loadLogs = async () => {
    try {
      const logsData = await getCleanupLogs();
      setLogs(logsData);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "加载日志失败";
      setError(errorMsg);
      console.error("Error loading cleanup logs:", err);
    }
  };

  const loadUnverifiedUsers = async () => {
    try {
      const users = await getUnverifiedUsers();
      setUnverifiedUsers(users);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "加载未验证用户失败";
      setError(errorMsg);
      console.error("Error loading unverified users:", err);
    }
  };

  const handleLoadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadLogs(), loadUnverifiedUsers()]);
    setLoading(false);
  }, []);

  useEffect(() => {
    handleLoadData();
  }, [handleLoadData]);

  const handleManualCleanup = async () => {
    setCleanupAllModal((prev) => ({ ...prev, isLoading: true }));
    try {
      const result = await cleanupAllUnverifiedUsers();
      setSuccessMessage(`清理完成！共删除 ${result.deletedCount} 个未验证账户`);
      setTimeout(() => setSuccessMessage(null), 3000);
      await handleLoadData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "清理失败";
      setError(errorMsg);
    } finally {
      setCleanupAllModal({ isOpen: false, userCount: 0, isLoading: false });
    }
  };

  const openCleanupAllModal = () => {
    setCleanupAllModal({ isOpen: true, userCount: unverifiedUsers.length, isLoading: false });
  };

  const handleDeleteSingleUser = async () => {
    if (!deleteSingleModal.userId) return;
    setDeleteSingleModal((prev) => ({ ...prev, isLoading: true }));
    try {
      const result = await deleteUnverifiedUser(deleteSingleModal.userId);
      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => setSuccessMessage(null), 3000);
        await handleLoadData();
      } else {
        setError(result.message);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "删除失败";
      setError(errorMsg);
    } finally {
      setDeleteSingleModal({ isOpen: false, userId: null, email: "", isLoading: false });
    }
  };

  const openDeleteSingleModal = (userId: string, email: string) => {
    setDeleteSingleModal({ isOpen: true, userId, email, isLoading: false });
  };

  if (loading) {
    return <LoadingSpinner text="加载数据..." />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">未验证账户清理</h1>
          <p className="text-muted-foreground mt-1">管理长时间未验证的用户账户</p>
        </div>
        <button
          onClick={openCleanupAllModal}
          disabled={cleanupAllModal.isLoading || unverifiedUsers.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4" />
          {cleanupAllModal.isLoading ? "清理中..." : `清理全部 (${unverifiedUsers.length})`}
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="card mb-6">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">自动清理机制</h2>
              <p className="text-sm text-muted-foreground">系统会自动清理超过7天未验证的账户</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">清理周期</div>
              <div className="text-xl font-bold">每天</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">执行时间</div>
              <div className="text-xl font-bold">凌晨 2:00</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">过期天数</div>
              <div className="text-xl font-bold">7 天</div>
            </div>
            <div className="p-4 bg-orange-100/30 rounded-lg">
              <div className="text-sm text-orange-600 mb-1">当前未验证</div>
              <div className="text-xl font-bold text-orange-600">{unverifiedUsers.length} 个</div>
            </div>
            <div className="p-4 bg-blue-50/30 rounded-lg">
              <div className="text-sm text-blue-600 mb-1">日志保留</div>
              <div className="text-xl font-bold text-blue-600">30 天</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            未验证账户列表
            {unverifiedUsers.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                共 {unverifiedUsers.length} 个账户
              </span>
            )}
          </h2>
        </div>

        {unverifiedUsers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无未验证账户</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-foreground">邮箱</th>
                  <th className="text-center p-4 font-medium text-foreground">注册时间</th>
                  <th className="text-center p-4 font-medium text-foreground">未验证天数</th>
                  <th className="text-right p-4 font-medium text-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {unverifiedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-accent/50">
                    <td className="p-4 font-medium text-foreground">{user.email}</td>
                    <td className="p-4 text-center text-muted-foreground">
                      {new Date(user.created_at).toLocaleString("zh-CN")}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.days_unverified >= 7
                          ? "bg-red-100 text-red-700"
                          : user.days_unverified >= 3
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                      }`}>
                        {user.days_unverified} 天
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => openDeleteSingleModal(user.id, user.email)}
                        disabled={deleteSingleModal.isLoading && deleteSingleModal.userId === user.id}
                        className="flex items-center justify-end gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        {deleteSingleModal.isLoading && deleteSingleModal.userId === user.id ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              清理日志
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              日志自动保留最近 30 天
            </div>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无清理记录</p>
            <p className="text-sm mt-2">清理未验证账户后将在此处显示记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-foreground">时间</th>
                  <th className="text-center p-4 font-medium text-foreground">删除数量</th>
                  <th className="text-left p-4 font-medium text-foreground">删除的用户ID</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-accent/50">
                    <td className="p-4">
                      {new Date(log.cleanup_time).toLocaleString("zh-CN")}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {log.deleted_count}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm max-w-xs truncate">
                      {log.deleted_user_ids && log.deleted_user_ids.length > 0
                        ? log.deleted_user_ids.join(", ")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteSingleModal.isOpen}
        onClose={() => setDeleteSingleModal({ isOpen: false, userId: null, email: "", isLoading: false })}
        onConfirm={handleDeleteSingleUser}
        isLoading={deleteSingleModal.isLoading}
        title="确认删除账户"
        description={`确定要删除未验证账户「${deleteSingleModal.email}」吗？此操作不可恢复。`}
        confirmText="删除"
        isDestructive
      />

      <ConfirmModal
        isOpen={cleanupAllModal.isOpen}
        onClose={() => setCleanupAllModal({ isOpen: false, userCount: 0, isLoading: false })}
        onConfirm={handleManualCleanup}
        isLoading={cleanupAllModal.isLoading}
        title="确认清理全部未验证账户"
        description={`确定要清理全部 ${cleanupAllModal.userCount} 个未验证账户吗？此操作不可恢复。`}
        confirmText="确认清理"
        isDestructive
      />
    </div>
  );
}