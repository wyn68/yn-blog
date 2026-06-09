"use client";

import { useState, useEffect } from "react";
import { Clock, User, Activity, AlertCircle, RefreshCcw } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { AdminPageHeader, AdminTable } from "@/components/admin";
import { getAuditLogs } from "@/actions/auditLogs";
import type { AuditLog } from "@/types";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const logsData = await getAuditLogs();
      setLogs(logsData);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "加载审计日志失败";
      setError(errorMsg);
      console.error("Error loading audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "editor":
        return "bg-blue-100 text-blue-700";
      case "author":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("delete")) return "bg-red-100 text-red-700";
    if (action.includes("update")) return "bg-blue-100 text-blue-700";
    if (action.includes("create")) return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return <LoadingSpinner text="加载审计日志中..." />;
  }

  return (
    <div className="p-6">
      <AdminPageHeader
        title="审计日志"
        description="查看系统操作记录"
        actions={
          <button
            onClick={loadLogs}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            刷新
          </button>
        }
      />

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">操作记录</h2>
              <p className="text-sm text-muted-foreground">共 {logs.length} 条记录</p>
            </div>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无审计记录</p>
            <p className="text-sm mt-2">系统操作后将在此处显示记录</p>
          </div>
        ) : (
          <AdminTable
            data={logs}
            columns={[
              {
                key: "user",
                header: "用户",
                render: (log: AuditLog) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{log.username || "匿名"}</p>
                      {log.role && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(log.role)}`}>
                          {log.role}
                        </span>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: "action",
                header: "操作",
                render: (log: AuditLog) => (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                ),
              },
              {
                key: "target",
                header: "目标",
                className: "text-muted-foreground",
                render: (log: AuditLog) => log.target || "-",
              },
              {
                key: "check_type",
                header: "类型",
                className: "text-muted-foreground",
                render: (log: AuditLog) => log.check_type || "-",
              },
              {
                key: "created_at",
                header: "时间",
                className: "text-muted-foreground",
                render: (log: AuditLog) =>
                  new Date(log.created_at).toLocaleString("zh-CN"),
              },
            ]}
            isLoading={loading}
            emptyMessage="暂无审计记录"
            searchable
            searchFields={["username", "action", "target", "role"]}
            searchPlaceholder="搜索用户、操作或目标..."
            onRefresh={loadLogs}
          />
        )}
      </div>
    </div>
  );
}
