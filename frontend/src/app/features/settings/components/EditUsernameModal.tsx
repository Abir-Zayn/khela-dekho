'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { AtSign, X, Check, Loader2 } from 'lucide-react';
import { updateUserProfile } from '../actions/update_user_profile';
import type { AuthUser } from '../../auth/types';

interface EditUsernameModalProps {
  isOpen: boolean;
  initialUsername: string;
  onClose: () => void;
  onSuccess: (updatedUser: AuthUser) => void;
}

export function EditUsernameModal({
  isOpen,
  initialUsername,
  onClose,
  onSuccess,
}: EditUsernameModalProps) {
  const [newUsername, setNewUsername] = useState(initialUsername);
  const [isSaving, setIsSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError(null);

    const trimmed = newUsername.trim().replace(/^@/, '');
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(trimmed)) {
      setUsernameError('Username must be 3-30 characters (letters, numbers, underscores only).');
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await updateUserProfile({ username: trimmed });
      toast.success('Username updated successfully!');
      onSuccess(updatedUser);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update username';
      setUsernameError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AtSign size={18} className="text-red-500" />
            <span>Edit Username</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveUsername} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              New Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 font-mono text-sm">
                @
              </span>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => {
                  setNewUsername(e.target.value);
                  setUsernameError(null);
                }}
                placeholder="messi10"
                className="w-full bg-zinc-950 text-white border border-zinc-800 focus:border-red-500 rounded-xl py-2.5 pl-8 pr-4 text-sm outline-none transition-colors font-mono"
                autoFocus
              />
            </div>
            {usernameError ? (
              <p className="text-xs text-red-500 font-medium mt-2 leading-relaxed">
                {usernameError}
              </p>
            ) : (
              <p className="text-[11px] text-zinc-500 mt-1.5">
                3-30 characters. Letters, numbers, and underscores only.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
