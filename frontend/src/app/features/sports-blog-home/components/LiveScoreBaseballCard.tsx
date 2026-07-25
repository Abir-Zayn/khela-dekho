'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { BaseballMatch } from '../types';

interface LiveScoreBaseballCardProps {
  match: BaseballMatch;
}

export const LiveScoreBaseballCard: React.FC<LiveScoreBaseballCardProps> = ({ match }) => {
  return (
    <Card className="min-w-[260px] max-w-[280px] bg-card border border-border hover:border-terracotta-primary/50 rounded-xl p-3 flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-lg group text-card-foreground">
      {/* Header: League & Status */}
      <div className="flex items-center justify-between text-[11px] mb-2">
        <span className="font-extrabold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
          {match.league || 'MLB'}
        </span>
        {match.isLive ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-terracotta-primary/20 text-terracotta-primary border border-terracotta-primary/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta-primary" />
            LIVE
          </span>
        ) : match.status === 'Final' || match.status === 'FT' ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
            FINAL
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted/80 text-muted-foreground border border-border">
            {match.status || 'SCHEDULED'}
          </span>
        )}
      </div>

      {/* Teams & Score */}
      <div className="space-y-2 py-1">
        {/* Home Team */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate pr-2">
            {match.homeTeam?.badge ? (
              // eslint-disable-next-next/no-img-element
              <img src={match.homeTeam.badge} alt={match.homeTeam.name} className="w-5 h-5 object-contain" />
            ) : (
              <div className="w-5 h-5 bg-terracotta-light/20 text-terracotta-dark border border-terracotta-light/40 rounded-full flex items-center justify-center text-[9px] font-bold">
                {match.homeTeam?.shortName}
              </div>
            )}
            <span className="font-bold text-card-foreground truncate">{match.homeTeam?.name}</span>
          </div>
          <span className="font-black text-sm text-foreground px-1">
            {match.homeScore ?? '-'}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate pr-2">
            {match.awayTeam?.badge ? (
              // eslint-disable-next-next/no-img-element
              <img src={match.awayTeam.badge} alt={match.awayTeam.name} className="w-5 h-5 object-contain" />
            ) : (
              <div className="w-5 h-5 bg-sage-deep/20 text-sage-deep border border-sage-deep/40 rounded-full flex items-center justify-center text-[9px] font-bold">
                {match.awayTeam?.shortName}
              </div>
            )}
            <span className="font-bold text-card-foreground truncate">{match.awayTeam?.name}</span>
          </div>
          <span className="font-black text-sm text-foreground px-1">
            {match.awayScore ?? '-'}
          </span>
        </div>
      </div>

      {/* Footer: Venue & Action */}
      <div className="text-[10px] text-muted-foreground pt-2 border-t border-border flex justify-between items-center">
        <span className="truncate max-w-[170px]">{match.venue || match.date}</span>
        <ChevronRight size={10} className="text-terracotta-primary group-hover:translate-x-0.5 transition-transform shrink-0" />
      </div>
    </Card>
  );
};
