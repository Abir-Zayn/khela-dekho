'use client';

import React from 'react';
import { Calendar, Clock, Share2, Check } from 'lucide-react';
import { Post, Tag } from '@/src/app/features/sports-blog-home/types';
import { formatDate } from '@/src/app/features/sports-blog-home/utils/postDisplay';

export interface PostArticleHeaderProps {
  post: Post;
  categoryName: string;
  categoryColor: string;
  readTime: number;
  copied: boolean;
  onShare: () => void;
}

export function PostArticleHeader({
  post,
  categoryName,
  categoryColor,
  readTime,
  copied,
  onShare,
}: PostArticleHeaderProps) {
  const tags: Tag[] = post.tags || [];
  const authorInitial = post.author ? post.author.charAt(0).toUpperCase() : 'K';

  return (
    <header className="mb-8">
      {/* Category & Tags Header */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${categoryColor}`}>
          {categoryName}
        </span>

        {tags.map((t: Tag) => (
          <span
            key={t.id || t.name}
            className="text-xs text-zinc-400 font-semibold bg-zinc-900 px-2.5 py-0.5 rounded-md border border-zinc-800"
          >
            #{t.name}
          </span>
        ))}
      </div>

      {/* Article Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.15] tracking-tight mb-6">
        {post.title}
      </h1>

      {/* Author & Publication Details */}
      <div className="flex items-center justify-between border-y border-zinc-900 py-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center font-black text-sm text-white shadow-md border border-white/10">
            {authorInitial}
          </div>
          <div>
            <div className="font-bold text-sm text-zinc-100 flex items-center gap-2">
              <span>{post.author}</span>
              <span className="text-[10px] font-semibold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-wider">
                Author
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(post.date_posted)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {readTime} min read
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onShare}
          className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          title="Share article link"
        >
          {copied ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />}
        </button>
      </div>
    </header>
  );
}
