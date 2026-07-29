'use client';

import React from 'react';
import SportsBlogHome from './root';
import type { Post } from './types';

interface SportsBlogHomePageProps {
  initialPosts?: Post[];
}

export default function SportsBlogHomePage({ initialPosts }: SportsBlogHomePageProps) {
  return <SportsBlogHome initialPosts={initialPosts} />;
}
