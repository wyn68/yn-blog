"use client";

import { forwardRef, useState, type HTMLAttributes } from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "lucide-react";

const avatarVariants = cva(
  "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex-shrink-0 transition-all duration-200",
  {
    variants: {
      size: {
        xs: "h-6 w-6",
        sm: "h-8 w-8",
        default: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

const avatarIconVariants = cva("", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      default: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-8 w-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const BLUR_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='g'%3E%3CfeGaussianBlur stdDeviation='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb' filter='url(%23g)'/%3E%3C/svg%3E";

export interface AvatarProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  onClick?: () => void;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt = "用户头像", onClick, ...props }, ref) => {
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
      setHasError(true);
    };

    const sizeClasses = avatarVariants({ size });
    const iconSize = avatarIconVariants({ size });
    
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            sizeClasses,
            className,
            onClick && "cursor-pointer hover:ring-2 hover:ring-primary/50"
          )
        )}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        {...props}
      >
        {src && !hasError ? (
          <div className="relative w-full h-full">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 640px) 48px, 64px"
              className="object-cover"
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              quality={80}
              onError={handleError}
            />
          </div>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <User className={twMerge(clsx(iconSize, "text-muted-foreground"))} />
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export interface AuthorAvatarProps extends AvatarProps {
  profileId?: string;
  onAuthorClick?: () => void;
}

export function AuthorAvatar({
  onAuthorClick,
  profileId,
  ...props
}: AuthorAvatarProps) {
  return (
    <Avatar
      onClick={onAuthorClick}
      {...props}
    />
  );
}

export { Avatar, avatarVariants };
