'use client';

import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, Heart, Share2, Check } from 'lucide-react';
import { Post } from '../types';
import { getTagColor, getPostGradient, getReadTime, formatDate } from '../utils/postDisplay';
import { PreviewComponent } from '../../create-post/components/preview-component';

interface DetailModalProps {
  post: Post | null;
  onClose: () => void;
}

export function DetailModal({ post, onClose }: DetailModalProps) {
  const [copied, setCopied] = useState(false);
  // Bind Escape key to close the modal (valid usage of useEffect for global browser event)
  useEffect(() => {
    if (!post) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [post, onClose]);

  if (!post) return null;

  const tag = post.category?.name || 'General';
  const tagColor = getTagColor(tag);
  const gradient = getPostGradient(post.id);
  const readTime = getReadTime(post.content);

  const handleShare = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}?post=${post.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
      {/* Blurry Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Content Box */}
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col max-h-[85vh] animate-scale-up">

        {/* Top Header Card Background */}
        <div className={`p-6 sm:p-8 bg-gradient-to-br ${gradient} border-b border-zinc-800 relative`}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-zinc-400 hover:text-white bg-zinc-950/50 hover:bg-zinc-800 p-2 rounded-full border border-zinc-800 transition-all cursor-pointer"
            title="Close modal"
          >
            <X size={20} />
          </button>

          {/* Tag and ID */}
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${tagColor}`}>
              {tag}
            </span>
            {post.tags.map((t) => (
              <span
                key={t.id}
                className="text-xs text-zinc-400 font-bold bg-zinc-950/60 px-2 py-0.5 rounded border border-zinc-800"
              >
                #{t.name}
              </span>
            ))}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight pr-8">
            {post.title}
          </h2>

          {/* Author Details and Date */}
          <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-zinc-300">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-xs border border-zinc-800 text-white uppercase">
                {post.author.charAt(0)}
              </span>
              <span className="font-semibold text-white">{post.author}</span>
            </div>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-zinc-400">
              <Calendar size={15} />
              <span>{formatDate(post.date_posted)}</span>
            </div>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-zinc-400">
              <Clock size={15} />
              <span>{readTime} min read</span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-zinc-300 space-y-6 leading-relaxed">
          {/* Article Content Body Container */}
          <div className="space-y-6">
            {/* Cover Image if present */}
            {post.image_url && (
              <PreviewComponent type="image" url={post.image_url} title={post.title} className="mb-6" />
            )}

            {/* Embedded Playable Video Player inside content body */}
            {post.video_url && (
              <div className="my-6">
                <PreviewComponent type="video" url={post.video_url} title="Post Video Content" />
              </div>
            )}

            {/* Main Rich Text Content Body */}
            {post.content.trim().startsWith('<') ? (
              <div
                className="text-base sm:text-lg leading-relaxed text-zinc-200 prose prose-invert max-w-none [&_img]:rounded-2xl [&_iframe]:rounded-2xl [&_iframe]:w-full [&_iframe]:aspect-video [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:bg-zinc-950/60 [&_blockquote]:p-4 [&_blockquote]:rounded-r-xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line text-zinc-200">
                {post.content}
              </p>
            )}
          </div>

          {/* Reference Source Link if present */}
          {post.reference_url && (
            <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex items-center justify-between gap-4 mt-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                  Post Source Reference
                </span>
                <a
                  href={post.reference_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-zinc-200 hover:text-white underline truncate max-w-md block"
                >
                  {post.reference_url}
                </a>
              </div>
              <a
                href={post.reference_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                Visit Source →
              </a>
            </div>
          )}

          <p className="text-sm text-zinc-400 border-t border-zinc-800/60 pt-6">
            Disclaimer: Opinions expressed in this sports column represent those of the writer and are intended to inspire dialogue within the Khela Dekho community. We encourage readers to join the discussion.
          </p>
        </div>

        {/* Modal Footer Interactive Bar */}
        <div className="bg-zinc-950 px-6 py-4 border-t border-zinc-800 flex items-center justify-between text-zinc-400 text-sm">
          {/* Reaction Counts (read-only until reactions are wired to auth) */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Heart size={16} className="text-red-500" />
              {post.reaction_counts.like}
            </span>
          </div>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
