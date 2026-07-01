'use client';

import React, { useEffect } from 'react';
import { X, Calendar, Clock, MessageSquare, Heart, Share2 } from 'lucide-react';
import { Post } from '../types';

interface DetailModalProps {
  post: Post | null;
  onClose: () => void;
}

// Reuse the helpers for design consistency
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
    'from-red-600/30 via-zinc-900 to-zinc-950',
    'from-blue-600/30 via-zinc-900 to-zinc-950',
    'from-amber-600/30 via-zinc-900 to-zinc-950',
    'from-green-600/30 via-zinc-900 to-zinc-950',
    'from-purple-600/30 via-zinc-900 to-zinc-950',
    'from-pink-600/30 via-zinc-900 to-zinc-950',
  ];
  return gradients[(id - 1) % gradients.length];
};

export function DetailModal({ post, onClose }: DetailModalProps) {
  // Bind Escape key to close the modal (valid usage of useEffect for global browser event)
  useEffect(() => {
    if (!post) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [post, onClose]);

  if (!post) return null;

  const tag = getSportTag(post.id);
  const tagColor = getTagColor(tag);
  const gradient = getPostGradient(post.id);

  const wordCount = post.content.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
      {/* Blurry Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Content Box */}
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col max-h-[85vh] animate-scale-up">
        
        {/* Top Header Card Background */}
        <div className={`p-6 sm:p-8 bg-gradient-to-br ${gradient} border-b border-zinc-800 relative`}>
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-zinc-400 hover:text-white bg-zinc-950/50 hover:bg-zinc-800 p-2 rounded-full border border-zinc-800 transition-all cursor-pointer"
            title="Close modal"
          >
            <X size={20} />
          </button>

          {/* Tag and ID */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${tagColor}`}>
              {tag}
            </span>
            <span className="text-xs text-zinc-400 font-bold bg-zinc-950/60 px-2 py-0.5 rounded border border-zinc-800">
              ARTICLE #{post.id.toString().padStart(3, '0')}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight pr-8">
            {post.title}
          </h2>

          {/* Author Details and Date */}
          <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-zinc-300">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-xs border border-zinc-800 text-white uppercase">
                {post.author.charAt(0)}
              </span>
              <span className="font-semibold text-white">{post.author}</span>
            </div>
            
            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-zinc-400">
              <Calendar size={15} />
              <span>{post.date_posted}</span>
            </div>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-zinc-400">
              <Clock size={15} />
              <span>{readTime} min read</span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-zinc-300 space-y-6 leading-relaxed">
          <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line text-zinc-200">
            {post.content}
          </p>

          <p className="text-sm text-zinc-400 border-t border-zinc-800/60 pt-6">
            Disclaimer: Opinions expressed in this sports column represent those of the writer and are intended to inspire dialogue within the Khela Dekho community. We encourage readers to join the discussion.
          </p>
        </div>

        {/* Modal Footer Interactive Bar */}
        <div className="bg-zinc-950 px-6 py-4 border-t border-zinc-800 flex items-center justify-between text-zinc-400 text-sm">
          {/* Reaction Buttons */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer">
              <Heart size={16} />
              <span>24</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors cursor-pointer">
              <MessageSquare size={16} />
              <span>8 Comments</span>
            </button>
          </div>

          {/* Share */}
          <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>

      </div>
    </div>
  );
}
