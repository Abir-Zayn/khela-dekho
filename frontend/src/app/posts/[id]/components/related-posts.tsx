'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { listRelatedPosts } from '@/src/app/features/sports-blog-home/actions/list_related_posts';
import { PostCard } from '@/src/app/features/sports-blog-home/components/PostCard';
import type { Post } from '@/src/app/features/sports-blog-home/types';

interface RelatedPostsProps {
  postId: string;
  limit?: number;
}

export function RelatedPosts({ postId, limit = 4 }: RelatedPostsProps) {
  const { data: relatedPosts, isLoading, isError } = useQuery<Post[]>({
    queryKey: ['related-posts', postId, limit],
    queryFn: () => listRelatedPosts(postId, limit),
    enabled: Boolean(postId),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <section className="mb-12 pt-8 border-t border-border">
        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-foreground mb-6">
          Recommended For You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="h-[368px] rounded-xl border border-border bg-card/60 p-4 flex flex-col justify-between animate-pulse"
            >
              <div className="w-full h-[150px] bg-muted rounded-lg" />
              <div className="space-y-2 my-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isError || !relatedPosts || relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="mb-12 pt-8 border-t border-border">
      <h2 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase text-foreground mb-6">
        Recommended For You
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {relatedPosts.slice(0, limit).map((post) => (
          <PostCard
            key={post.id}
            post={post}
            cardWidth="w-full max-w-none"
            cardHeight="h-[368px]"
            imageHeight="h-[150px]"
          />
        ))}
      </div>
    </section>
  );
}
