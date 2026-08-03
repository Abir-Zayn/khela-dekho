'use client';

import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { getPostReactions } from '../actions/get_post_reactions';
import { ReactionFilterTabs } from './ReactionFilterTabs';
import { ReactorRow } from './ReactorRow';
import type { ReactionCounts, ReactionFilter } from '../types';

const PAGE_SIZE = 10;

export interface ReactorsModalProps {
  postId: string;
  reactionCounts: ReactionCounts;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFilter?: ReactionFilter;
}

// Note: pass a `key` that changes with `defaultFilter` from the caller (see
// post-reactions-bar.tsx) so opening the modal from a different reaction's
// count starts on that tab instead of reusing a stale mounted instance.
export function ReactorsModal({
  postId,
  reactionCounts,
  open,
  onOpenChange,
  defaultFilter = 'all',
}: ReactorsModalProps) {
  const [filter, setFilter] = useState<ReactionFilter>(defaultFilter);

  // queryKey includes `filter`, so switching tabs starts a fresh, independently
  // paginated cache entry instead of requiring any manual reset.
  const { data, isLoading, isFetching, isError, error, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['post-reactions', postId, filter],
    queryFn: ({ pageParam }) =>
      getPostReactions(postId, { type: filter, limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.reactions.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled: open,
  });

  useEffect(() => {
    if (isError) {
      console.error('[ReactorsModal] failed to load reactions for postId:', postId, 'filter:', filter, 'error:', error);
    }
  }, [isError, error, postId, filter]);

  const items = data?.pages.flatMap((p) => p.reactions) ?? [];
  const totalReactions = reactionCounts.like + reactionCounts.love + reactionCounts.laugh;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-md flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={16} className="text-muted-foreground" />
            Reactions
            <span className="font-normal text-muted-foreground">&middot; {totalReactions}</span>
          </DialogTitle>
          <DialogDescription>Who has reacted to this story.</DialogDescription>
        </DialogHeader>

        <ReactionFilterTabs value={filter} onChange={setFilter} counts={reactionCounts} />

        <div className="-mx-6 mt-1 flex-1 space-y-1 overflow-y-auto px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : isError ? (
            <p className="py-10 text-center text-sm text-destructive">
              Couldn&apos;t load reactions. Try again.
            </p>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No reactions yet — be the first to react!
            </p>
          ) : (
            items.map((entry) => (
              <ReactorRow key={`${entry.user.id}-${entry.reaction_type}`} entry={entry} />
            ))
          )}
        </div>

        {hasNextPage && (
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            disabled={isFetching}
            onClick={() => fetchNextPage()}
          >
            {isFetching ? <Loader2 size={14} className="animate-spin" /> : 'Load more'}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
