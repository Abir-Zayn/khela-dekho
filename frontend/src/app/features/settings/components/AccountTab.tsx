'use client';

import React from 'react';
import { toast } from 'sonner';
import { ChevronRight, Trash2, ShieldAlert, Camera } from 'lucide-react';
import { ProfileListTile } from './ProfileListTile';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../components/ui/avatar';
import type { AuthUser } from '../../auth/types';

interface AccountTabProps {
  user: AuthUser | null;
}

export function AccountTab({ user }: AccountTabProps) {
  const username = user?.username ? `@${user.username}` : '@anonymous';
  const fullName = user?.full_name || user?.username || 'Sports Fan';
  const bio = user?.bio || 'No bio written yet. Click edit to introduce yourself to the Khela Dekho community!';

  const handleEditNotice = (featureName: string) => {
    toast.info(`Edit ${featureName}`, {
      description: `${featureName} editing modal will be available in the upcoming profile update.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Username Tile */}
      <ProfileListTile
        title="Username"
        description="Edit your @username"
        onClick={() => handleEditNotice('Username')}
        value={
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-300 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-xl font-mono">
              {username}
            </span>
            <ChevronRight size={16} className="text-zinc-500" />
          </div>
        }
      />

      <div className="border-t border-zinc-900" />

      {/* 2. Profile Photo Tile */}
      <ProfileListTile
        title="Profile photo"
        description="Edit your profile photo"
        onClick={() => handleEditNotice('Profile Photo')}
        value={
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-400 hidden sm:inline">
              {fullName}
            </span>
            <div className="relative group">
              <Avatar className="w-11 h-11 border-zinc-700 group-hover:border-red-500 transition-colors">
                <AvatarImage src={user?.profile_photo_url || undefined} alt={fullName} />
                <AvatarFallback className="text-sm bg-red-600">
                  {fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Camera size={14} className="text-white" />
              </div>
            </div>
            <ChevronRight size={16} className="text-zinc-500" />
          </div>
        }
      />

      <div className="border-t border-zinc-900" />

      {/* 3. Bio Tile */}
      <ProfileListTile
        title="Bio"
        description="Edit your bio"
        onClick={() => handleEditNotice('Bio')}
        value={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-red-500 hover:text-red-400">
              Edit
            </span>
            <ChevronRight size={16} className="text-zinc-500" />
          </div>
        }
      >
        <p className="text-xs text-zinc-300 font-normal leading-relaxed italic bg-zinc-900/50 p-3 rounded-xl border border-zinc-900">
          &ldquo;{bio}&rdquo;
        </p>
      </ProfileListTile>

      <div className="border-t border-zinc-900" />

      {/* 4. Blocked Users Tile */}
      <ProfileListTile
        title="Blocked Users"
        description="Edit the list of users you have blocked"
        onClick={() => handleEditNotice('Blocked Users')}
        value={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
              0 blocked
            </span>
            <ChevronRight size={16} className="text-zinc-500" />
          </div>
        }
      />

      <div className="border-t border-zinc-900" />

      {/* 5. Delete Account Tile */}
      <ProfileListTile
        title="Delete Account"
        description="Permanently delete your account"
        isDanger
        onClick={() => {
          toast.error('Delete Account', {
            description: 'Please contact support to permanently remove your account and data.',
          });
        }}
        value={
          <button
            type="button"
            className="flex items-center gap-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/60 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Delete Account</span>
          </button>
        }
      />
    </div>
  );
}
