'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { RotateCcw, AlertTriangle, Trophy, SquarePen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Header } from './components/Header';
import { PostCard } from './components/PostCard';
import { SkeletonGrid } from './components/SkeletonGrid';
import { LiveScoreTicker } from './components/LiveScoreTicker';
import { LeagueStandingsWidget } from './components/LeagueStandingsWidget';
import { useSportsBlogStore } from './utils/store';
import { listAllPosts } from './actions/list_all_post';
import { Post } from './types';

const PAGE_SIZE = 20;

interface SportsBlogHomeProps {
  // Server-prefetched first page (see app/page.tsx). Only seeds the default,
  // no-filter query — once the user searches/filters, React Query fetches
  // fresh as usual.
  initialPosts?: Post[];
}

export default function SportsBlogHome({ initialPosts }: SportsBlogHomeProps) {
  // Zustand State
  const {
    searchQuery,
    selectedAuthor,
    selectedCategory,
    layoutMode,
    resetFilters
  } = useSportsBlogStore();

  // Debounce the search box so full-text search runs server-side without a
  // request per keystroke.
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery.trim());
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch posts page-by-page so the initial feed load stays small and fast.
  // `debouncedQuery` drives the backend `?q=` full-text search (rank-ordered).
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts', debouncedQuery],
    queryFn: ({ pageParam }) =>
      listAllPosts({ q: debouncedQuery || undefined, limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    // A short page means the server has no more rows.
    getNextPageParam: (lastPage: Post[], allPages: Post[][]) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
    // Seed with the server-prefetched page so the default feed paints
    // immediately; only applies while the query key matches (no search yet).
    ...(initialPosts && debouncedQuery === ''
      ? { initialData: { pages: [initialPosts], pageParams: [0] } }
      : {}),
  });

  const posts = useMemo<Post[]>(() => data?.pages.flat() ?? [], [data]);

  const hasActiveQuery =
    debouncedQuery !== '' || selectedAuthor !== '' || selectedCategory !== '';

  // Extract unique lists of authors and categories for filter dropdowns
  const uniqueAuthors = useMemo(() => {
    const authors = posts.map(p => p.author).filter(Boolean);
    return Array.from(new Set(authors));
  }, [posts]);

  const uniqueCategories = useMemo(() => {
    const categories = posts.map(p => p.category?.name).filter(Boolean);
    return Array.from(new Set(categories));
  }, [posts]);

  // Search runs server-side (?q=); only author/category are filtered client-side.
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesAuthor = selectedAuthor === '' || post.author === selectedAuthor;
      const matchesCategory = selectedCategory === '' || post.category?.name === selectedCategory;
      return matchesAuthor && matchesCategory;
    });
  }, [posts, selectedAuthor, selectedCategory]);

  const allCards = filteredPosts;

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
    <div className="min-h-screen bg-card text-foreground font-sans flex flex-col transition-colors duration-200 selection:bg-terracotta-primary selection:text-white">

      {/* Navigation Header */}
      <Header authors={uniqueAuthors} categories={uniqueCategories} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">

        {/* Live Sports Scores Ticker */}
        <LiveScoreTicker />

        {/* Content Section: Posts + Standings Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Main Posts Area (3 cols) */}
          <div className="lg:col-span-3 space-y-6">

            {/* Loading State */}
            {isLoading ? (
              <SkeletonGrid layoutMode={layoutMode} />
            ) : filteredPosts.length === 0 ? (
              /* Empty State */
              !hasActiveQuery ? (
                <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-card">
                  <Trophy size={40} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-1">No Posts Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                    Be the first to write a sports article and publish it to the community!
                  </p>
                  <Link
                    href="/create-post"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-terracotta-primary hover:bg-terracotta-dark text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
                  >
                    <SquarePen size={16} />
                    <span>Write First Post</span>
                  </Link>
                </div>
              ) : (
                <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-card">
                  <Trophy size={40} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-1">No Matches Found</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                    We couldn&apos;t find any sports analysis matching your filter parameters.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-sm font-medium transition-all cursor-pointer border border-border"
                  >
                    <RotateCcw size={14} />
                    <span>Clear Search Filters</span>
                  </button>
                </div>
              )
            ) : (
              <div className="space-y-6">
                {/* Posts Grid (3 Cards per row in grid view) / List */}
                <div className={
                  layoutMode === 'list'
                    ? 'space-y-6'
                    : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'
                }>
                  {allCards.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      layoutMode={layoutMode}
                      borderRadius="rounded-[12px]"
                      imageHeight="h-44"
                    />
                  ))}
                </div>

                {/* Load more — server paginates (incl. ?q= search); hide only when a
                    client-side author/category filter is narrowing the current page. */}
                {hasNextPage && selectedAuthor === '' && selectedCategory === '' && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-sm font-bold transition-all cursor-pointer border border-border disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Loading…</span>
                        </>
                      ) : (
                        <span>Load More Articles</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Area (1 col) */}
          <div className="lg:col-span-1 space-y-6">
            <LeagueStandingsWidget />
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full bg-card border-t border-border py-10 mt-20 text-center text-muted-foreground text-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-center gap-2 font-bold tracking-wider text-foreground uppercase italic">
            <Trophy size={14} className="text-terracotta-primary" />
            <span>Khela Dekho Sports Arena</span>
          </div>
          <p>© {new Date().getFullYear()} Khela Dekho Blog. All Rights Reserved. Dev Stack: FastAPI + Next.js 16 + Zustand + React Query.</p>
        </div>
      </footer>
    </div>
  );
}
