'use client';

import React from 'react';
import { LayoutMode } from '../types';

interface SkeletonGridProps {
  layoutMode: LayoutMode;
}

export function SkeletonGrid({ layoutMode }: SkeletonGridProps) {
  const skeletons = Array.from({ length: 8 });

  if (layoutMode === 'list') {
    return (
      <div className="space-y-6 w-full">
        {skeletons.map((_, i) => (
          <div 
            key={i} 
            className="flex flex-col md:flex-row bg-zinc-900 border border-zinc-800 rounded-[12px] overflow-hidden h-fit md:h-44 animate-pulse"
          >
            <div className="w-full md:w-56 bg-zinc-850 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800" />
            <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-1/4" />
                <div className="h-6 bg-zinc-800 rounded w-3/4" />
                <div className="h-4 bg-zinc-800 rounded w-5/6" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-3 bg-zinc-805 rounded w-12" />
                <div className="h-3 bg-zinc-805 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
      {skeletons.map((_, i) => (
        <div 
          key={i} 
          className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-[12px] overflow-hidden h-[360px] animate-pulse"
        >
          <div className="h-44 bg-zinc-850 p-5" />
          <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="h-3 bg-zinc-800 rounded w-1/3" />
              <div className="h-5 bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-zinc-800 rounded w-5/6" />
              <div className="h-3 bg-zinc-800 rounded w-2/3" />
            </div>
            <div className="h-8 bg-zinc-850 rounded w-full mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
