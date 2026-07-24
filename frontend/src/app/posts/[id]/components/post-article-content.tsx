'use client';

import React from 'react';
import { ExternalLink, Tag as TagIcon } from 'lucide-react';
import { Post, Tag } from '@/src/app/features/sports-blog-home/types';
import { PreviewComponent } from '@/src/app/features/create-post/components/preview-component';

export interface PostArticleContentProps {
  post: Post;
  gradient: string;
}

export function PostArticleContent({ post, gradient }: PostArticleContentProps) {
  const tags: Tag[] = post.tags || [];

  return (
    <section>
      {/* Hero Cover Image */}
      {post.image_url ? (
        <div className="mb-10 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full max-h-[480px] object-cover"
          />
        </div>
      ) : (
        <div className={`mb-10 h-48 rounded-3xl bg-gradient-to-br ${gradient} border border-zinc-800 flex items-center justify-center p-6 relative overflow-hidden`}>
          <span className="text-5xl font-black italic tracking-tighter text-white/20 select-none">
            KHELA DEKHO
          </span>
        </div>
      )}

      {/* Video Embed if present */}
      {post.video_url && (
        <div className="mb-10">
          <PreviewComponent type="video" url={post.video_url} title="Article Video Stream" />
        </div>
      )}

      {/* Article Body Content */}
      <article className="prose prose-invert max-w-none mb-12 text-zinc-200 text-base sm:text-lg leading-relaxed space-y-6">
        {post.content.trim().startsWith('<') ? (
          <div
            className="text-base sm:text-lg leading-relaxed text-zinc-200 prose prose-invert max-w-none [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_p]:leading-relaxed [&_img]:rounded-2xl [&_iframe]:rounded-2xl [&_iframe]:w-full [&_iframe]:aspect-video [&_blockquote]:border-l-4 [&_blockquote]:border-red-500 [&_blockquote]:bg-zinc-900/60 [&_blockquote]:p-4 [&_blockquote]:rounded-r-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <div className="whitespace-pre-line text-zinc-200 leading-relaxed">
            {post.content}
          </div>
        )}
      </article>

      {/* Source Reference Link Card */}
      {post.reference_url && (
        <div className="mb-10 p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Source Reference
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
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            <span>Visit Link</span>
            <ExternalLink size={13} />
          </a>
        </div>
      )}

      {/* Related Topics Section Footer */}
      {tags.length > 0 && (
        <div className="pt-6 border-t border-zinc-900 mb-8">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TagIcon size={14} className="text-zinc-500" />
            <span>Related Topics</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((t: Tag) => (
              <span
                key={t.id || t.name}
                className="text-xs text-zinc-300 bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-800 transition-colors"
              >
                #{t.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
