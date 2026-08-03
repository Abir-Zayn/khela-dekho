import { Heart, Flame, Smile } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/src/components/ui/avatar';
import { formatRelativeTime } from '../utils/format_relative_time';
import type { ReactionEntry } from '../types';

const REACTION_ICON = {
  like: { Icon: Heart, className: 'text-red-500 fill-red-500' },
  love: { Icon: Flame, className: 'text-pink-500 fill-pink-500' },
  laugh: { Icon: Smile, className: 'text-amber-500 fill-amber-500' },
} as const;

export interface ReactorRowProps {
  entry: ReactionEntry;
}

export function ReactorRow({ entry }: ReactorRowProps) {
  const { user, reaction_type, reacted_at } = entry;
  const { Icon, className } = REACTION_ICON[reaction_type];

  return (
    <div className="flex items-center gap-3 py-2.5">
      <Avatar className="h-9 w-9">
        <AvatarImage src={user.profile_photo_url ?? undefined} alt={user.username} />
        <AvatarFallback>{user.username.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {user.full_name || user.username}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          @{user.username} &middot; {formatRelativeTime(reacted_at)}
        </p>
      </div>
      <Icon size={16} className={className} />
    </div>
  );
}
