'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  href?: string;
  className?: string;
}

export function BrandLogo({
  size = 'md',
  showSubtitle = true,
  href = '/',
  className = '',
}: BrandLogoProps) {
  const textSizes = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl',
  };
  const subtitleSizes = {
    sm: 'text-[9px] sm:text-[10px]',
    md: 'text-[10px] sm:text-xs',
    lg: 'text-xs',
  };

  const content = (
    <div className={`flex flex-col group cursor-pointer ${className}`}>
      <h1 className={`${textSizes[size]} font-black tracking-tighter uppercase italic leading-none text-foreground group-hover:opacity-90 transition-opacity`}>
        KHELA <span className="text-terracotta-primary">DEKHO</span>
      </h1>
      {showSubtitle && (
        <p className={`${subtitleSizes[size]} text-muted-foreground font-semibold tracking-widest uppercase mt-0.5`}>
          The Ultimate Sports Arena
        </p>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
