"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const inputVariants = cva(
  "flex w-full rounded-lg border border-input bg-background text-sm ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        error: "border-destructive focus-visible:ring-destructive",
      },
      inputSize: {
        default: "h-11 px-4 py-2.5",
        sm: "h-9 px-3 py-1.5 text-xs",
        lg: "h-12 px-5 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  size?: never;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={twMerge(clsx(inputVariants({ variant, inputSize, className })))}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
