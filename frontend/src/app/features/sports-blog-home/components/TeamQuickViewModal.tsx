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
      <DialogContent className="max-w-md sm:max-w-lg p-0 bg-zinc-950 border-zinc-800 shadow-2xl rounded-3xl overflow-hidden">
        
        {/* Header Hero Banner */}
        <div className="relative p-6 bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 border-b border-zinc-800/80">
          
          {/* League tag */}
          <div className="flex items-center justify-between mb-4 pr-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Trophy size={12} />
              {leagueName}
            </span>

            {/* Position Rank Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-black tracking-tight border ${
                position === 1
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                  : position <= 4
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : position === 5
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  : position >= 18
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-zinc-800/60 text-zinc-300 border-zinc-700/60'
              }`}
            >
              Rank #{position}
            </span>
          </div>

          {/* Team Crest & Name */}
          <div className="flex items-center gap-4">
            {team.crest ? (
              <div className="relative p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 shadow-inner shrink-0">
                {/* eslint-disable-next-next/no-img-element */}
                <img
                  src={team.crest}
                  alt={team.name}
                  className="w-14 h-14 object-contain drop-shadow-md"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center font-bold text-lg text-white">
                {team.shortName?.slice(0, 2) || 'TM'}
              </div>
            )}

            <div>
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {team.name}
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-zinc-400 font-semibold">
                  {team.shortName}
                </span>
                {team.tla && (
                  <span className="text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700/60">
                    {team.tla}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 text-zinc-200 text-xs">

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <Card className="bg-zinc-900/80 border-zinc-800/80 p-3 text-center hover:border-zinc-700 transition-colors">
              <CardContent className="p-0">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                  Points
                </span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {points}
                </span>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/80 border-zinc-800/80 p-3 text-center hover:border-zinc-700 transition-colors">
              <CardContent className="p-0">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                  Played
                </span>
                <span className="text-2xl font-black text-zinc-200 mt-1 block">
                  {playedGames}
                </span>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/80 border-zinc-800/80 p-3 text-center hover:border-zinc-700 transition-colors">
              <CardContent className="p-0">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                  Goal Diff
                </span>
                <span className={`text-2xl font-black mt-1 block ${
                  goalDifference > 0 ? 'text-emerald-400' : goalDifference < 0 ? 'text-red-400' : 'text-zinc-300'
                }`}>
                  {goalDifference > 0 ? `+${goalDifference}` : goalDifference}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Record Row Breakdown (W - D - L) */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-around text-center">
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-400 block">Wins</span>
              <span className="text-base font-extrabold text-white mt-0.5 block">{won}</span>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-400 block">Draws</span>
              <span className="text-base font-extrabold text-white mt-0.5 block">{draw}</span>
            </div>
            <div className="h-6 w-px bg-zinc-800" />
            <div>
              <span className="text-[10px] font-bold uppercase text-red-400 block">Losses</span>
              <span className="text-base font-extrabold text-white mt-0.5 block">{lost}</span>
            </div>
          </div>

          {/* Recent Form Tracker */}
          {formList.length > 0 && (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-zinc-400 font-bold text-[11px] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Flame size={13} className="text-amber-500" />
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
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : isDraw
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-red-500/20 text-red-400 border-red-500/40'
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
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-emerald-400" />
                  Win Rate
                </span>
                <span className="font-mono font-bold text-emerald-400">{winRate}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${winRate}%` }}
                />
              </div>
            </div>

            {/* Attack & Scoring Stats */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-[11px]">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <Target size={13} className="text-blue-400" />
                  Goals Scored ({goalsFor})
                </span>
                <span className="font-mono text-zinc-400">{goalsPerMatch} / match</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${attackRatio}%` }}
                />
              </div>
            </div>

            {/* Defensive Ratio */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-[11px]">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <Shield size={13} className="text-amber-400" />
                  Goals Conceded ({goalsAgainst})
                </span>
                <span className="font-mono text-zinc-400">{concededPerMatch} / match</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
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
              className="w-full bg-zinc-900 hover:bg-zinc-800 border-zinc-700/80 text-zinc-200 hover:text-white rounded-xl py-2.5 font-bold text-xs cursor-pointer transition-colors"
            >
              Close Quick View
            </Button>
          </div>

        </div>

      </DialogContent>
    </Dialog>
  );
};
