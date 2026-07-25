'use client';

import React from 'react';
import type { ProfileListTileProps } from '../types';

export function ProfileListTile({
  title,
  description,
  value,
  children,
  onClick,
  isDanger = false,
}: ProfileListTileProps) {
  return (
    <div
      onClick={onClick}
      className={`py-5 px-4 rounded-2xl border border-transparent transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:bg-muted/60 hover:border-border' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Sub-heading & Info */}
        <div className="space-y-1 max-w-md">
          <h3 className={`text-sm font-bold tracking-tight ${isDanger ? 'text-terracotta-primary' : 'text-foreground'}`}>
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground font-light leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Right Side: Value / Action */}
        {value && (
          <div className="flex items-center gap-3 shrink-0 sm:self-center">
            {typeof value === 'string' ? (
              <span className="text-sm font-medium text-foreground bg-muted border border-border px-3.5 py-1.5 rounded-xl font-mono">
                {value}
              </span>
            ) : (
              value
            )}
          </div>
        )}
      </div>

      {/* Optional Children Below (e.g. for Bio text block) */}
      {children && (
        <div className="mt-3 pt-3 border-t border-border text-xs text-foreground leading-relaxed font-normal">
          {children}
        </div>
      )}
    </div>
  );
}
