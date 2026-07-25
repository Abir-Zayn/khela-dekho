'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { AlignLeft, X, Check, Loader2 } from 'lucide-react';
import { Textarea } from '../../../../components/ui/textarea';
import { updateUserProfile } from '../actions/update_user_profile';
import type { AuthUser } from '../../auth/types';

interface EditBioModalProps {
  isOpen: boolean;
  initialBio: string;
  onClose: () => void;
  onSuccess: (updatedUser: AuthUser) => void;
}

export function EditBioModal({
  isOpen,
  initialBio,
  onClose,
  onSuccess,
}: EditBioModalProps) {
  const [newBio, setNewBio] = useState(initialBio);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSaveBio = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    try {
      const updatedUser = await updateUserProfile({ bio: newBio.trim() });
      toast.success('Bio updated successfully!');
      onSuccess(updatedUser);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update bio';
      toast.error('Update Error', { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlignLeft size={18} className="text-red-500" />
            <span>Edit Bio</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveBio} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              About You
            </label>
            <Textarea
              rows={4}
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              placeholder="Introduce yourself to the Khela Dekho sports community..."
              maxLength={500}
              autoFocus
            />
            <div className="flex justify-end mt-1 text-[11px] text-zinc-500">
              {newBio.length}/500
            </div>
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
                  <span>Save Bio</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
