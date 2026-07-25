'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { SquarePen, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { listAllPosts } from '../../sports-blog-home/actions/list_all_post';
import { PublishedPostCard } from './PublishedPostCard';
import type { AuthUser } from '../../auth/types';
import type { Post } from '../../sports-blog-home/types';

interface PublishingTabProps {
  user: AuthUser | null;
}

export function PublishingTab({ user }: PublishingTabProps) {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['allPosts'],
    // Pull a large page: this tab filters the feed down to the user's own posts
    // client-side, so it must see more than the default first page.
    queryFn: () => listAllPosts({ limit: 100 }),
  });

  // Filter posts created by the logged in user, or fall back to sample posts if empty
  const userPosts = (posts || []).filter(
    (p) => p.user_id === user?.id || (user?.username && p.author === user.username)
  );

  const handleMoreClick = (post: Post) => {
    toast.info('Post Options', {
      description: `Managing options for "${post.title.slice(0, 30)}..."`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles size={16} className="text-red-500" />
            <span>Your Published Stories</span>
          </h2>
          <p className="text-xs text-zinc-400 font-light mt-0.5">
            Manage and view engagement on articles you have published to Khela Dekho.
          </p>
        </div>

        <Link
          href="/create-post"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto uppercase tracking-wider"
        >
          <SquarePen size={14} />
          <span>Write New Article</span>
        </Link>
      </div>

      {/* Posts List or Loading / Empty States */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 animate-pulse space-y-3">
              <div className="h-4 w-32 bg-zinc-800 rounded-md" />
              <div className="h-6 w-3/4 bg-zinc-800 rounded-md" />
              <div className="h-3 w-1/2 bg-zinc-800 rounded-md" />
            </div>
          ))}
        </div>
      ) : userPosts.length > 0 ? (
        <div className="space-y-4">
          {userPosts.map((post) => (
            <PublishedPostCard
              key={post.id}
              post={post}
              user={user}
              onMoreClick={handleMoreClick}
            />
          ))}
        </div>
      ) : (
        /* Render sample cards or empty state if user has no published posts yet */
        <div className="space-y-4">
          {posts && posts.length > 0 ? (
            /* Display published posts from platform to demonstrate card layout */
            posts.slice(0, 3).map((post) => (
              <PublishedPostCard
                key={post.id}
                post={post}
                user={user}
                onMoreClick={handleMoreClick}
              />
            ))
          ) : (
            <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                <SquarePen size={20} />
              </div>
              <h3 className="text-sm font-bold text-white">No Published Articles Yet</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto font-light">
                Share your tactical match analysis, transfer news, or team predictions with thousands of sports fans!
              </p>
              <Link
                href="/create-post"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all uppercase tracking-wider"
              >
                Publish Your First Post
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
