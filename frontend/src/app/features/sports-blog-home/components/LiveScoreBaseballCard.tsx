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
    <Card className="min-w-[260px] max-w-[280px] bg-zinc-950/90 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3 flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-lg group">
      {/* Header: League & Status */}
      <div className="flex items-center justify-between text-[11px] mb-2">
        <span className="font-extrabold uppercase tracking-wide text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
          {match.league || 'MLB'}
        </span>
        {match.isLive ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-600/20 text-red-400 border border-red-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            LIVE
          </span>
        ) : match.status === 'Final' || match.status === 'FT' ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
            FINAL
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
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
              <div className="w-5 h-5 bg-red-900/40 text-red-400 border border-red-700/50 rounded-full flex items-center justify-center text-[9px] font-bold">
                {match.homeTeam?.shortName}
              </div>
            )}
            <span className="font-bold text-zinc-200 truncate">{match.homeTeam?.name}</span>
          </div>
          <span className="font-black text-sm text-white px-1">
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
              <div className="w-5 h-5 bg-blue-900/40 text-blue-400 border border-blue-700/50 rounded-full flex items-center justify-center text-[9px] font-bold">
                {match.awayTeam?.shortName}
              </div>
            )}
            <span className="font-bold text-zinc-200 truncate">{match.awayTeam?.name}</span>
          </div>
          <span className="font-black text-sm text-white px-1">
            {match.awayScore ?? '-'}
          </span>
        </div>
      </div>

      {/* Footer: Venue & Action */}
      <div className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-900 flex justify-between items-center">
        <span className="truncate max-w-[170px]">{match.venue || match.date}</span>
        <ChevronRight size={10} className="text-red-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
      </div>
    </Card>
  );
};
