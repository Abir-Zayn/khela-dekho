'use client';

import React, { useState } from 'react';
import { Link as LinkIcon, AlertCircle } from 'lucide-react';

export interface PreviewComponentProps {
  type: 'image' | 'video' | 'reference';
  url: string;
  title?: string;
  className?: string;
}

export function PreviewComponent({
  type,
  url,
  title,
  className = '',
}: PreviewComponentProps) {
  const [hasError, setHasError] = useState(false);

  if (!url || !url.trim()) {
    return (
      <div className={`p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-center text-zinc-500 text-xs ${className}`}>
        Enter a valid {type} URL above to preview content...
      </div>
    );
  }

  const cleanUrl = url.trim();

  // Helper to extract YouTube embed URL
  const getEmbedUrl = (rawUrl: string) => {
    const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    return rawUrl;
  };

  if (type === 'image') {
    return (
      <div className={`overflow-hidden bg-zinc-950 border border-zinc-800 rounded-xl ${className}`}>
        {hasError ? (
          <div className="p-4 text-center text-red-400 text-xs flex items-center justify-center gap-1.5">
            <AlertCircle size={14} /> Failed to load image preview. Check URL.
          </div>
        ) : (
          <div className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cleanUrl}
              alt={title || 'Image Preview'}
              onError={() => setHasError(true)}
              className="w-full max-h-[220px] object-cover rounded-xl"
            />
            {title && (
              <p className="text-[11px] text-zinc-400 text-center py-1.5 italic bg-zinc-900/80 backdrop-blur">
                {title}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (type === 'video') {
    const embedUrl = getEmbedUrl(cleanUrl);
    const isEmbed = embedUrl.includes('youtube.com/embed') || embedUrl.includes('player.vimeo.com');

    return (
      <div className={`overflow-hidden bg-zinc-950 border border-zinc-800 rounded-xl ${className}`}>
        {isEmbed ? (
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              className="w-full h-full border-0 rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video Preview"
            />
          </div>
        ) : (
          <video
            src={cleanUrl}
            controls
            className="w-full max-h-[220px] rounded-xl"
            onError={() => setHasError(true)}
          />
        )}
        {hasError && (
          <div className="p-3 text-center text-red-400 text-xs flex items-center justify-center gap-1.5">
            <AlertCircle size={14} /> Unable to play video. Check URL format.
          </div>
        )}
      </div>
    );
  }

  if (type === 'reference') {
    const displayTitle = title || 'Source Reference Link';
    return (
      <div className={`p-3.5 bg-zinc-950 border-l-4 border-amber-500 border-t border-r border-b border-zinc-800 rounded-r-xl ${className}`}>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
          <LinkIcon size={13} /> {displayTitle}
        </div>
        <a
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-zinc-300 hover:text-white underline truncate block"
        >
          {cleanUrl}
        </a>
      </div>
    );
  }

  return null;
}
