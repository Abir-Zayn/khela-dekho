import React from 'react';
import SportsBlogHomePage from './features/sports-blog-home/page';
import { API_BASE_URL } from './configs/queryClient';
import type { Post } from './features/sports-blog-home/types';

const PAGE_SIZE = 20;

// Server-rendered prefetch of the first feed page (revalidated every 60s by
// Vercel's data cache) so first paint doesn't wait on a client-side fetch,
// even though the client feed is now fetched directly from the browser.
async function getInitialPosts(): Promise<Post[] | undefined> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/posts?limit=${PAGE_SIZE}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return undefined;
    return await res.json();
  } catch {
    return undefined;
  }
}

export default async function Home() {
  const initialPosts = await getInitialPosts();
  return <SportsBlogHomePage initialPosts={initialPosts} />;
}
