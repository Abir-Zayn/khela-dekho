'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { TriangleAlert, X, Trash2, Loader2 } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText.trim() !== 'DELETE') {
      toast.error('Confirmation Failed', { description: 'Please type DELETE to confirm account removal.' });
      return;
    }

    setIsDeleting(true);
    try {
      toast.error('Delete Account Request Sent', {
        description: 'Please contact support@kheladekho.com to finalize permanent account removal.',
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      toast.error('Delete Failed', { description: msg });
    } finally {
      setIsDeleting(false);
      setConfirmText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-red-900/60 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
            <TriangleAlert size={20} className="text-red-500" />
            <span>Delete Account</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-zinc-300 font-normal leading-relaxed">
              Are you sure you want to permanently delete your account? This action <strong className="text-red-400">cannot be undone</strong> and will erase all your sports articles, comments, and profile data.
            </p>
            <div className="bg-red-950/30 border border-red-900/40 p-3 rounded-xl">
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Type <span className="text-red-400 font-mono font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-zinc-950 text-white border border-zinc-800 focus:border-red-500 rounded-lg py-2 px-3 text-xs outline-none font-mono"
                autoFocus
              />
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
              disabled={confirmText.trim() !== 'DELETE' || isDeleting}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={14} />
                  <span>Delete Permanently</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
