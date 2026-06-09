'use client';

interface SettingsFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'textarea' | 'number' | 'checkbox';
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  min?: string;
  max?: string;
  description?: string;
}

export function SettingsField({
  label,
  name,
  type = 'text',
  defaultValue = '',
  placeholder = '',
  className = '',
  min,
  max,
  description,
}: SettingsFieldProps) {
  if (type === 'checkbox') {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <div>
          <label className="block text-sm font-medium">{label}</label>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultValue === 'true'}
          className="w-4 h-4 rounded border-border bg-background"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-2">{label}</label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          className="textarea w-full"
          defaultValue={defaultValue}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          name={name}
          className="input w-full"
          defaultValue={defaultValue}
          placeholder={placeholder}
          min={min}
          max={max}
        />
      )}
    </div>
  );
}

interface SettingsCardProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsCard({ title, children }: SettingsCardProps) {
  return (
    <div className="card p-6">
      <h3 className="font-medium mb-4">{title}</h3>
      {children}
    </div>
  );
}