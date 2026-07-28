'use client';

import React from 'react';
import { ExternalLink, Tag as TagIcon } from 'lucide-react';
import { Post, Tag } from '@/src/app/features/sports-blog-home/types';
import { PreviewComponent } from '@/src/app/features/create-post/components/preview-component';

export interface PostArticleContentProps {
  post: Post;
  gradient: string;
}

// Removes the first inserted image from the article body HTML if it matches
// or is used as the cover image (preventing the cover image from printing twice).
function sanitizeBodyHtml(html: string, coverImageUrl: string | null): string {
  if (!html) return html;

  let cleaned = html;

  // 1. Remove the first inserted image if it matches the cover image
  if (coverImageUrl) {
    const targetUrl = coverImageUrl.trim().toLowerCase();
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
    const match = imgRegex.exec(cleaned);

    if (match && match[1]) {
      const matchedSrc = match[1].trim().toLowerCase();
      if (matchedSrc === targetUrl || targetUrl.includes(matchedSrc) || matchedSrc.includes(targetUrl)) {
        const pWrappedRegex = new RegExp(
          `<p(?:\\s+[^>]*)?>\\s*${match[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*<\\/p>`,
          'i'
        );
        if (pWrappedRegex.test(cleaned)) {
          cleaned = cleaned.replace(pWrappedRegex, '');
        } else {
          cleaned = cleaned.replace(match[0], '');
        }
      }
    }
  }

  // 2. Strip legacy hardcoded text-white/text-zinc classes so body text resolves to theme text color
  cleaned = cleaned
    .replace(/\btext-white\b/gi, '')
    .replace(/\btext-zinc-[12345]00\b/gi, '')
    .replace(/\bbg-zinc-900(?:\/\d+)?\b/gi, '');

  return cleaned;
}

export function PostArticleContent({ post, gradient }: PostArticleContentProps) {
  const tags: Tag[] = post.tags || [];
  const sanitizedContent = sanitizeBodyHtml(post.content, post.image_url);

  return (
    <section>
      {/* Hero Cover Image */}
      {post.image_url ? (
        <div className="mb-10 rounded-3xl overflow-hidden border border-border shadow-xl bg-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full max-h-[480px] object-cover"
          />
        </div>
      ) : (
        <div className={`mb-10 h-48 rounded-3xl bg-gradient-to-br ${gradient} border border-border flex items-center justify-center p-6 relative overflow-hidden`}>
          <span className="text-5xl font-black italic tracking-tighter text-foreground/20 select-none">
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
      <article className="mb-12">
        {sanitizedContent.trim().startsWith('<') ? (
          <div
            className="text-base sm:text-lg leading-relaxed text-foreground prose prose-zinc dark:prose-invert max-w-none [&_h1]:text-foreground [&_h1]:text-2xl [&_h2]:text-foreground [&_h2]:text-xl [&_h3]:text-foreground [&_h3]:text-lg [&_p]:text-foreground [&_p]:leading-relaxed [&_li]:text-foreground [&_span]:text-foreground [&_strong]:text-foreground [&_b]:text-foreground [&_em]:text-foreground [&_img]:rounded-2xl [&_iframe]:rounded-2xl [&_iframe]:w-full [&_iframe]:aspect-video [&_blockquote]:border-l-4 [&_blockquote]:border-terracotta-primary [&_blockquote]:bg-muted/60 [&_blockquote]:p-4 [&_blockquote]:rounded-r-xl"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        ) : (
          <div className="whitespace-pre-line text-foreground text-base sm:text-lg leading-relaxed">
            {sanitizedContent}
          </div>
        )}
      </article>


      {/* Source Reference Link Card */}
      {post.reference_url && (
        <div className="mb-10 p-5 bg-card border border-border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-1">
              Source Reference
            </span>
            <a
              href={post.reference_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-foreground hover:text-terracotta-primary underline truncate max-w-md block"
            >
              {post.reference_url}
            </a>
          </div>
          <a
            href={post.reference_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            <span>Visit Link</span>
            <ExternalLink size={13} />
          </a>
        </div>
      )}

      {/* Related Topics Section Footer */}
      {tags.length > 0 && (
        <div className="pt-6 border-t border-border mb-8">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TagIcon size={14} className="text-muted-foreground" />
            <span>Related Topics</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((t: Tag) => (
              <span
                key={t.id || t.name}
                className="text-xs text-foreground bg-card hover:bg-muted px-3 py-1.5 rounded-lg border border-border transition-colors cursor-default"
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

