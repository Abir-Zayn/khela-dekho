'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, RotateCcw, LayoutGrid, List, Trophy, Flame, SquarePen } from 'lucide-react';
import Link from 'next/link';
import { useSportsBlogStore } from '../utils/store';
import { getCurrentUser } from '../../auth';
import { UserProfileTile } from './UserProfileTile';
import { BrandLogo } from '../../../components/BrandLogo';

interface HeaderProps {
  authors: string[];
  categories?: string[];
}

export function Header({ authors, categories = [] }: HeaderProps) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getCurrentUser(),
  });

  const {
    searchQuery,
    setSearchQuery,
    selectedAuthor,
    setSelectedAuthor,
    selectedCategory,
    setSelectedCategory,
    layoutMode,
    setLayoutMode,
    resetFilters,
  } = useSportsBlogStore();

  const hasActiveFilters = searchQuery !== '' || selectedAuthor !== '' || selectedCategory !== '';

  return (
    <header className="w-full bg-card text-card-foreground border-b border-border transition-colors duration-200">
      {/* Top Banner: Sports Ticker Highlight */}
      <div className="bg-amber-500 text-black py-1.5 px-4 text-center font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
        <Trophy size={14} className="animate-bounce" />
        <span>Live Stats, Expert Opinions & Deep Match Analysis • Updated Live</span>
      </div>

      {/* Main Header Container */}
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-row items-center justify-between gap-4">
          {/* Logo Brand Area (Text Only) */}
          <BrandLogo size="md" showSubtitle={true} />

          {/* Account Info */}
          <div className="flex items-center text-sm text-muted-foreground gap-2.5 sm:gap-4 md:border-l md:border-border md:pl-6">
            <Link
              href="/create-post"
              className="flex items-center gap-1.5 sm:gap-2 bg-background hover:bg-muted text-foreground border border-border px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <SquarePen size={16} className="text-terracotta-primary shrink-0" />
              <span>Write</span>
            </Link>

            <UserProfileTile user={user ?? null} />
          </div>
        </div>

        {/* Filter Controls Row (Card container background removed) */}
        <div className="mt-6 flex flex-col md:flex-row items-center gap-4 justify-between">
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search posts by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card text-card-foreground placeholder:text-muted-foreground border border-border focus:border-terracotta-primary focus:ring-1 focus:ring-terracotta-primary rounded-xl py-2.5 pl-10 pr-4 text-sm transition-all outline-none"
            />
          </div>
          {/* Filters & Toggles */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Category Dropdown */}
            {categories.length > 0 && (
              <div className="relative w-full sm:w-auto min-w-[140px]">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-card text-card-foreground border border-border focus:border-terracotta-primary rounded-xl py-2.5 px-4 text-sm outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-card text-card-foreground">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-card text-card-foreground">
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground text-xs">
                  ▼
                </div>
              </div>
            )}

            {/* Author Dropdown */}
            <div className="relative w-full sm:w-auto min-w-[140px]">
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full bg-card text-card-foreground border border-border focus:border-terracotta-primary rounded-xl py-2.5 px-4 text-sm outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-card text-card-foreground">All Authors</option>
                {authors.map((author) => (
                  <option key={author} value={author} className="bg-card text-card-foreground">
                    {author}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground text-xs">
                ▼
              </div>
            </div>

            {/* Clear Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-muted hover:bg-muted/80 text-foreground rounded-xl transition-all cursor-pointer border border-border"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}

            {/* Layout Toggle Buttons */}
            <div className="flex items-center bg-card border border-border p-1 rounded-xl">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${layoutMode === 'grid'
                  ? 'bg-terracotta-primary text-white'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${layoutMode === 'list'
                  ? 'bg-terracotta-primary text-white'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
