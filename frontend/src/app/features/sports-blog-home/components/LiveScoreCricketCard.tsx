'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { CricketMatch } from '../types';

interface LiveScoreCricketCardProps {
  match: CricketMatch;
}

export const LiveScoreCricketCard: React.FC<LiveScoreCricketCardProps> = ({ match }) => {
  const t1Name = match.teamInfo?.[0]?.name || match.teams?.[0] || 'Team 1';
  const t1Short = match.teamInfo?.[0]?.shortname || (t1Name ? t1Name.substring(0, 3).toUpperCase() : 'T1');
  const t1Img = match.teamInfo?.[0]?.img;

  const t2Name = match.teamInfo?.[1]?.name || match.teams?.[1] || 'Team 2';
  const t2Short = match.teamInfo?.[1]?.shortname || (t2Name ? t2Name.substring(0, 3).toUpperCase() : 'T2');
  const t2Img = match.teamInfo?.[1]?.img;

  const score1 = match.score?.find(s =>
    s.inning && (
      (t1Short && s.inning.toLowerCase().includes(t1Short.toLowerCase())) ||
      (t1Name && s.inning.toLowerCase().includes(t1Name.toLowerCase()))
    )
  ) || match.score?.[0];

  const score2 = match.score?.find(s =>
    s.inning && (
      (t2Short && s.inning.toLowerCase().includes(t2Short.toLowerCase())) ||
      (t2Name && s.inning.toLowerCase().includes(t2Name.toLowerCase()))
    )
  ) || match.score?.[1];

  return (
    <Card className="min-w-[280px] max-w-[300px] bg-card border border-border hover:border-terracotta-primary/50 rounded-xl p-3 flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-lg group text-card-foreground">
      {/* Header: Format & Status */}
      <div className="flex items-center justify-between text-[11px] mb-2">
        <span className="font-extrabold uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
          {match.matchType}
        </span>
        {match.isLive ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-terracotta-primary/20 text-terracotta-primary border border-terracotta-primary/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta-primary" />
            LIVE
          </span>
        ) : match.matchEnded ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
            RESULT
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted/80 text-muted-foreground border border-border">
            UPCOMING
          </span>
        )}
      </div>

      {/* Team Scores */}
      <div className="space-y-2 py-1">
        {/* Team 1 */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate pr-2">
            {t1Img ? (
              // eslint-disable-next-next/no-img-element
              <img src={t1Img} alt={t1Name} className="w-5 h-5 rounded-full object-cover border border-border" />
            ) : (
              <div className="w-5 h-5 bg-sage-deep/20 text-sage-deep border border-sage-deep/40 rounded-full flex items-center justify-center text-[9px] font-bold">
                {t1Short}
              </div>
            )}
            <span className="font-bold text-card-foreground truncate">{t1Name}</span>
          </div>
          <div className="text-right">
            <span className="font-black text-foreground text-xs">
              {score1 ? `${score1.r}/${score1.w}` : '-'}
            </span>
            {score1?.o !== undefined && score1?.o !== null && (
              <span className="text-[10px] text-muted-foreground ml-1">({score1.o} ov)</span>
            )}
          </div>
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate pr-2">
            {t2Img ? (
              // eslint-disable-next-next/no-img-element
              <img src={t2Img} alt={t2Name} className="w-5 h-5 rounded-full object-cover border border-border" />
            ) : (
              <div className="w-5 h-5 bg-terracotta-light/20 text-terracotta-dark border border-terracotta-light/40 rounded-full flex items-center justify-center text-[9px] font-bold">
                {t2Short}
              </div>
            )}
            <span className="font-bold text-card-foreground truncate">{t2Name}</span>
          </div>
          <div className="text-right">
            <span className="font-black text-foreground text-xs">
              {score2 ? `${score2.r}/${score2.w}` : '-'}
            </span>
            {score2?.o !== undefined && score2?.o !== null && (
              <span className="text-[10px] text-muted-foreground ml-1">({score2.o} ov)</span>
            )}
          </div>
        </div>
      </div>

      {/* Match Note / Status */}
      <div className="text-[11px] text-muted-foreground font-medium pt-2 border-t border-border truncate">
        {match.status}
      </div>
    </Card>
  );
};
