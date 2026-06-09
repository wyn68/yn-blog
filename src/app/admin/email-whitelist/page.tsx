"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Check, X, Search, ToggleLeft, ToggleRight, AlertCircle } from "lucide-react";
import { getAllDomains, addDomain, updateDomain, deleteDomain, EmailDomain } from "@/services/emailWhitelist";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ConfirmModal } from "@/components/admin";

export default function EmailWhitelistPage() {
  const [domains, setDomains] = useState<EmailDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    domainId: null as string | null,
    domainName: "",
    isLoading: false,
  });

  const [toggleModal, setToggleModal] = useState({
    isOpen: false,
    domainId: null as string | null,
    domainName: "",
    currentStatus: true,
    isLoading: false,
  });

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    setLoading(true);
    try {
      const data = await getAllDomains();
      setDomains(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载白名单失败");
      console.error("Error loading domains:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      setError("请输入邮箱域名");
      return;
    }

    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(newDomain.trim())) {
      setError("请输入有效的域名格式，例如：gmail.com");
      return;
    }

    try {
      await addDomain(newDomain.trim(), newDescription.trim() || undefined);
      setNewDomain("");
      setNewDescription("");
      setShowAddForm(false);
      setSuccessMessage("域名添加成功");
      setError(null);
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadDomains();
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加域名失败");
    }
  };

  const handleUpdateDomain = async (id: string) => {
    setSavingId(id);
    try {
      await updateDomain(id, { description: editDescription });
      setEditingId(null);
      setEditDescription("");
      setSuccessMessage("域名更新成功");
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadDomains();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新域名失败");
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleModal.domainId) return;
    setToggleModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await updateDomain(toggleModal.domainId, { is_active: !toggleModal.currentStatus });
      setSuccessMessage(`域名${!toggleModal.currentStatus ? "启用" : "禁用"}成功`);
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadDomains();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新状态失败");
    } finally {
      setToggleModal({ isOpen: false, domainId: null, domainName: "", currentStatus: true, isLoading: false });
    }
  };

  const openToggleModal = (id: string, name: string, currentStatus: boolean) => {
    setToggleModal({ isOpen: true, domainId: id, domainName: name, currentStatus, isLoading: false });
  };

  const handleDeleteDomain = async () => {
    if (!deleteModal.domainId) return;
    setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await deleteDomain(deleteModal.domainId);
      setSuccessMessage("域名删除成功");
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadDomains();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除域名失败");
    } finally {
      setDeleteModal({ isOpen: false, domainId: null, domainName: "", isLoading: false });
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, domainId: id, domainName: name, isLoading: false });
  };

  const filteredDomains = domains.filter(
    (domain) =>
      domain.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (domain.description && domain.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <LoadingSpinner text="加载邮箱白名单..." />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">邮箱白名单管理</h1>
          <p className="text-muted-foreground mt-1">管理允许注册的邮箱域名</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          添加域名
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
          <Check className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">添加新域名</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">域名</label>
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="input w-full"
                placeholder="例如：gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">描述（可选）</label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="input w-full"
                placeholder="例如：Google邮箱"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddDomain}
                className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors"
              >
                确认添加
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewDomain("");
                  setNewDescription("");
                }}
                className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="p-4 border-b border-border mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-10"
              placeholder="搜索域名或描述..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-foreground">域名</th>
                <th className="text-left p-4 font-medium text-foreground">描述</th>
                <th className="text-center p-4 font-medium text-foreground">状态</th>
                <th className="text-center p-4 font-medium text-foreground">创建时间</th>
                <th className="text-right p-4 font-medium text-foreground">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredDomains.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    暂无数据
                  </td>
                </tr>
              ) : (
                filteredDomains.map((domain) => (
                  <tr key={domain.id} className="border-b border-border hover:bg-accent/50">
                    <td className="p-4 font-medium text-foreground">{domain.domain}</td>
                    <td className="p-4">
                      {editingId === domain.id ? (
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="input w-full max-w-xs"
                        />
                      ) : (
                        <span className="text-muted-foreground">
                          {domain.description || "-"}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => openToggleModal(domain.id, domain.domain, domain.is_active)}
                        disabled={savingId === domain.id}
                        className="p-2 rounded-full transition-colors"
                        style={{
                          backgroundColor: domain.is_active ? "#10b981" : "#ef4444",
                        }}
                      >
                        {domain.is_active ? (
                          <ToggleRight className="h-4 w-4 text-white" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-white" />
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-center text-muted-foreground">
                      {new Date(domain.created_at).toLocaleDateString("zh-CN")}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === domain.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateDomain(domain.id)}
                              disabled={savingId === domain.id}
                              className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditDescription("");
                              }}
                              className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(domain.id);
                                setEditDescription(domain.description || "");
                              }}
                              className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                              title="编辑描述"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(domain.id, domain.domain)}
                              disabled={deleteModal.isLoading}
                              className="p-2 rounded-lg text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors"
                              title="删除域名"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, domainId: null, domainName: "", isLoading: false })}
        onConfirm={handleDeleteDomain}
        isLoading={deleteModal.isLoading}
        title="确认删除域名"
        description={`确定要删除域名「${deleteModal.domainName}」吗？此操作不可撤销。`}
        confirmText="删除"
        isDestructive
      />

      <ConfirmModal
        isOpen={toggleModal.isOpen}
        onClose={() => setToggleModal({ isOpen: false, domainId: null, domainName: "", currentStatus: true, isLoading: false })}
        onConfirm={handleToggleStatus}
        isLoading={toggleModal.isLoading}
        title={toggleModal.currentStatus ? "确认禁用域名" : "确认启用域名"}
        description={`确定要${toggleModal.currentStatus ? "禁用" : "启用"}域名「${toggleModal.domainName}」吗？`}
        confirmText={toggleModal.currentStatus ? "禁用" : "启用"}
        isDestructive={toggleModal.currentStatus}
      />
    </div>
  );
}