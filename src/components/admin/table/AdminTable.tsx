'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import type { AdminTableProps } from '@/types/admin';
import Pagination from './Pagination';

export default function AdminTable<T extends { id: string }>({
  data,
  columns,
  actions = [],
  isLoading = false,
  emptyMessage,
  searchable = false,
  searchFields = [],
  searchPlaceholder = '搜索...',
  onRefresh,
  rowKey = 'id',
  pagination,
}: AdminTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  const getSearchValue = useCallback((obj: Record<string, unknown>, field: string): string[] => {
    const roleLabels: Record<string, string> = {
      admin: '管理员',
      editor: '编辑',
      author: '作者',
      user: '用户',
    };
    
    const path = field.split('.');
    let current: unknown = obj;
    for (const key of path) {
      if (current == null) return [];
      current = (current as Record<string, unknown>)[key];
    }
    
    if (current == null) return [];
    
    const stringValue = String(current).toLowerCase();
    const values = [stringValue];
    
    if (field === 'role' && roleLabels[stringValue]) {
      values.push(roleLabels[stringValue].toLowerCase());
    }
    
    return values;
  }, []);

  const filteredData = useMemo(() => {
    if (!data || !searchTerm) return data;
    
    const term = searchTerm.toLowerCase();
    
    return data.filter((item) =>
      searchFields.some((field) => {
        const values = getSearchValue(item as Record<string, unknown>, String(field));
        return values.some((value) => value.includes(term));
      })
    );
  }, [data, searchFields, searchTerm, getSearchValue]);

  if (isLoading) {
    return <LoadingSpinner text="加载中..." />;
  }

  return (
    <div>
      {(searchable || onRefresh) && (
        <div className="flex items-center gap-3 mb-4">
          {searchable && (
            <div className="relative flex-1 max-w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="input pl-10 w-full"
              />
            </div>
          )}
          {onRefresh && (
            <Button
              variant="ghost"
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">刷新</span>
            </Button>
          )}
        </div>
      )}

      {/* 桌面端表格布局 */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`text-left p-4 font-medium whitespace-nowrap ${column.className || ''}`}
                  >
                    {column.header}
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="text-right p-4 font-medium whitespace-nowrap">操作</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData?.map((item, index) => (
                <tr
                  key={String(item[rowKey])}
                  className="border-b border-border hover:bg-accent/50 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`p-4 ${column.className || ''}`}
                    >
                      {column.render
                        ? column.render(item, index)
                        : (item[column.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {actions.map((action, actionIndex) => {
                          const isVisible = action.visible?.(item) ?? true;
                          if (!isVisible) return null;
                          
                          const isDisabled = action.disabled?.(item) || false;
                          return (
                            <button
                              key={actionIndex}
                              onClick={() => action.onClick(item)}
                              disabled={isDisabled}
                              className={`btn btn-ghost p-2 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                action.destructive
                                  ? 'text-red-500 hover:bg-red-50 hover:text-red-600'
                                  : ''
                              } ${action.className || ''}`}
                            >
                              {action.icon}
                              {action.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!filteredData || filteredData.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {emptyMessage || '暂无数据'}
            </p>
          </div>
        )}

        {pagination && pagination.totalPages && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            onPageChange={pagination.onPageChange}
          />
        )}
      </div>

      {/* 移动端卡片布局 */}
      <div className="space-y-3 md:hidden">
        {filteredData?.map((item, index) => (
          <div
            key={String(item[rowKey])}
            className="card p-4 space-y-3"
          >
            {columns.map((column) => (
              <div key={String(column.key)} className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground font-medium min-w-[80px]">
                  {column.header}
                </span>
                <div className={`flex-1 ${column.className || ''}`}>
                  {column.render
                    ? column.render(item, index)
                    : (item[column.key as keyof T] as React.ReactNode)}
                </div>
              </div>
            ))}
            {actions && actions.length > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                {actions.map((action, actionIndex) => {
                  const isVisible = action.visible?.(item) ?? true;
                  if (!isVisible) return null;
                  
                  const isDisabled = action.disabled?.(item) || false;
                  return (
                    <button
                      key={actionIndex}
                      onClick={() => action.onClick(item)}
                      disabled={isDisabled}
                      className={`btn btn-ghost p-2 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        action.destructive
                          ? 'text-red-500 hover:bg-red-50 hover:text-red-600'
                          : ''
                      } ${action.className || ''}`}
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {(!filteredData || filteredData.length === 0) && (
          <div className="card text-center py-12">
            <p className="text-muted-foreground">
              {emptyMessage || '暂无数据'}
            </p>
          </div>
        )}

        {pagination && pagination.totalPages && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            onPageChange={pagination.onPageChange}
            className="border-t border-border"
          />
        )}
      </div>
    </div>
  );
}