'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Flame, ArrowLeft, Send, Loader2, Check, CloudOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentUser } from '../auth';
import { LexicalEditor } from './components/LexicalEditor';
import { CategoryTagsTile } from './components/CategoryTagsTile';
import { createDraftAction } from './actions/create_draft_action';
import { saveDraftAction } from './actions/save_draft_action';
import { publishDraftAction } from './actions/publish_draft_action';
import { listCategories } from './actions/list_categories';
import { listTags } from './actions/list_tags';
import type { Category, Tag, LocalDraftSnapshot } from './types';

// Layer 1 (offline-proof) local autosave key. One in-progress composer per browser.
const DRAFT_STORAGE_KEY = 'kd:createpost:draft';
const LOCAL_DEBOUNCE_MS = 600;    // write to browser storage quickly
const SERVER_DEBOUNCE_MS = 2500;  // sync to backend after typing settles

// Used as the cover when a story is published without any inserted image.
const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'error';

// Lexical emits '<p></p>' for an empty document.
function isEmptyContent(html: string): boolean {
  const stripped = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
  return stripped.length === 0;
}

export default function CreatePostRoot() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Cover image is derived, not a field (see coverImage below).

  // --- Draft / autosave state ---------------------------------------------
  const [draftId, setDraftId] = useState<string | null>(null);
  const [initialHtml, setInitialHtml] = useState<string | undefined>(undefined);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const restoredRef = useRef(false);              // local restore attempted?
  const serverUpdatedAtRef = useRef<string | null>(null); // last known server updated_at
  const lastSyncedRef = useRef<string>('');       // serialized snapshot last synced
  const localTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const creatingRef = useRef(false);              // guard: draft creation in flight
  const savingRef = useRef(false);                // guard: save in flight

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getCurrentUser(),
  });

  useEffect(() => {
    listCategories().then(setCategories);
    listTags().then(setAvailableTags);
  }, []);

  // Extract all image URLs inserted into content HTML automatically
  const detectedArticleImages = useMemo(() => {
    if (!contentHtml) return [];
    const matches: string[] = [];
    const regex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = regex.exec(contentHtml)) !== null) {
      if (match[1] && !matches.includes(match[1])) {
        matches.push(match[1]);
      }
    }
    return matches;
  }, [contentHtml]);

  // Cover image is always the first image inserted into the story (or null while
  // none exists). The default is only applied at publish time.
  const coverImage = detectedArticleImages[0] ?? null;

  const handleAddTag = (tagName: string) => {
    const trimmed = tagName.trim().replace(/^#/, '');
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  // --- Snapshot helpers ----------------------------------------------------
  const buildSnapshot = useCallback(
    (): LocalDraftSnapshot => ({
      draftId,
      title,
      contentHtml,
      selectedCategoryId,
      selectedTags,
      savedAt: new Date().toISOString(),
      serverUpdatedAt: serverUpdatedAtRef.current,
    }),
    [draftId, title, contentHtml, selectedCategoryId, selectedTags],
  );

  const writeLocal = useCallback(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(buildSnapshot()));
    } catch {
      // storage full / unavailable — server layer still covers durability
    }
  }, [buildSnapshot]);

  // --- LAYER 1: restore local draft on mount (offline-proof recovery) -------
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return;
      const snap = JSON.parse(raw) as LocalDraftSnapshot;
      const hasContent = (snap.title && snap.title.trim()) || !isEmptyContent(snap.contentHtml || '');
      if (!hasContent) return;

      setDraftId(snap.draftId);
      // Legacy drafts may hold a >100-char title; keep state within the limit.
      setTitle((snap.title || '').slice(0, 100));
      setContentHtml(snap.contentHtml || '');
      setInitialHtml(snap.contentHtml || undefined);
      setSelectedCategoryId(snap.selectedCategoryId || '');
      setSelectedTags(snap.selectedTags || []);
      serverUpdatedAtRef.current = snap.serverUpdatedAt;
      lastSyncedRef.current = ''; // force a resync so the server gets the restored copy

      toast.success('Draft restored', {
        description: 'We recovered your unsaved work from this device.',
      });
    } catch {
      // corrupt snapshot — ignore
    }
  }, []);

  // --- LAYER 1: debounced local write on every change -----------------------
  useEffect(() => {
    if (!restoredRef.current) return;
    if (localTimer.current) clearTimeout(localTimer.current);
    localTimer.current = setTimeout(writeLocal, LOCAL_DEBOUNCE_MS);
    return () => {
      if (localTimer.current) clearTimeout(localTimer.current);
    };
  }, [title, contentHtml, selectedCategoryId, selectedTags, writeLocal]);

  // Flush local immediately before the tab dies (crash/close/navigate away).
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') writeLocal();
    };
    window.addEventListener('beforeunload', writeLocal);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('beforeunload', writeLocal);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [writeLocal]);

  // --- LAYER 2: sync draft to the backend ----------------------------------
  const syncToServer = useCallback(async () => {
    if (!user) return; // only authenticated users get a server draft
    const meaningful = title.trim().length > 0 || !isEmptyContent(contentHtml);
    if (!meaningful) return;

    const serialized = JSON.stringify({
      title,
      contentHtml,
      selectedCategoryId,
      selectedTags,
      coverImage,
    });
    if (serialized === lastSyncedRef.current) return; // nothing changed since last sync

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSaveStatus('offline');
      return; // local layer already holds the data; retry on 'online'
    }
    if (savingRef.current) return;

    savingRef.current = true;
    setSaveStatus('saving');
    try {
      let id = draftId;
      if (!id) {
        if (creatingRef.current) return;
        creatingRef.current = true;
        const created = await createDraftAction();
        id = created.id;
        setDraftId(id);
        serverUpdatedAtRef.current = created.updated_at;
        creatingRef.current = false;
      }

      const ack = await saveDraftAction(id, {
        title: title.trim().slice(0, 100) || null,
        content: isEmptyContent(contentHtml) ? null : contentHtml,
        category_id: selectedCategoryId || null,
        tags: selectedTags,
        // Draft stores the first inserted image (or null); default is applied at publish.
        image_url: coverImage,
        video_url: null,
        reference_url: null,
        client_updated_at: serverUpdatedAtRef.current,
      });
      serverUpdatedAtRef.current = ack.updated_at;
      lastSyncedRef.current = serialized;
      setSaveStatus('saved');
    } catch (err) {
      creatingRef.current = false;
      setSaveStatus('error');
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('modified elsewhere')) {
        toast.error('Draft conflict', { description: msg });
      }
    } finally {
      savingRef.current = false;
    }
  }, [user, title, contentHtml, selectedCategoryId, selectedTags, coverImage, draftId]);

  // Debounced server sync on change.
  useEffect(() => {
    if (!restoredRef.current) return;
    if (serverTimer.current) clearTimeout(serverTimer.current);
    serverTimer.current = setTimeout(() => {
      void syncToServer();
    }, SERVER_DEBOUNCE_MS);
    return () => {
      if (serverTimer.current) clearTimeout(serverTimer.current);
    };
  }, [syncToServer]);

  // Retry the server sync when connectivity returns; mark offline when it drops.
  useEffect(() => {
    const onOnline = () => void syncToServer();
    const onOffline = () => setSaveStatus('offline');
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [syncToServer]);

  // Publish: ensure the draft is saved server-side, then promote it.
  const handlePublishDirect = async () => {
    if (!user) {
      toast.error('Authentication Required', {
        description: 'You must log in to publish your post.',
      });
      router.push('/login?redirect=/create-post');
      return;
    }
    if (!title.trim()) {
      toast.error('Title required', {
        description: 'Please enter a story title before publishing.',
      });
      return;
    }
    if (title.trim().length < 10) {
      toast.error('Title too short', {
        description: 'Your title needs at least 10 characters.',
      });
      return;
    }
    if (!selectedCategoryId) {
      toast.error('Category required', {
        description: 'Please select a category in Story Settings before publishing.',
      });
      return;
    }
    if (!contentHtml.trim() || contentHtml === '<p></p>' || isEmptyContent(contentHtml)) {
      toast.error('Story is empty', {
        description: 'Please write your story content before publishing.',
      });
      return;
    }

    try {
      setIsPublishing(true);

      // Cover = first image inserted into the story, or the default if none.
      const finalCoverImage = coverImage ?? DEFAULT_COVER_IMAGE;

      // Ensure a server draft exists and holds the latest content.
      let id = draftId;
      if (!id) {
        const created = await createDraftAction();
        id = created.id;
        setDraftId(id);
        serverUpdatedAtRef.current = created.updated_at;
      }
      const saveAck = await saveDraftAction(id, {
        title: title.trim().slice(0, 100),
        content: contentHtml,
        category_id: selectedCategoryId,
        tags: selectedTags,
        image_url: finalCoverImage,
        video_url: null,
        reference_url: null,
        client_updated_at: serverUpdatedAtRef.current,
      });
      serverUpdatedAtRef.current = saveAck.updated_at;

      await publishDraftAction(id);

      // Draft is now a published post — clear the local recovery copy.
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        /* ignore */
      }

      setIsPublishing(false);
      toast.success('Story Published Successfully!');
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      setIsPublishing(false);
      const message = err instanceof Error ? err.message : 'Failed to publish post. Please try again.';
      toast.error('Could not publish', { description: message });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-red-500 selection:text-white font-sans antialiased">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-900 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Draft Info */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Back to feed"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="flex items-center gap-2">
              <div className="bg-red-600 p-1.5 rounded-lg">
                <Flame size={18} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                  Draft in {user?.full_name || user?.username || 'Khela Dekho'}
                </span>
                <SaveIndicator status={saveStatus} />
              </div>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handlePublishDirect}
              disabled={isPublishing}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full transition-all shadow-md shadow-red-950/40 flex items-center gap-2 cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Send size={14} /> Publish Story
                </>
              )}
            </button>

            {user && (
              <div className="flex items-center gap-2">
                {user.profile_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profile_photo_url}
                    alt={user.username}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-white uppercase">
                    {(user.full_name || user.username).charAt(0)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Medium Writing Canvas */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Story Title Input */}
        <div className="mb-6">
          <textarea
            placeholder="Title"
            value={title}
            maxLength={100}
            onChange={(e) => {
              setTitle(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            rows={1}
            className="w-full text-4xl sm:text-5xl font-black placeholder:text-zinc-700 bg-transparent text-white border-none outline-none tracking-tight resize-none overflow-hidden font-serif"
          />
        </div>

        {/* Collapsible Story Settings & Metadata Tile Component */}
        <CategoryTagsTile
          categories={categories}
          availableTags={availableTags}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(catId) => {
            setSelectedCategoryId(catId);
          }}
          selectedTags={selectedTags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          detectedArticleImages={detectedArticleImages}
        />

        {/* Lexical Rich Text Editor */}
        <LexicalEditor
          onChange={setContentHtml}
          placeholder="Tell your story..."
          initialHtml={initialHtml}
        />
      </main>
    </div>
  );
}

// Small autosave status line under the "Draft in …" label.
function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null;

  const map: Record<Exclude<SaveStatus, 'idle'>, { icon: React.ReactNode; text: string; className: string }> = {
    saving: { icon: <Loader2 size={11} className="animate-spin" />, text: 'Saving…', className: 'text-zinc-500' },
    saved: { icon: <Check size={11} />, text: 'Saved', className: 'text-emerald-500' },
    offline: { icon: <CloudOff size={11} />, text: 'Offline — saved on device', className: 'text-amber-500' },
    error: { icon: <AlertCircle size={11} />, text: 'Save failed', className: 'text-red-500' },
  };
  const s = map[status];

  return (
    <span className={`flex items-center gap-1 text-[10px] font-semibold ${s.className}`}>
      {s.icon} {s.text}
    </span>
  );
}
