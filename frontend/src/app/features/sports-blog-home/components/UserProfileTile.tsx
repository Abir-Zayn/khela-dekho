'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useClerk } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Settings, HelpCircle, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { AuthUser } from '../../auth/types';

import { Avatar, AvatarImage, AvatarFallback } from '../../../../components/ui/avatar';

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
        className="flex items-center gap-2.5 bg-card hover:bg-muted text-card-foreground border border-border px-3 py-2 rounded-xl transition-all cursor-pointer select-none outline-none group"
      >
        <Avatar key={user?.profile_photo_url || 'trigger-photo'} className="w-7 h-7 border-border group-hover:border-terracotta-primary transition-colors">
          <AvatarImage src={user.profile_photo_url || undefined} alt={displayName} />
          <AvatarFallback className="text-[10px] bg-terracotta-primary text-white">
            {displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold text-sm text-foreground leading-none">
          {displayName}
        </span>
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-card border border-border rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-2 text-card-foreground">
          {/* Profile Header & View Profile Link */}
          <div className="flex items-center gap-3 p-2 bg-muted/60 rounded-xl border border-border">
            <Avatar key={user?.profile_photo_url || 'dropdown-photo'} className="w-9 h-9 shrink-0">
              <AvatarImage src={user.profile_photo_url || undefined} alt={displayName} />
              <AvatarFallback className="text-sm bg-terracotta-primary text-white">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-foreground truncate leading-tight">
                {displayName}
              </p>
              <Link
                href="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="text-[11px] font-semibold text-terracotta-primary hover:underline transition-colors inline-block mt-0.5"
              >
                View Profile &rarr;
              </Link>
            </div>
          </div>

          {/* Navigation Menu Options */}
          <div className="space-y-0.5 border-t border-b border-border py-1.5">
            <Link
              href="/settings"
              onClick={() => setIsDropdownOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
            >
              <Settings size={15} className="text-muted-foreground" />
              <span>Settings</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                toast.info('Help & Support', { description: 'Need assistance? Contact support@kheladekho.com' });
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer text-left"
            >
              <HelpCircle size={15} className="text-muted-foreground" />
              <span>Help</span>
            </button>
          </div>

          {/* Footer: Signout Clickable Text & Masked Email Hash */}
          <div className="pt-1 flex items-center justify-between px-2">
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-bold text-terracotta-primary hover:underline transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              Sign out
            </button>

            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border select-none">
              {maskEmail(user.email)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
