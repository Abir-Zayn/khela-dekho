'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, RotateCcw, LayoutGrid, List, Trophy, User, Flame, SquarePen, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useClerk } from '@clerk/nextjs';
import { toast } from 'sonner';
import { useSportsBlogStore } from '../utils/store';
import { getCurrentUser } from '../../auth';

interface HeaderProps {
  authors: string[];
  categories?: string[];
}

export function Header({ authors, categories = [] }: HeaderProps) {
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getCurrentUser(),
  });

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      queryClient.setQueryData(['currentUser'], null);
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Logged out successfully');
      setIsDropdownOpen(false);
      window.location.reload();
    } catch {
      toast.error('Logout failed');
    }
  };

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
    <header className="w-full bg-zinc-950 text-white border-b border-zinc-800">
      {/* Top Banner: Sports Ticker Highlight */}
      <div className="bg-amber-500 text-black py-1.5 px-4 text-center font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2">
        <Trophy size={14} className="animate-bounce" />
        <span>Live Stats, Expert Opinions & Deep Match Analysis • Updated Live</span>
      </div>

      {/* Main Header Container */}
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Logo Brand Area */}
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2.5 rounded-xl shadow-lg shadow-red-950/50 flex items-center justify-center rotate-[-3deg] hover:rotate-0 transition-transform duration-300">
              <Flame size={28} className="text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tighter uppercase italic leading-none">
                KHELA <span className="text-red-500">DEKHO</span>
              </h1>
              <p className="text-xs text-zinc-400 font-semibold tracking-widest uppercase mt-0.5">
                The Ultimate Sports Arena
              </p>
            </div>
          </div>

          {/* Account Info */}
          <div className="hidden lg:flex items-center border-l border-zinc-800 pl-6 text-sm text-zinc-400 gap-4">
            <Link
              href="/create-post"
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              <SquarePen size={16} className="text-red-500" />
              <span>Write</span>
            </Link>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 px-3 py-2 rounded-xl transition-all cursor-pointer select-none outline-none group"
                >
                  {user.profile_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, no fixed remote host to whitelist for next/image
                    <img
                      src={user.profile_photo_url}
                      alt={user.username}
                      width={32}
                      height={32}
                      className="w-7 h-7 rounded-full object-cover border border-zinc-700 group-hover:border-red-500 transition-colors"
                    />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-red-600 border border-red-500 flex items-center justify-center font-bold text-xs text-white uppercase">
                      {(user.full_name || user.username).charAt(0)}
                    </span>
                  )}
                  <span className="font-semibold text-sm text-white leading-none">
                    {user.full_name || user.username}
                  </span>
                  <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-zinc-800/80">
                      <p className="text-xs font-semibold text-white truncate">{user.full_name || user.username}</p>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <User size={16} />
                <span>Log In</span>
              </Link>
            )}
          </div>

        </div>

        {/* Filter Controls Area */}
        <div className="mt-8 bg-zinc-900/60 backdrop-blur border border-zinc-800/80 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center gap-4 justify-between">

          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search posts by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/80 text-white placeholder-zinc-500 border border-zinc-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-2.5 pl-10 pr-4 text-sm transition-all outline-none"
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
                  className="w-full bg-zinc-950/80 text-white border border-zinc-800 focus:border-red-500 rounded-xl py-2.5 px-4 text-sm outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-500 text-xs">
                  ▼
                </div>
              </div>
            )}

            {/* Author Dropdown */}
            <div className="relative w-full sm:w-auto min-w-[140px]">
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full bg-zinc-950/80 text-white border border-zinc-800 focus:border-red-500 rounded-xl py-2.5 px-4 text-sm outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">All Authors</option>
                {authors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-zinc-500 text-xs">
                ▼
              </div>
            </div>

            {/* Clear Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-all cursor-pointer border border-zinc-700"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            )}

            {/* Layout Toggle Buttons */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800 p-1 rounded-xl">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${layoutMode === 'grid'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                  }`}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${layoutMode === 'list'
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:text-white'
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
