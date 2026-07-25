'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { ChevronRight, Trash2, Camera, Loader2, Sun, Moon, Monitor } from 'lucide-react';
import { ProfileListTile } from './ProfileListTile';
import { EditUsernameModal } from './EditUsernameModal';
import { EditBioModal } from './EditBioModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../components/ui/avatar';
import { Toggle } from '../../../../components/ui/toggle';
import { uploadAvatarDirectly } from '../actions/update_user_profile';
import type { AuthUser } from '../../auth/types';

interface AccountTabProps {
  user: AuthUser | null;
}

export function AccountTab({ user: initialUser }: AccountTabProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Optimistic local user state
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  // Composite UI State
  const [accountState, setAccountState] = useState({
    isUsernameModalOpen: false,
    isBioModalOpen: false,
    isDeleteModalOpen: false,
    isUploadingPhoto: false,
  });

  const setModalState = (key: keyof typeof accountState, value: boolean) => {
    setAccountState((prev) => ({ ...prev, [key]: value }));
  };

  const username = user?.username ? `@${user.username}` : '@anonymous';
  const fullName = user?.full_name || user?.username || 'Sports Fan';
  const bio = user?.bio || 'No bio written yet. Click edit to introduce yourself to the Khela Dekho community!';

  const currentTheme = mounted ? theme || 'system' : 'system';

  // Helper to sync updated user across React Query and local state
  const applyUserUpdate = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    queryClient.setQueryData(['currentUser'], updatedUser);
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  };

  // Handle Profile Photo File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', { description: 'Profile picture must be less than 5 MB.' });
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Invalid format', { description: 'Please select a JPG, PNG, or WebP image.' });
      return;
    }

    setModalState('isUploadingPhoto', true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload directly through backend endpoint to prevent browser S3 CORS errors
      const updatedUser = await uploadAvatarDirectly(formData);
      applyUserUpdate(updatedUser);
      toast.success('Profile photo updated successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Photo upload failed';
      toast.error('Upload Error', { description: msg });
    } finally {
      setModalState('isUploadingPhoto', false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 1. Username Tile */}
      <ProfileListTile
        title="Username"
        description="Edit your @username"
        onClick={() => setModalState('isUsernameModalOpen', true)}
        value={
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground bg-muted border border-border px-3.5 py-1.5 rounded-xl font-mono">
              {username}
            </span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        }
      />

      <div className="border-t border-border" />

      {/* 2. Profile Photo Tile */}
      <ProfileListTile
        title="Profile photo"
        description="Edit your profile photo (JPG, PNG, WebP — max 5MB)"
        onClick={() => fileInputRef.current?.click()}
        value={
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
              {fullName}
            </span>
            <div className="relative group">
              <Avatar key={user?.profile_photo_url || 'photo'} className="w-11 h-11 border-border group-hover:border-terracotta-primary transition-colors">
                <AvatarImage src={user?.profile_photo_url || undefined} alt={fullName} />
                <AvatarFallback className="text-sm bg-terracotta-primary text-white">
                  {fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {accountState.isUploadingPhoto ? (
                  <Loader2 size={16} className="text-white animate-spin" />
                ) : (
                  <Camera size={16} className="text-white" />
                )}
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        }
      />

      <div className="border-t border-border" />

      {/* 3. Bio Tile */}
      <ProfileListTile
        title="Bio"
        description="Edit your bio"
        onClick={() => setModalState('isBioModalOpen', true)}
        value={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-terracotta-primary hover:underline">
              Edit
            </span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        }
      >
        <p className="text-xs text-foreground font-normal leading-relaxed italic bg-muted/60 p-3 rounded-xl border border-border">
          &ldquo;{bio}&rdquo;
        </p>
      </ProfileListTile>

      <div className="border-t border-border" />

      {/* 4. Blocked Users Tile */}
      <ProfileListTile
        title="Blocked Users"
        description="Edit the list of users you have blocked"
        onClick={() => {
          toast.info('Blocked Users', { description: 'You have no blocked users on your account.' });
        }}
        value={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-xl">
              0 blocked
            </span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        }
      />

      <div className="border-t border-border" />

      {/* 5. Theme Switching Tile */}
      <ProfileListTile
        title="Theme Preference"
        description="Choose default System, Dark mode, or Day (Light) mode"
        value={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-xl">
              <Toggle
                pressed={currentTheme === 'system'}
                onPressedChange={(pressed) => {
                  if (pressed) {
                    setTheme('system');
                    toast.success('System theme active');
                  }
                }}
                className={currentTheme === 'system' ? 'bg-muted text-foreground border-border' : ''}
              >
                <Monitor size={14} className={currentTheme === 'system' ? 'text-terracotta-primary' : ''} />
                <span>System</span>
              </Toggle>

              <Toggle
                pressed={currentTheme === 'dark'}
                onPressedChange={(pressed) => {
                  if (pressed) {
                    setTheme('dark');
                    toast.success('Dark theme active');
                  }
                }}
                className={currentTheme === 'dark' ? 'bg-muted text-foreground border-border' : ''}
              >
                <Moon size={14} className={currentTheme === 'dark' ? 'text-terracotta-primary' : ''} />
                <span>Dark</span>
              </Toggle>

              <Toggle
                pressed={currentTheme === 'light'}
                onPressedChange={(pressed) => {
                  if (pressed) {
                    setTheme('light');
                    toast.success('Day theme active');
                  }
                }}
                className={currentTheme === 'light' ? 'bg-amber-500/20 text-amber-500 border-amber-500/40' : ''}
              >
                <Sun size={14} className={currentTheme === 'light' ? 'text-amber-500' : ''} />
                <span>Day</span>
              </Toggle>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        }
      />



      <div className="border-t border-zinc-900" />

      {/* 6. Delete Account Tile */}
      <ProfileListTile
        title="Delete Account"
        description="Permanently delete your account"
        isDanger
        onClick={() => setModalState('isDeleteModalOpen', true)}
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

      {/* Modular Modals */}
      <EditUsernameModal
        isOpen={accountState.isUsernameModalOpen}
        initialUsername={user?.username || ''}
        onClose={() => setModalState('isUsernameModalOpen', false)}
        onSuccess={applyUserUpdate}
      />

      <EditBioModal
        isOpen={accountState.isBioModalOpen}
        initialBio={user?.bio || ''}
        onClose={() => setModalState('isBioModalOpen', false)}
        onSuccess={applyUserUpdate}
      />

      <DeleteAccountModal
        isOpen={accountState.isDeleteModalOpen}
        onClose={() => setModalState('isDeleteModalOpen', false)}
      />
    </div>
  );
}

