'use client';

import React, { useState } from 'react';
import { Heart, Flame, Smile, Share2, Check, Pin, PinOff } from 'lucide-react';
import { Post } from '@/src/app/features/sports-blog-home/types';
import { ReactionType } from '@/src/app/features/sports-blog-home/actions/react_on_post';
import { ReactorsModal } from '@/src/app/features/reactions';
import type { ReactionFilter } from '@/src/app/features/reactions';

export interface PostReactionsBarProps {
  post: Post;
  copied: boolean;
  isPending: boolean;
  onReact: (type: ReactionType) => void;
  onShare: () => void;
  isAuthor?: boolean;
  onTogglePin?: () => void;
  isPinPending?: boolean;
}

export function PostReactionsBar({
  post,
  copied,
  isPending,
  onReact,
  onShare,
  isAuthor,
  onTogglePin,
  isPinPending,
}: PostReactionsBarProps) {
  const [reactorsOpen, setReactorsOpen] = useState(false);
  const [reactorsFilter, setReactorsFilter] = useState<ReactionFilter>('all');

  const openReactors = (filter: ReactionFilter) => {
    setReactorsFilter(filter);
    setReactorsOpen(true);
  };

  const counts = {
    like: post.reaction_counts?.like ?? post.likes ?? 0,
    love: post.reaction_counts?.love ?? 0,
    laugh: post.reaction_counts?.laugh ?? 0,
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-border mb-12">
      <div className="flex items-center gap-4 sm:gap-6">
        <div
          className={`flex items-center gap-1.5 text-sm font-semibold transition-all ${
            post.current_user_reaction === 'like'
              ? 'text-red-500'
              : 'text-muted-foreground'
          }`}
        >
          <button
            onClick={() => onReact('like')}
            disabled={isPending}
            className="flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 hover:text-foreground disabled:opacity-50"
            title="Like post"
          >
            <Heart
              size={18}
              className={post.current_user_reaction === 'like' ? 'fill-red-500 text-red-500' : ''}
            />
          </button>
          <button
            onClick={() => openReactors('like')}
            className="cursor-pointer hover:underline hover:text-foreground"
            title="See who liked this"
          >
            {counts.like}
          </button>
        </div>

        <div
          className={`flex items-center gap-1.5 text-sm font-semibold transition-all ${
            post.current_user_reaction === 'love'
              ? 'text-pink-500'
              : 'text-muted-foreground'
          }`}
        >
          <button
            onClick={() => onReact('love')}
            disabled={isPending}
            className="flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 hover:text-foreground disabled:opacity-50"
            title="Love post"
          >
            <Flame
              size={18}
              className={post.current_user_reaction === 'love' ? 'fill-pink-500 text-pink-500' : ''}
            />
          </button>
          <button
            onClick={() => openReactors('love')}
            className="cursor-pointer hover:underline hover:text-foreground"
            title="See who loved this"
          >
            {counts.love}
          </button>
        </div>

        <div
          className={`flex items-center gap-1.5 text-sm font-semibold transition-all ${
            post.current_user_reaction === 'laugh'
              ? 'text-amber-500'
              : 'text-muted-foreground'
          }`}
        >
          <button
            onClick={() => onReact('laugh')}
            disabled={isPending}
            className="flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 hover:text-foreground disabled:opacity-50"
            title="Laugh at post"
          >
            <Smile
              size={18}
              className={post.current_user_reaction === 'laugh' ? 'fill-amber-500 text-amber-500' : ''}
            />
          </button>
          <button
            onClick={() => openReactors('laugh')}
            className="cursor-pointer hover:underline hover:text-foreground"
            title="See who laughed at this"
          >
            {counts.laugh}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {onTogglePin && (
          <button
            onClick={onTogglePin}
            disabled={isPinPending}
            className={`flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              post.is_pinned
                ? 'text-amber-500 hover:text-amber-600 font-extrabold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={post.is_pinned ? 'Unpin this article' : 'Pin this article to profile'}
          >
            {post.is_pinned ? (
              <>
                <PinOff size={16} className="text-amber-500" />
                <span>Pinned</span>
              </>
            ) : (
              <>
                <Pin size={16} />
                <span>Pin Article</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={onShare}
          className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={16} className="text-emerald-500" />
              <span className="text-emerald-500">Link Copied</span>
            </>
          ) : (
            <>
              <Share2 size={16} />
              <span>Share Article</span>
            </>
          )}
        </button>
      </div>

      <ReactorsModal
        key={reactorsFilter}
        postId={post.id}
        reactionCounts={counts}
        open={reactorsOpen}
        onOpenChange={setReactorsOpen}
        defaultFilter={reactorsFilter}
      />
    </div>
  );
}

