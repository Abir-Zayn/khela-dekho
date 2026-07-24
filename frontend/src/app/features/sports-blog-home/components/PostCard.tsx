'use client';

import React from 'react';
import { Calendar, Clock, ArrowRight, Heart } from 'lucide-react';
import { Post, LayoutMode } from '../types';
import { getTagColor, getPostGradient, getReadTime, formatDate } from '../utils/postDisplay';

interface PostCardProps {
  post: Post;
  layoutMode: LayoutMode;
  onClick: () => void;
}

export function PostCard({ post, layoutMode, onClick }: PostCardProps) {
  const tag = post.category.name;
  const tagColor = getTagColor(tag);
  const gradient = getPostGradient(post.id);
  const readTime = getReadTime(post.content);

  if (layoutMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="group relative flex flex-col md:flex-row items-stretch bg-zinc-900 border border-zinc-800/80 hover:border-red-500/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl cursor-pointer"
      >
        {/* Left Side Aesthetic Sports Color Banner */}
        <div className={`w-full md:w-48 bg-gradient-to-br ${gradient} flex flex-col justify-between p-6 border-b md:border-b-0 md:border-r border-zinc-800`}>
          <span className={`inline-self-start self-start px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${tagColor}`}>
            {tag}
          </span>
          <div className="mt-8 md:mt-0 flex items-center gap-2.5 text-zinc-400 group-hover:text-white transition-colors">
            <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs border border-zinc-700 text-white uppercase">
              {post.author.charAt(0)}
            </span>
            <span className="text-xs font-medium truncate max-w-[120px]">{post.author}</span>
          </div>
        </div>

        {/* Right Side Content */}
        <div className="flex-1 flex flex-col justify-between p-6">
          <div>
            {/* Metadata row */}
            <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3">
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {formatDate(post.date_posted)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {readTime} min read
              </span>
            </div>

            <h3 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors line-clamp-1 mb-2">
              {post.title}
            </h3>
            <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
              {post.content.replace(/<[^>]*>?/gm, '')}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
              <Heart size={13} className="text-red-500" />
              {post.reaction_counts.like}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-red-500 group-hover:translate-x-1 transition-transform">
              READ ARTICLE <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout (default)
  return (
    <div
      onClick={onClick}
      className="group flex flex-col bg-zinc-900 border border-zinc-800/85 hover:border-red-500/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-red-950/10 hover:-translate-y-1 cursor-pointer h-full"
    >
      {/* Aesthetic Top Sports Banner Image Area */}
      <div className={`h-40 bg-gradient-to-br ${gradient} p-5 flex flex-col justify-between border-b border-zinc-800/50`}>
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${tagColor}`}>
            {tag}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-white/50 group-hover:text-white transition-colors bg-black/35 backdrop-blur px-2 py-0.5 rounded border border-white/5">
            <Heart size={11} className="text-red-500" />
            {post.reaction_counts.like}
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-300 group-hover:text-white transition-colors bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 w-fit max-w-[85%]">
          <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[10px] border border-zinc-700 text-white uppercase shrink-0">
            {post.author.charAt(0)}
          </span>
          <span className="text-xs font-medium truncate">{post.author}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Date & Read time */}
          <div className="flex items-center gap-3 text-[11px] text-zinc-500 mb-3">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(post.date_posted)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {readTime} min read
            </span>
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors line-clamp-1 mb-2">
            {post.title}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-4">
            {post.content.replace(/<[^>]*>?/gm, '')}
          </p>
        </div>

        <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
            SPORTS BLOG
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-red-500 group-hover:translate-x-1 transition-transform">
            READ ARTICLE <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}
