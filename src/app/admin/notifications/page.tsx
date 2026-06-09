'use client';

import { useState, useEffect, useMemo } from 'react';
import { MessageSquare, CheckCircle, Trash2, RefreshCw, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { AdminPageHeader } from '@/components/admin';
import DeleteConfirmModal from '@/components/admin/modal/DeleteConfirmModal';
import { 
  getMessages, 
  markMessageAsRead,
  deleteMessage,
  deleteMessages,
  MessageWithUser 
} from '@/actions/messages';

export default function AdminNotifications() {
  const [messages, setMessages] = useState<MessageWithUser[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messageLoadingId, setMessageLoadingId] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [batchDeleteLoading, setBatchDeleteLoading] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single' | 'batch'; ids: string[] } | null>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const { success, error } = useToast();

  const allMessagesSelected = useMemo(() => {
    return !!(messages && messages.length > 0 && selectedMessageIds.length === messages.length);
  }, [messages, selectedMessageIds]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const msgData = await getMessages();
      setMessages(msgData);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAsRead = async (messageId: string) => {
    setMessageLoadingId(messageId);
    const result = await markMessageAsRead(messageId);
    if (result.success) {
      success('已标记为已读');
      fetchData();
    } else {
      error(result.error || '操作失败');
    }
    setMessageLoadingId(null);
  };

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessageIds(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleSelectAllMessages = () => {
    if (allMessagesSelected) {
      setSelectedMessageIds([]);
    } else if (messages) {
      setSelectedMessageIds(messages.map(m => m.id));
    }
  };

  const handleDeleteClick = (messageId: string) => {
    setDeleteTarget({ type: 'single', ids: [messageId] });
    setDeleteModalOpen(true);
  };

  const handleBatchDeleteClick = () => {
    setDeleteTarget({ type: 'batch', ids: selectedMessageIds });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'single') {
      setDeleteLoadingId(deleteTarget.ids[0]);
      const result = await deleteMessage(deleteTarget.ids[0]);
      if (result.success) {
        success('留言已删除');
      } else {
        error(result.error || '删除失败');
      }
      setDeleteLoadingId(null);
    } else {
      setBatchDeleteLoading(true);
      const result = await deleteMessages(deleteTarget.ids);
      if (result.success) {
        success(`已删除 ${deleteTarget.ids.length} 条留言`);
      } else {
        error(result.error || '批量删除失败');
      }
      setBatchDeleteLoading(false);
    }

    setDeleteModalOpen(false);
    setDeleteTarget(null);
    setSelectedMessageIds([]);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-muted-foreground">加载留言中...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="用户留言"
        description="管理用户留言"
        actions={
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-accent transition-colors text-sm font-medium"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </button>
        }
      />

      <div className="card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                用户留言
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                共有 {messages?.length || 0} 条留言
                {messages && messages.filter(m => m.status === 'unread').length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-destructive/10 text-destructive rounded-full text-xs">
                    {messages.filter(m => m.status === 'unread').length} 条未读
                  </span>
                )}
              </p>
            </div>
            {!isBatchMode ? (
              <button
                onClick={() => setIsBatchMode(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-accent transition-colors text-sm font-medium"
              >
                <CheckCircle className="h-4 w-4" />
                批量选择
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBatchDeleteClick}
                  disabled={batchDeleteLoading || selectedMessageIds.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                  批量删除 ({selectedMessageIds.length})
                </button>
                <button
                  onClick={() => {
                    setIsBatchMode(false);
                    setSelectedMessageIds([]);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-accent transition-colors text-sm font-medium"
                >
                  <X className="h-4 w-4" />
                  取消
                </button>
              </div>
            )}
          </div>
        </div>

        {messages && messages.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">暂无留言</p>
            <p className="text-muted-foreground mt-2">当前没有用户留言</p>
          </div>
        ) : (
          <>
            {isBatchMode && (
              <div className="p-4 border-b border-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allMessagesSelected}
                    onChange={handleSelectAllMessages}
                    className="w-4 h-4 rounded border-input bg-background"
                  />
                  <span className="text-sm text-muted-foreground">全选</span>
                </label>
              </div>
            )}
            <div className="divide-y divide-border">
              {messages?.map((msg) => (
                <div key={msg.id} className={`p-4 hover:bg-muted/30 transition-colors ${msg.status === 'unread' ? 'bg-primary/5' : ''}`}>
                  <div className="flex items-start gap-4">
                    {isBatchMode && (
                      <input
                        type="checkbox"
                        checked={selectedMessageIds.includes(msg.id)}
                        onChange={() => handleSelectMessage(msg.id)}
                        className="w-4 h-4 rounded border-input bg-background mt-1"
                      />
                    )}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.status === 'unread' ? 'bg-primary/10' : 'bg-muted'}`}>
                      <MessageSquare className={`h-5 w-5 ${msg.status === 'unread' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          {msg.username || '未设置用户名'}
                        </span>
                        {msg.status === 'unread' && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                            未读
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        邮箱: {msg.email}
                      </p>
                      <div className="bg-muted/50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          留言时间: {new Date(msg.created_at).toLocaleString('zh-CN')}
                        </span>
                        <div className="flex items-center gap-2">
                          {msg.status === 'unread' && (
                            <button
                              onClick={() => handleMarkAsRead(msg.id)}
                              disabled={messageLoadingId === msg.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-muted hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="h-4 w-4" />
                              标记已读
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(msg.id)}
                            disabled={deleteLoadingId === msg.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-4 w-4" />
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.type === 'batch' ? '确认批量删除' : '确认删除'}
        description={deleteTarget?.type === 'batch' 
          ? `确定要删除选中的 ${deleteTarget.ids.length} 条留言吗？此操作不可撤销。`
          : '确定要删除这条留言吗？此操作不可撤销。'
        }
        isLoading={deleteTarget?.type === 'batch' ? batchDeleteLoading : deleteLoadingId !== null}
      />
    </div>
  );
}