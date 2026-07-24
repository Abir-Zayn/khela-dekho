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

export function PostCard({
  post,
  layoutMode = 'grid',
  borderRadius = 'rounded-[12px]',
  imageHeight = 'h-[180px]',
  cardWidth = 'w-full max-w-[480px]',
  cardHeight = 'h-[400px]',
  className = '',
  onClick,
}: PostCardProps) {
  const categoryName = post.category?.name || 'General';
  const categoryColor = getTagColor(categoryName);
  const gradient = getPostGradient(post.id);
  const readTime = getReadTime(post.content);
  const tags = post.tags || [];

  return (
    <Link href={`/posts/${post.id}`} className="block h-full w-full">
      <Card
        onClick={onClick}
        className={`group flex flex-col justify-between ${cardWidth} ${cardHeight} ${borderRadius} overflow-hidden cursor-pointer mx-auto ${className}`}
      >
      {/* 1. Top Image Container (Reusable imageHeight & resizable radius top) */}
      <div className={`relative w-full ${imageHeight} overflow-hidden bg-gradient-to-br ${gradient} border-b border-zinc-800/60 shrink-0`}>
        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md bg-black/60 ${categoryColor}`}>
            {categoryName}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-white/90 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
            <Heart size={11} className="text-red-500" />
            {post.reaction_counts?.like || 0}
          </span>
        </div>
      </div>

      {/* 2. Below Image Content */}
      <div className="p-4 flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          {/* Category */}
          <div className="text-[11px] font-bold uppercase tracking-wider text-red-500 mb-1">
            {categoryName}
          </div>

          {/* Title of the blog post */}
          <CardTitle className="text-sm sm:text-base group-hover:text-red-500 transition-colors line-clamp-2 leading-snug mb-1">
            {post.title}
          </CardTitle>

          {/* Published by Author name */}
          <p className="text-xs text-zinc-400 font-medium mb-2">
            Published by <span className="text-zinc-200 font-semibold">{post.author}</span>
          </p>

          {/* Excerpt */}
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {getExcerpt(post.content, 90)}
          </p>
        </div>

        <div>
          {/* Tags list */}
          {tags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1 my-2 pt-2 border-t border-zinc-800/40">
              <TagIcon size={10} className="text-zinc-500 mr-0.5" />
              {tags.slice(0, 3).map((t) => (
                <span
                  key={t.id || t.name}
                  className="text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 truncate max-w-[100px]"
                >
                  #{t.name}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-[10px] text-zinc-500">+{tags.length - 3}</span>
              )}
            </div>
          ) : (
            <div className="my-2 pt-2 border-t border-zinc-800/40" />
          )}

          {/* Footer Metadata */}
          <CardFooter className="p-0 flex items-center justify-between text-[11px] text-zinc-500">
            <span>{formatDate(post.date_posted)}</span>
            <span className="flex items-center gap-1 text-xs font-bold text-red-500 group-hover:translate-x-1 transition-transform">
              READ ARTICLE <ArrowRight size={11} />
            </span>
          </CardFooter>
        </div>
      </div>
    </Card>
    </Link>
  );
}
