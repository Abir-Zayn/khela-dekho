'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronRight, Trash2, Camera, Loader2 } from 'lucide-react';
import { ProfileListTile } from './ProfileListTile';
import { EditUsernameModal } from './EditUsernameModal';
import { EditBioModal } from './EditBioModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { Avatar, AvatarImage, AvatarFallback } from '../../../../components/ui/avatar';
import { uploadAvatarDirectly } from '../actions/update_user_profile';
import type { AuthUser } from '../../auth/types';

interface AccountTabProps {
  user: AuthUser | null;
}

export function AccountTab({ user: initialUser }: AccountTabProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        description="Edit your profile photo (JPG, PNG, WebP — max 5MB)"
        onClick={() => fileInputRef.current?.click()}
        value={
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-400 hidden sm:inline">
              {fullName}
            </span>
            <div className="relative group">
              <Avatar key={user?.profile_photo_url || 'photo'} className="w-11 h-11 border-zinc-700 group-hover:border-red-500 transition-colors">
                <AvatarImage src={user?.profile_photo_url || undefined} alt={fullName} />
                <AvatarFallback className="text-sm bg-red-600">
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
            <ChevronRight size={16} className="text-zinc-500" />
          </div>
        }
      />

      <div className="border-t border-zinc-900" />

      {/* 3. Bio Tile */}
      <ProfileListTile
        title="Bio"
        description="Edit your bio"
        onClick={() => setModalState('isBioModalOpen', true)}
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
        onClick={() => {
          toast.info('Blocked Users', { description: 'You have no blocked users on your account.' });
        }}
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
