'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { FootballMatch } from '../types';

interface LiveScoreFootballCardProps {
  match: FootballMatch;
}

export const LiveScoreFootballCard: React.FC<LiveScoreFootballCardProps> = ({ match }) => {
  return (
    <Card className="min-w-[250px] max-w-[270px] bg-card border border-border hover:border-terracotta-primary/50 rounded-xl p-3 flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-lg group text-card-foreground">
      {/* Top: Competition & Status */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
        <span className="font-semibold truncate max-w-[140px]">
          {match.competition?.name || 'Football'}
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-foreground border border-border">
          {match.status === 'IN_PLAY' ? `${match.minute}' LIVE` : match.status === 'FINISHED' ? 'FT' : 'TIMED'}
        </span>
      </div>

      {/* Middle: Teams & Scores */}
      <div className="space-y-2 py-1">
        {/* Home Team */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate pr-2">
            {match.homeTeam?.crest && (
              // eslint-disable-next-next/no-img-element
              <img src={match.homeTeam.crest} alt={match.homeTeam.shortName} className="w-4 h-4 object-contain" />
            )}
            <span className="font-bold text-card-foreground truncate">
              {match.homeTeam?.shortName || match.homeTeam?.name}
            </span>
          </div>
          <span className="font-black text-sm text-foreground px-1">
            {match.score?.fullTime?.home ?? '-'}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate pr-2">
            {match.awayTeam?.crest && (
              // eslint-disable-next-next/no-img-element
              <img src={match.awayTeam.crest} alt={match.awayTeam.shortName} className="w-4 h-4 object-contain" />
            )}
            <span className="font-bold text-card-foreground truncate">
              {match.awayTeam?.shortName || match.awayTeam?.name}
            </span>
          </div>
          <span className="font-black text-sm text-foreground px-1">
            {match.score?.fullTime?.away ?? '-'}
          </span>
        </div>
      </div>

      {/* Bottom: Action / Details */}
      <div className="text-[10px] text-muted-foreground pt-2 border-t border-border flex justify-between items-center">
        <span>Match Details</span>
        <ChevronRight size={10} className="text-terracotta-primary group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Card>
  );
};
