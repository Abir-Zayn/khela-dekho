'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, Heart, Tag as TagIcon } from 'lucide-react';
import { Post, LayoutMode } from '../types';
import { getTagColor, getPostGradient, getReadTime, formatDate, getExcerpt } from '../utils/postDisplay';
import { Card, CardTitle, CardFooter } from '@/components/ui/card';

export interface PostCardProps {
  post: Post;
  layoutMode?: LayoutMode;
  borderRadius?: string; // Default: 'rounded-[12px]' (resizable border radius)
  imageHeight?: string;  // Default: 'h-[180px]' (reusable image height)
  cardWidth?: string;   // Default: 'w-full max-w-[480px]' (480px card width)
  cardHeight?: string;  // Default: 'h-[400px]' (400px card height)
  className?: string;
  onClick?: () => void;
}

function getPostImageUrl(post: Post): string | null {
  if (post.image_url && post.image_url.trim()) {
    return post.image_url.trim();
  }
  if (post.content) {
    const match = /<img[^>]+src=["']([^"']+)["'][^>]*>/i.exec(post.content);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

export function PostCard({
  post,
  layoutMode = 'grid',
  borderRadius = 'rounded-[12px]',
  imageHeight = 'h-[180px]',
  cardWidth = 'w-full max-w-[480px]',
  cardHeight = 'h-[408px]',
  className = '',
  onClick,
}: PostCardProps) {
  const categoryName = post.category?.name || 'General';
  const categoryColor = getTagColor(categoryName);
  const gradient = getPostGradient(post.id);
  // Prefer server-provided card fields (feed responses); fall back to deriving from
  // full content when this post came from a single-post fetch.
  const readTime = post.read_minutes ?? getReadTime(post.content ?? '');
  const excerpt = post.excerpt ?? getExcerpt(post.content ?? '', 90);
  const tags = post.tags || [];
  const displayImageUrl = getPostImageUrl(post);

  return (
    <Link href={`/posts/${post.id}`} className="block h-full w-full">
      <Card
        onClick={onClick}
        className={`flex flex-col justify-between ${cardWidth} ${cardHeight} ${borderRadius} border border-border hover:border-terracotta-primary/50 shadow-sm transition-all duration-300 overflow-hidden cursor-pointer mx-auto ${className}`}
      >
      {/* 1. Top Image Container (Reusable imageHeight & resizable radius top) */}
      <div className={`relative w-full ${imageHeight} overflow-hidden bg-gradient-to-br ${gradient} shrink-0`}>
        {displayImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={displayImageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-red-600/20 via-zinc-900 to-zinc-950">
            <span className="text-3xl opacity-20 font-black italic tracking-tighter text-white self-end">
              KHELA DEKHO
            </span>
          </div>
        )}

        {/* Top Badges Overlay (Category & Likes) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md bg-card/80 text-card-foreground ${categoryColor}`}>
            {categoryName}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-card-foreground bg-card/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-border">
            <Heart size={11} className="text-terracotta-primary fill-terracotta-primary/20" />
            {post.reaction_counts?.like || 0}
          </span>
        </div>
      </div>

      {/* 2. Below Image Content (Body container for title, 2-line excerpt, tags, category, and date) */}
      <div className="p-4 flex-1 flex flex-col justify-between overflow-hidden bg-card text-card-foreground">
        <div>
          {/* Category */}
          <div className="text-[11px] font-bold uppercase tracking-wider text-terracotta-primary mb-1">
            {categoryName}
          </div>

          {/* Title of the blog post */}
          <CardTitle className="text-sm sm:text-base font-bold text-foreground line-clamp-2 leading-snug mb-1">
            {post.title}
          </CardTitle>

          {/* Published by Author name */}
          <p className="text-xs text-muted-foreground font-medium mb-2">
            Published by <span className="text-foreground font-semibold">{post.author}</span>
          </p>

          {/* Excerpt */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        </div>

        <div>
          {/* Tags list */}
          {tags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1 my-2 pt-2 border-t border-border">
              <TagIcon size={10} className="text-muted-foreground mr-0.5" />
              {tags.slice(0, 3).map((t) => (
                <span
                  key={t.id || t.name}
                  className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border truncate max-w-[100px]"
                >
                  #{t.name}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{tags.length - 3}</span>
              )}
            </div>
          ) : (
            <div className="my-2 pt-2 border-t border-border" />
          )}

          {/* Footer Metadata */}
          <CardFooter className="p-0 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{formatDate(post.date_posted)}</span>
            <span className="flex items-center gap-1 text-xs font-bold text-terracotta-primary">
              READ ARTICLE <ArrowRight size={11} />
            </span>
          </CardFooter>
        </div>
      </div>
    </Card>
    </Link>
  );
}
