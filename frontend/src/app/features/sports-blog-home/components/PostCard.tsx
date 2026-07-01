'use client';

import React from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Post, LayoutMode } from '../types';

interface PostCardProps {
  post: Post;
  layoutMode: LayoutMode;
  onClick: () => void;
}

// Helpers to generate aesthetic sports elements based on ID
const getSportTag = (id: number) => {
  const tags = ['Tactical', 'Analysis', 'Opinion', 'Interview', 'Behind the Scenes', 'Highlights'];
  return tags[(id - 1) % tags.length];
};

const getTagColor = (tag: string) => {
  const colors: Record<string, string> = {
    Tactical: 'bg-red-500/10 text-red-500 border-red-500/20',
    Analysis: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Opinion: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Interview: 'bg-green-500/10 text-green-500 border-green-500/20',
    'Behind the Scenes': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    Highlights: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  };
  return colors[tag] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
};

const getPostGradient = (id: number) => {
  const gradients = [
    'from-red-600/20 via-zinc-900 to-zinc-950',
    'from-blue-600/20 via-zinc-900 to-zinc-950',
    'from-amber-600/20 via-zinc-900 to-zinc-950',
    'from-green-600/20 via-zinc-900 to-zinc-950',
    'from-purple-600/20 via-zinc-900 to-zinc-950',
    'from-pink-600/20 via-zinc-900 to-zinc-950',
  ];
  return gradients[(id - 1) % gradients.length];
};

export function PostCard({ post, layoutMode, onClick }: PostCardProps) {
  const tag = getSportTag(post.id);
  const tagColor = getTagColor(tag);
  const gradient = getPostGradient(post.id);
  
  // Calculate read time roughly
  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

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
                {post.date_posted}
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
              {post.content}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              ID: #{post.id.toString().padStart(3, '0')}
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
          <span className="text-xs font-bold text-white/50 group-hover:text-white transition-colors bg-black/35 backdrop-blur px-2 py-0.5 rounded border border-white/5">
            #{post.id.toString().padStart(3, '0')}
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
              {post.date_posted}
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
            {post.content}
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
