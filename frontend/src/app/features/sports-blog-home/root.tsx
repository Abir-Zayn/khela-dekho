'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RotateCcw, AlertTriangle, Trophy, Eye, Zap } from 'lucide-react';
import { Header } from './components/Header';
import { PostCard } from './components/PostCard';
import { DetailModal } from './components/DetailModal';
import { SkeletonGrid } from './components/SkeletonGrid';
import { useSportsBlogStore } from './utils/store';
import { getReadTime, formatDate } from './utils/postDisplay';
import { listAllPosts } from './actions/list_all_post';
import { Post } from './types';

export default function SportsBlogHome() {
  // Fetch posts via the list_all_post server action
  const {
    data: posts = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: () => listAllPosts(),
  });

  // Zustand State
  const {
    searchQuery,
    selectedAuthor,
    layoutMode,
    selectedPostId,
    setSelectedPostId,
    resetFilters
  } = useSportsBlogStore();

  // Extract unique list of authors for the filter dropdown
  const uniqueAuthors = useMemo(() => {
    const authors = posts.map(p => p.author);
    return Array.from(new Set(authors));
  }, [posts]);

  // Filter posts client-side based on search query and selected author
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAuthor = selectedAuthor === '' || post.author === selectedAuthor;

      return matchesSearch && matchesAuthor;
    });
  }, [posts, searchQuery, selectedAuthor]);

  // Identify the selected post details for modal view
  const selectedPost = useMemo(() => {
    if (selectedPostId === null) return null;
    return posts.find(p => p.id === selectedPostId) || null;
  }, [posts, selectedPostId]);

  // Designate the first post as the "Featured Hero Post" if no search/filter is active
  const hasActiveFilters = searchQuery !== '' || selectedAuthor !== '';
  const { heroPost, remainingPosts } = useMemo(() => {
    if (filteredPosts.length > 0 && !hasActiveFilters) {
      return {
        heroPost: filteredPosts[0],
        remainingPosts: filteredPosts.slice(1),
      };
    }
    return { heroPost: null, remainingPosts: filteredPosts };
  }, [filteredPosts, hasActiveFilters]);

  // Render Error State
  if (isError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold mb-2 uppercase italic tracking-tight">
            Database Off-Air
          </h2>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            We&apos;re having trouble connecting to the sports database. Make sure the backend server is running and try again.
          </p>
          <pre className="text-xs text-red-400 bg-black/40 border border-zinc-800/80 p-3 rounded-xl mb-6 overflow-x-auto text-left font-mono">
            {error instanceof Error ? error.message : 'Unknown connection error'}
          </pre>
          <button
            onClick={() => refetch()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-950/40 hover:-translate-y-0.5 cursor-pointer"
          >
            Reconnect Server
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-red-600 selection:text-white">

      {/* Navigation Header */}
      <Header authors={uniqueAuthors} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">

        {/* Loading State */}
        {isLoading ? (
          <SkeletonGrid layoutMode={layoutMode} />
        ) : filteredPosts.length === 0 ? (
          /* Empty Search Results State */
          <div className="py-20 text-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
            <Trophy size={40} className="text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-400 mb-1">No Matches Found</h3>
            <p className="text-sm text-zinc-500 max-w-xs mx-auto mb-6">
              We couldn&apos;t find any sports analysis matching your filter parameters.
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-medium transition-all cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Clear Search Filters</span>
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured Hero Post Banner (Only displayed in grid layout when filters are inactive) */}
            {heroPost && layoutMode === 'grid' && (
              <div
                onClick={() => setSelectedPostId(heroPost.id)}
                className="group relative bg-zinc-900 border border-zinc-850 hover:border-red-500/50 rounded-3xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-300 hover:shadow-red-950/5 flex flex-col lg:flex-row items-stretch"
              >
                {/* Visual Accent for Hero */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

                {/* Hero Gradient Thumbnail Banner */}
                <div className="lg:w-7/12 bg-gradient-to-br from-red-600/30 via-zinc-900 to-zinc-950 p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800 min-h-[300px]">
                  <div className="flex items-center gap-3">
                    <span className="bg-red-600 text-white font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-md flex items-center gap-1">
                      <Zap size={12} className="animate-pulse" />
                      Featured Analysis
                    </span>
                    <span className="bg-zinc-800/80 text-zinc-300 border border-zinc-700 font-bold text-xs uppercase px-3 py-1 rounded-md">
                      {heroPost.category.name}
                    </span>
                  </div>

                  <div className="mt-12">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight group-hover:text-red-500 transition-colors">
                      {heroPost.title}
                    </h2>
                    <div className="mt-6 flex items-center gap-3 text-zinc-300 bg-black/30 backdrop-blur border border-white/5 py-2 px-4 rounded-2xl w-fit">
                      <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs border border-zinc-700 text-white uppercase">
                        {heroPost.author.charAt(0)}
                      </span>
                      <div className="text-left">
                        <p className="text-xs text-zinc-400 font-medium">Article by</p>
                        <p className="text-sm font-bold text-white leading-none">{heroPost.author}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hero Excerpt & Action */}
                <div className="lg:w-5/12 p-8 sm:p-12 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>{formatDate(heroPost.date_posted)}</span>
                      <span>•</span>
                      <span>{getReadTime(heroPost.content)} min read</span>
                    </div>
                    <p className="text-base text-zinc-400 leading-relaxed font-light">
                      {heroPost.content.length > 250
                        ? `${heroPost.content.substring(0, 250)}...`
                        : heroPost.content
                      }
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-zinc-800/60 flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-medium tracking-widest uppercase">
                      Khela Dekho Special
                    </span>
                    <span className="flex items-center gap-1 text-sm font-bold text-red-500 group-hover:translate-x-1 transition-transform">
                      EXPLORE FULL STORY →
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Posts Grid / List */}
            <div>
              {heroPost && layoutMode === 'grid' && (
                <h4 className="text-sm font-extrabold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                  <Eye size={14} className="text-red-500" />
                  More Sports Columns
                </h4>
              )}

              <div className={
                layoutMode === 'list'
                  ? 'space-y-6'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
              }>
                {remainingPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    layoutMode={layoutMode}
                    onClick={() => setSelectedPostId(post.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full bg-zinc-950 border-t border-zinc-900 py-10 mt-20 text-center text-zinc-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-center gap-2 font-bold tracking-wider text-zinc-400 uppercase italic">
            <Trophy size={14} className="text-red-500" />
            <span>Khela Dekho Sports Arena</span>
          </div>
          <p>© {new Date().getFullYear()} Khela Dekho Blog. All Rights Reserved. Dev Stack: FastAPI + Next.js 16 + Zustand + React Query.</p>
        </div>
      </footer>

      {/* Detail Viewer Modal */}
      <DetailModal
        post={selectedPost}
        onClose={() => setSelectedPostId(null)}
      />

    </div>
  );
}
