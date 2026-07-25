'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/app/utils';

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer gap-1.5",
  {
    variants: {
      variant: {
        default:
          "bg-transparent text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 data-[state=on]:bg-zinc-800 data-[state=on]:text-white border border-transparent data-[state=on]:border-zinc-700 data-[state=on]:shadow-sm",
        outline:
          "border border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200 data-[state=on]:bg-amber-500/20 data-[state=on]:text-amber-400 data-[state=on]:border-amber-500/40",
      },
      size: {
        default: "h-8 px-3 min-w-8",
        sm: "h-7 px-2.5 text-xs",
        lg: "h-9 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, variant, size, pressed = false, onPressedChange, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={pressed}
        data-state={pressed ? 'on' : 'off'}
        className={cn(toggleVariants({ variant, size, className }))}
        onClick={(e) => {
          onPressedChange?.(!pressed);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle, toggleVariants };
