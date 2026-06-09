import type { AdminPageHeaderProps } from '@/types/admin';

export default function AdminPageHeader({
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 sm:gap-3">{actions}</div>}
    </div>
  );
}
