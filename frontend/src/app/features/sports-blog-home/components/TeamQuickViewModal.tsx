'use client';

import React from 'react';
import { Trophy, Swords, Shield, Target, Flame, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { StandingTeamItem, TeamQuickViewModalProps } from '../types';

export type { StandingTeamItem, TeamQuickViewModalProps };

export const TeamQuickViewModal: React.FC<TeamQuickViewModalProps> = ({
  standingItem,
  leagueName = 'League Standings',
  onClose,
}) => {
  if (!standingItem) return null;

  const {
    position,
    team,
    playedGames,
    won,
    draw,
    lost,
    points,
    goalsFor,
    goalsAgainst,
    goalDifference,
    form,
  } = standingItem;

  const winRate = playedGames > 0 ? Math.round((won / playedGames) * 100) : 0;
  const goalsPerMatch = playedGames > 0 ? (goalsFor / playedGames).toFixed(2) : '0';
  const concededPerMatch = playedGames > 0 ? (goalsAgainst / playedGames).toFixed(2) : '0';
  const formList = form ? form.split(',') : [];

  // Goal ratio calculation for progress bar (cap total at goalsFor + goalsAgainst or 1 for safety)
  const totalGoalsInMatches = goalsFor + goalsAgainst || 1;
  const attackRatio = Math.round((goalsFor / totalGoalsInMatches) * 100);

  return (
    <Dialog open={Boolean(standingItem)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 bg-card border-border shadow-2xl rounded-3xl overflow-hidden text-card-foreground">
        
        {/* Header Hero Banner */}
        <div className="relative p-6 bg-gradient-to-b from-muted/80 via-muted/40 to-card border-b border-border">
          
          {/* League tag */}
          <div className="flex items-center justify-between mb-4 pr-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-terracotta-primary/10 text-terracotta-primary border border-terracotta-primary/20">
              <Trophy size={12} />
              {leagueName}
            </span>

            {/* Position Rank Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-black tracking-tight border ${
                position === 1
                  ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                  : position <= 4
                  ? 'bg-mint-bright/20 text-sage-deep border-mint-bright/40'
                  : position === 5
                  ? 'bg-terracotta-light/20 text-terracotta-dark border-terracotta-light/40'
                  : position >= 18
                  ? 'bg-terracotta-dark/20 text-terracotta-dark border-terracotta-dark/40'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              Rank #{position}
            </span>
          </div>

          {/* Team Crest & Name */}
          <div className="flex items-center gap-4">
            {team.crest ? (
              <div className="relative p-3 bg-card rounded-2xl border border-border shadow-sm shrink-0">
                {/* eslint-disable-next-next/no-img-element */}
                <img
                  src={team.crest}
                  alt={team.name}
                  className="w-14 h-14 object-contain drop-shadow-md"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center font-bold text-lg text-foreground">
                {team.shortName?.slice(0, 2) || 'TM'}
              </div>
            )}

            <div>
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-black text-card-foreground tracking-tight">
                  {team.name}
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground font-semibold">
                  {team.shortName}
                </span>
                {team.tla && (
                  <span className="text-[10px] font-mono font-bold bg-muted text-foreground px-1.5 py-0.5 rounded border border-border">
                    {team.tla}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 text-card-foreground text-xs">

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <Card className="bg-muted/50 border-border p-3 text-center hover:border-terracotta-primary transition-colors">
              <CardContent className="p-0">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                  Points
                </span>
                <span className="text-2xl font-black text-foreground mt-1 block">
                  {points}
                </span>
              </CardContent>
            </Card>

            <Card className="bg-muted/50 border-border p-3 text-center hover:border-terracotta-primary transition-colors">
              <CardContent className="p-0">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                  Played
                </span>
                <span className="text-2xl font-black text-foreground mt-1 block">
                  {playedGames}
                </span>
              </CardContent>
            </Card>

            <Card className="bg-muted/50 border-border p-3 text-center hover:border-terracotta-primary transition-colors">
              <CardContent className="p-0">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                  Goal Diff
                </span>
                <span className={`text-2xl font-black mt-1 block ${
                  goalDifference > 0 ? 'text-sage-deep font-black' : goalDifference < 0 ? 'text-terracotta-dark' : 'text-muted-foreground'
                }`}>
                  {goalDifference > 0 ? `+${goalDifference}` : goalDifference}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Record Row Breakdown (W - D - L) */}
          <div className="bg-muted/40 border border-border rounded-xl p-3 flex items-center justify-around text-center">
            <div>
              <span className="text-[10px] font-bold uppercase text-sage-deep block">Wins</span>
              <span className="text-base font-extrabold text-foreground mt-0.5 block">{won}</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div>
              <span className="text-[10px] font-bold uppercase text-terracotta-light block">Draws</span>
              <span className="text-base font-extrabold text-foreground mt-0.5 block">{draw}</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div>
              <span className="text-[10px] font-bold uppercase text-terracotta-dark block">Losses</span>
              <span className="text-base font-extrabold text-foreground mt-0.5 block">{lost}</span>
            </div>
          </div>

          {/* Recent Form Tracker */}
          {formList.length > 0 && (
            <div className="bg-muted/30 border border-border rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground font-bold text-[11px] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Flame size={13} className="text-terracotta-primary" />
                  Recent Form (Last 5)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {formList.map((res, i) => {
                  const letter = res.trim().toUpperCase();
                  const isWin = letter === 'W';
                  const isDraw = letter === 'D';
                  return (
                    <span
                      key={i}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
                        isWin
                          ? 'bg-mint-bright/20 text-sage-deep border-mint-bright/40'
                          : isDraw
                          ? 'bg-terracotta-light/20 text-terracotta-dark border-terracotta-light/40'
                          : 'bg-terracotta-dark/20 text-terracotta-dark border-terracotta-dark/40'
                      }`}
                    >
                      {letter}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Analytics Bars */}
          <div className="space-y-4 pt-1">
            
            {/* Win Rate Progress */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-[11px]">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-sage-deep" />
                  Win Rate
                </span>
                <span className="font-mono font-bold text-sage-deep">{winRate}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-sage-deep rounded-full transition-all duration-500"
                  style={{ width: `${winRate}%` }}
                />
              </div>
            </div>

            {/* Attack & Scoring Stats */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-[11px]">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Target size={13} className="text-terracotta-primary" />
                  Goals Scored ({goalsFor})
                </span>
                <span className="font-mono text-muted-foreground">{goalsPerMatch} / match</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-terracotta-primary rounded-full transition-all duration-500"
                  style={{ width: `${attackRatio}%` }}
                />
              </div>
            </div>

            {/* Defensive Ratio */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-[11px]">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Shield size={13} className="text-terracotta-dark" />
                  Goals Conceded ({goalsAgainst})
                </span>
                <span className="font-mono text-muted-foreground">{concededPerMatch} / match</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-terracotta-dark rounded-full transition-all duration-500"
                  style={{ width: `${100 - attackRatio}%` }}
                />
              </div>
            </div>

          </div>

          {/* Action Footer Button */}
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full bg-card hover:bg-muted border-border text-foreground rounded-xl py-2.5 font-bold text-xs cursor-pointer transition-colors"
            >
              Close Quick View
            </Button>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
};
