'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useClerk } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Settings, HelpCircle, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { AuthUser } from '../../auth/types';

interface UserProfileTileProps {
  user: AuthUser | null;
}

function maskEmail(email: string | undefined): string {
  if (!email) return '***@***';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  if (local.length <= 2) {
    return `${local[0] || '*'}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export function UserProfileTile({ user }: UserProfileTileProps) {
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer text-sm"
      >
        <UserIcon size={16} />
        <span>Log In</span>
      </Link>
    );
  }

  const displayName = user.full_name || user.username;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
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
            {displayName.charAt(0)}
          </span>
        )}
        <span className="font-semibold text-sm text-white leading-none">
          {displayName}
        </span>
        <ChevronDown
          size={14}
          className={`text-zinc-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-2">
          {/* Profile Header & View Profile Link */}
          <div className="flex items-center gap-3 p-2 bg-zinc-950/70 rounded-xl border border-zinc-800/80">
            {user.profile_photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profile_photo_url}
                alt={user.username}
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover border border-zinc-700 shrink-0"
              />
            ) : (
              <span className="w-9 h-9 rounded-full bg-red-600 border border-red-500 flex items-center justify-center font-bold text-sm text-white uppercase shrink-0">
                {displayName.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-white truncate leading-tight">
                {displayName}
              </p>
              <Link
                href="/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="text-[11px] font-semibold text-red-500 hover:text-red-400 transition-colors inline-block mt-0.5"
              >
                View Profile &rarr;
              </Link>
            </div>
          </div>

          {/* Navigation Menu Options */}
          <div className="space-y-0.5 border-t border-b border-zinc-800/80 py-1.5">
            <Link
              href="/settings"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors cursor-pointer"
            >
              <Settings size={15} className="text-zinc-400" />
              <span>Settings</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                toast.info('Help & Support', { description: 'Need assistance? Contact support@kheladekho.com' });
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors cursor-pointer text-left"
            >
              <HelpCircle size={15} className="text-zinc-400" />
              <span>Help</span>
            </button>
          </div>

          {/* Footer: Signout Clickable Text & Masked Email Hash */}
          <div className="pt-1 flex items-center justify-between px-2">
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              Sign out
            </button>

            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800/60 select-none">
              {maskEmail(user.email)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
