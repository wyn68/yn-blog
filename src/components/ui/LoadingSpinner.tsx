interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const sizeClasses = {
  sm: "w-6 h-6 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-10 h-10",
};

const textClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export default function LoadingSpinner({ size = "md", text = "加载中..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div
        role="progressbar"
        aria-label={text}
        className={`${sizeClasses[size]} border-primary/20 border-t-primary rounded-full animate-spin`}
        style={{ willChange: 'transform' }}
      />
      {text && (
        <span className={`${textClasses[size]} text-muted-foreground`}>
          {text}
        </span>
      )}
    </div>
  );
}
