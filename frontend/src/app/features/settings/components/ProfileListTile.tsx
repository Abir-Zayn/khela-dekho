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
        onClick ? 'cursor-pointer hover:bg-zinc-900/60 hover:border-zinc-800/80' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Sub-heading & Info */}
        <div className="space-y-1 max-w-md">
          <h3 className={`text-sm font-bold tracking-tight ${isDanger ? 'text-red-500' : 'text-zinc-100'}`}>
            {title}
          </h3>
          {description && (
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Right Side: Value / Action */}
        {value && (
          <div className="flex items-center gap-3 shrink-0 sm:self-center">
            {typeof value === 'string' ? (
              <span className="text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-xl font-mono">
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
        <div className="mt-3 pt-3 border-t border-zinc-900 text-xs text-zinc-300 leading-relaxed font-normal">
          {children}
        </div>
      )}
    </div>
  );
}
