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

  if (isLoading || isError || !relatedPosts?.length) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase italic text-foreground mb-5">
        You might also like
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {relatedPosts.slice(0, limit).map((post) => (
          <PostCard
            key={post.id}
            post={post}
            cardWidth="w-full max-w-none"
            cardHeight="h-[360px]"
            imageHeight="h-[150px]"
          />
        ))}
      </div>
    </section>
  );
}
