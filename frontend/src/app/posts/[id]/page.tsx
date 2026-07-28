'use client';

import React, { use, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowLeft,
  Share2,
  Check,
  Trophy,
  AlertTriangle,
  SquarePen,
} from 'lucide-react';

import { getSinglePost } from '@/src/app/features/sports-blog-home/actions/get_single_post';
import { reactToPost, removeReaction, ReactionType } from '@/src/app/features/sports-blog-home/actions/react_on_post';
import { getTagColor, getPostGradient, getReadTime } from '@/src/app/features/sports-blog-home/utils/postDisplay';
import { Post } from '@/src/app/features/sports-blog-home/types';

import { WrittenByAuthorCard } from './components/written-by-author-card';
import { PostArticleHeader } from './components/post-article-header';
import { PostArticleContent } from './components/post-article-content';
import { PostReactionsBar } from './components/post-reactions-bar';
import { BrandLogo } from '@/src/app/components/BrandLogo';

interface VisitingPostPageProps {
  params: Promise<{ id: string }>;
}

export default function VisitingPostPage({ params }: VisitingPostPageProps) {
  const { id: postId } = use(params);
  const queryClient = useQueryClient();

  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Calculate reading scroll progress bar percentage
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch single post details using React Query
  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery<Post>({
    queryKey: ['post', postId],
    queryFn: () => getSinglePost(postId),
    enabled: Boolean(postId),
  });

  // Reaction mutation logic (Like, Love, Laugh)
  const reactionMutation = useMutation({
    mutationFn: async (type: ReactionType) => {
      if (!post) return;
      if (post.current_user_reaction === type) {
        return await removeReaction(post.id);
      } else {
        return await reactToPost(post.id, type);
      }
    },
    onSuccess: (updatedPost) => {
      if (updatedPost) {
        queryClient.setQueryData(['post', postId], updatedPost);
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    },
  });

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 1. Skeleton Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 transition-colors duration-200">
        <div className="w-full max-w-3xl space-y-8 animate-pulse">
          <div className="h-6 w-32 bg-muted rounded-full" />
          <div className="h-12 w-3/4 bg-muted rounded-2xl" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
          <div className="h-[320px] w-full bg-muted rounded-3xl" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
            <div className="h-4 w-4/6 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Error / Not Found State
  if (isError || !post) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 transition-colors duration-200">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 uppercase italic tracking-tight text-foreground">
            Article Not Found
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            The article you are trying to visit could not be loaded or may have been removed.
          </p>
          {error && (
            <p className="text-xs text-red-400 bg-muted border border-border p-3 rounded-xl mb-6 font-mono text-left overflow-x-auto">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          )}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full bg-terracotta-primary hover:bg-terracotta-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>Return to Khela Dekho Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = post.category?.name || 'General';
  const categoryColor = getTagColor(categoryName);
  const gradient = getPostGradient(post.id);
  const readTime = getReadTime(post.content);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col transition-colors duration-200 selection:bg-terracotta-primary selection:text-white">
      {/* Top Reading Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-terracotta-primary z-50 transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Medium-style Sticky Top Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors duration-200">
        <BrandLogo size="sm" showSubtitle={true} />

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-bold text-foreground bg-card hover:bg-muted px-3.5 py-1.5 rounded-full border border-border transition-all cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-500" />
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={14} />
                <span>Share</span>
              </>
            )}
          </button>

          <Link
            href="/create-post"
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-terracotta-primary hover:bg-terracotta-dark px-3.5 py-1.5 rounded-full transition-all shadow-md cursor-pointer"
          >
            <SquarePen size={14} />
            <span className="hidden sm:inline">Write Article</span>
          </Link>
        </div>
      </header>

      {/* Main Modular Article Reading Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* 1. Article Header Component (Tags, Category, Title, Author info, Date, Read time, Share) */}
        <PostArticleHeader
          post={post}
          categoryName={categoryName}
          categoryColor={categoryColor}
          readTime={readTime}
          copied={copied}
          onShare={handleShare}
        />

        {/* 2. Article Content Component (Cover image, Video stream preview, Body text, References, Topics) */}
        <PostArticleContent
          post={post}
          gradient={gradient}
        />

        {/* 3. Article Reactions Bar Component (Likes, Loves, Laughs, Share) */}
        <PostReactionsBar
          post={post}
          copied={copied}
          isPending={reactionMutation.isPending}
          onReact={(type) => reactionMutation.mutate(type)}
          onShare={handleShare}
        />

        {/* 4. Written By Author Info Component */}
        <WrittenByAuthorCard author={post.author} />

        {/* Bottom Back Button */}
        <div className="text-center pt-6 border-t border-border">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-card hover:bg-muted text-foreground font-bold rounded-2xl border border-border transition-all cursor-pointer hover:-translate-y-0.5 shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>Return to Khela Dekho Home</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-card border-t border-border py-10 text-center text-muted-foreground text-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 space-y-4 flex flex-col items-center">
          <BrandLogo size="sm" showSubtitle={false} href="/" />
          <p>© {new Date().getFullYear()} Khela Dekho Blog. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}


