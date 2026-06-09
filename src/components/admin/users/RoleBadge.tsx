import type { Role } from '@/lib/role';

interface RoleBadgeProps {
  role: Role | string;
  className?: string;
}

const roleConfig: Record<string, { label: string; className: string }> = {
  admin: { label: '管理员', className: 'bg-red-100 text-red-700' },
  editor: { label: '编辑', className: 'bg-blue-100 text-blue-700' },
  author: { label: '作者', className: 'bg-green-100 text-green-700' },
  user: { label: '用户', className: 'bg-gray-100 text-gray-700' },
};

export default function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const config = roleConfig[role] || roleConfig.user;

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}

export function getRoleLabel(role: string): string {
  return roleConfig[role]?.label || '用户';
}

export function getRoleClass(role: string): string {
  return roleConfig[role]?.className || roleConfig.user.className;
}

export const roles: { value: Role; label: string }[] = [
  { value: 'user', label: '用户' },
  { value: 'author', label: '作者' },
  { value: 'editor', label: '编辑' },
];