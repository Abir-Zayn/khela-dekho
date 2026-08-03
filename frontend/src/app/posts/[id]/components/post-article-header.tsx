'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, Share2, Check, Edit3, Pin, PinOff } from 'lucide-react';
import { Post, Tag } from '@/src/app/features/sports-blog-home/types';
import { formatDate } from '@/src/app/features/sports-blog-home/utils/postDisplay';

export interface PostArticleHeaderProps {
  post: Post;
  categoryName: string;
  categoryColor: string;
  readTime: number;
  copied: boolean;
  onShare: () => void;
  isAuthor?: boolean;
  onTogglePin?: () => void;
  isPinPending?: boolean;
}

export function PostArticleHeader({
  post,
  categoryName,
  categoryColor,
  readTime,
  copied,
  onShare,
  isAuthor,
  onTogglePin,
  isPinPending,
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
            className="text-xs text-muted-foreground font-semibold bg-card px-2.5 py-0.5 rounded-md border border-border"
          >
            #{t.name}
          </span>
        ))}
      </div>

      {/* Article Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-[1.15] tracking-tight mb-6">
        {post.title}
      </h1>

      {/* Author & Publication Details */}
      <div className="flex items-center justify-between border-y border-border py-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-terracotta-primary to-amber-500 flex items-center justify-center font-black text-sm text-white shadow-md border border-white/20">
            {authorInitial}
          </div>
          <div>
            <div className="font-bold text-sm text-foreground flex items-center gap-2">
              <span>{post.author}</span>
              <span className="text-[10px] font-semibold text-terracotta-primary bg-terracotta-primary/10 px-2 py-0.5 rounded border border-terracotta-primary/20 uppercase tracking-wider">
                Author
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
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

        <div className="flex items-center gap-2">
          {isAuthor && (
            <Link
              href={`/posts/${post.id}/edit`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-terracotta-primary/10 hover:bg-terracotta-primary text-terracotta-primary hover:text-white border border-terracotta-primary/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Edit this article"
            >
              <Edit3 size={14} />
              <span>Edit Story</span>
            </Link>
          )}

          {onTogglePin && (
            <button
              onClick={onTogglePin}
              disabled={isPinPending}
              className={`p-2.5 rounded-full border transition-all cursor-pointer shadow-sm ${
                post.is_pinned
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border'
              }`}
              title={post.is_pinned ? 'Unpin this story' : 'Pin this story to profile'}
            >
              {post.is_pinned ? <PinOff size={18} /> : <Pin size={18} />}
            </button>
          )}

          <button
            onClick={onShare}
            className="p-2.5 rounded-full bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer shadow-sm"
            title="Share article link"
          >
            {copied ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}

