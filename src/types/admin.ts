export interface AdminTableColumn<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface AdminTableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  className?: string;
  disabled?: (item: T) => boolean;
  visible?: (item: T) => boolean;
  destructive?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminTableProps<T> {
  data: T[] | null;
  columns: AdminTableColumn<T>[];
  actions?: AdminTableAction<T>[];
  isLoading?: boolean;
  emptyMessage?: React.ReactNode;
  searchable?: boolean;
  searchFields?: (keyof T | string)[];
  searchPlaceholder?: string;
  onRefresh?: () => void;
  rowKey?: keyof T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalCount: number;
    pageSize: number;
  };
}

export interface AdminFormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'email' | 'password';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: unknown;
  disabled?: boolean;
  className?: string;
  colSpan?: 1 | 2;
}

export interface AdminFormProps {
  fields: AdminFormField[];
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  initialValues?: Record<string, unknown>;
}

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}
