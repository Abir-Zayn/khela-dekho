'use client';

import React from 'react';
import { Heart, Flame, Smile, Share2, Check } from 'lucide-react';
import { Post } from '@/src/app/features/sports-blog-home/types';
import { ReactionType } from '@/src/app/features/sports-blog-home/actions/react_on_post';

export interface PostReactionsBarProps {
  post: Post;
  copied: boolean;
  isPending: boolean;
  onReact: (type: ReactionType) => void;
  onShare: () => void;
}

export function PostReactionsBar({
  post,
  copied,
  isPending,
  onReact,
  onShare,
}: PostReactionsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-zinc-900 mb-12">
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          onClick={() => onReact('like')}
          disabled={isPending}
          className={`flex items-center gap-2 text-sm font-semibold transition-all cursor-pointer hover:scale-105 ${
            post.current_user_reaction === 'like'
              ? 'text-red-500'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Like post"
        >
          <Heart
            size={18}
            className={post.current_user_reaction === 'like' ? 'fill-red-500 text-red-500' : ''}
          />
          <span>{post.reaction_counts?.like || post.likes || 0}</span>
        </button>

        <button
          onClick={() => onReact('love')}
          disabled={isPending}
          className={`flex items-center gap-2 text-sm font-semibold transition-all cursor-pointer hover:scale-105 ${
            post.current_user_reaction === 'love'
              ? 'text-pink-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Love post"
        >
          <Flame
            size={18}
            className={post.current_user_reaction === 'love' ? 'fill-pink-400 text-pink-400' : ''}
          />
          <span>{post.reaction_counts?.love || 0}</span>
        </button>

        <button
          onClick={() => onReact('laugh')}
          disabled={isPending}
          className={`flex items-center gap-2 text-sm font-semibold transition-all cursor-pointer hover:scale-105 ${
            post.current_user_reaction === 'laugh'
              ? 'text-amber-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Laugh at post"
        >
          <Smile
            size={18}
            className={post.current_user_reaction === 'laugh' ? 'fill-amber-400 text-amber-400' : ''}
          />
          <span>{post.reaction_counts?.laugh || 0}</span>
        </button>
      </div>

      <button
        onClick={onShare}
        className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
      >
        {copied ? (
          <>
            <Check size={16} className="text-green-500" />
            <span className="text-green-400">Link Copied</span>
          </>
        ) : (
          <>
            <Share2 size={16} />
            <span>Share Article</span>
          </>
        )}
      </button>
    </div>
  );
}
