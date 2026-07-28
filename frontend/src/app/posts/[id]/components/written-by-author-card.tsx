'use client';

import React from 'react';
import Link from 'next/link';

export interface WrittenByAuthorCardProps {
  author: string;
}

export function WrittenByAuthorCard({ author }: WrittenByAuthorCardProps) {
  const authorInitial = author ? author.charAt(0).toUpperCase() : 'K';

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left mb-14 shadow-sm">
      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-terracotta-primary to-amber-500 flex items-center justify-center font-black text-xl text-white shadow-lg border-2 border-border shrink-0">
        {authorInitial}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-foreground">Written by {author}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sports enthusiast & writer publishing live commentary, breakdown analyses, and stories on Khela Dekho Arena.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-terracotta-primary hover:text-terracotta-dark transition-colors"
          >
            <span>Explore More Articles</span> →
          </Link>
        </div>
      </div>
    </div>
  );
}

