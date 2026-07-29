'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '@/src/app/configs/queryClient';
import { FootballMatch, CricketMatch, BaseballMatch } from '../types';
import { LiveScoreCricketCard } from './LiveScoreCricketCard';
import { LiveScoreFootballCard } from './LiveScoreFootballCard';
import { LiveScoreBaseballCard } from './LiveScoreBaseballCard';

async function fetchFootballMatches(): Promise<FootballMatch[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/livescores/matches`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch football matches');
  const data = await res.json();
  return data.matches || [];
}

async function fetchCricketMatches(): Promise<CricketMatch[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/cricket/matches`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch cricket matches');
  const data = await res.json();
  return data.data || [];
}

async function fetchBaseballMatches(): Promise<BaseballMatch[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/baseball/matches`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch baseball matches');
  const data = await res.json();
  return data.matches || [];
}

export const LiveScoreTicker: React.FC = () => {
  const [activeSport, setActiveSport] = useState<'football' | 'cricket' | 'baseball'>('cricket');
  const [selectedLeague, setSelectedLeague] = useState<string>('ALL');

  // Football Query
  const {
    data: footballMatches = [],
    isLoading: isLoadingFb,
    isFetching: isFetchingFb,
    refetch: refetchFb
  } = useQuery({
    queryKey: ['footballScoresMatches'],
    queryFn: fetchFootballMatches,
    refetchInterval: 30000,
  });

  // Cricket Query
  const {
    data: cricketMatches = [],
    isLoading: isLoadingCr,
    isFetching: isFetchingCr,
    refetch: refetchCr
  } = useQuery({
    queryKey: ['cricketScoresMatches'],
    queryFn: fetchCricketMatches,
    refetchInterval: 30000,
  });

  // Baseball Query
  const {
    data: baseballMatches = [],
    isLoading: isLoadingBb,
    isFetching: isFetchingBb,
    refetch: refetchBb
  } = useQuery({
    queryKey: ['baseballScoresMatches'],
    queryFn: fetchBaseballMatches,
    refetchInterval: 30000,
  });

  const liveFbCount = footballMatches.filter((m) =>
    ['IN_PLAY', 'PAUSED', 'HALF_TIME'].includes(m.status)
  ).length;

  const liveCrCount = cricketMatches.filter((m) => m.isLive).length;
  const liveBbCount = baseballMatches.filter((m) => m.isLive).length;

  const handleRefresh = () => {
    if (activeSport === 'football') refetchFb();
    else if (activeSport === 'cricket') refetchCr();
    else refetchBb();
  };

  // Filter Football Matches
  const filteredFootball = footballMatches.filter((m) => {
    if (selectedLeague === 'ALL') return true;
    if (selectedLeague === 'LIVE') return ['IN_PLAY', 'PAUSED', 'HALF_TIME'].includes(m.status);
    return m.competition?.code === selectedLeague;
  });

  // Filter Cricket Matches
  const filteredCricket = cricketMatches.filter((m) => {
    if (selectedLeague === 'ALL') return true;
    if (selectedLeague === 'LIVE') return m.isLive;
    return m.matchType?.toLowerCase() === selectedLeague.toLowerCase();
  });

  // Filter Baseball Matches
  const filteredBaseball = baseballMatches.filter((m) => {
    if (selectedLeague === 'ALL') return true;
    if (selectedLeague === 'LIVE') return m.isLive;
    return true;
  });

  return (
    <div className="w-full bg-card border border-border rounded-2xl p-4 shadow-xl text-card-foreground transition-colors duration-200">
      {/* Header & Sport Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-border">
        
        {/* Left: Sport Selector */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-terracotta-primary/20 text-terracotta-primary border border-terracotta-primary/30">
            <Activity size={18} />
          </div>
          <div className="flex items-center gap-1.5 bg-background p-1 rounded-xl border border-border">
            <button
              onClick={() => { setActiveSport('cricket'); setSelectedLeague('ALL'); }}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSport === 'cricket'
                  ? 'bg-terracotta-primary text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>🏏 Cricket</span>
              {liveCrCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-mint-bright animate-pulse" />
              )}
            </button>

            <button
              onClick={() => { setActiveSport('football'); setSelectedLeague('ALL'); }}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSport === 'football'
                  ? 'bg-terracotta-primary text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>⚽ Football</span>
              {liveFbCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-mint-bright animate-pulse" />
              )}
            </button>

            <button
              onClick={() => { setActiveSport('baseball'); setSelectedLeague('ALL'); }}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSport === 'baseball'
                  ? 'bg-terracotta-primary text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>⚾ Baseball</span>
              {liveBbCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-mint-bright animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Right: Sub Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {activeSport === 'football' ? (
            [
              { id: 'ALL', label: 'All' },
              { id: 'LIVE', label: `Live (${liveFbCount})` },
              { id: 'PL', label: 'Premier League' },
              { id: 'PD', label: 'La Liga' },
              { id: 'CL', label: 'Champions League' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedLeague(tab.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedLeague === tab.id
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 border border-zinc-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))
          ) : activeSport === 'cricket' ? (
            [
              { id: 'ALL', label: 'All Matches' },
              { id: 'LIVE', label: `Live (${liveCrCount})` },
              { id: 'odi', label: 'ODI' },
              { id: 't20', label: 'T20' },
              { id: 'test', label: 'Test' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedLeague(tab.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedLeague === tab.id
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 border border-zinc-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))
          ) : (
            [
              { id: 'ALL', label: 'All MLB' },
              { id: 'LIVE', label: `Live (${liveBbCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedLeague(tab.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedLeague === tab.id
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 border border-zinc-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))
          )}

          <button
            onClick={handleRefresh}
            title="Refresh Scores"
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-xl transition-all ml-1 border border-zinc-700/50 cursor-pointer"
          >
            <RefreshCw
              size={14}
              className={(isFetchingFb || isFetchingCr || isFetchingBb) ? 'animate-spin text-red-400' : ''}
            />
          </button>
        </div>
      </div>

      {/* --- CAROUSEL CONTENT --- */}

      {/* 🏏 CRICKET SECTION */}
      {activeSport === 'cricket' && (
        isLoadingCr ? (
          <div className="flex gap-3 overflow-x-auto py-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="min-w-[280px] h-32 bg-zinc-800/50 rounded-xl animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : filteredCricket.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500 italic">
            No cricket matches available for this filter right now.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent py-1">
            {filteredCricket.map((match) => (
              <LiveScoreCricketCard key={match.id} match={match} />
            ))}
          </div>
        )
      )}

      {/* ⚽ FOOTBALL SECTION */}
      {activeSport === 'football' && (
        isLoadingFb ? (
          <div className="flex gap-3 overflow-x-auto py-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="min-w-[250px] h-28 bg-zinc-800/50 rounded-xl animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : filteredFootball.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500 italic">
            No football matches found for this filter right now.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent py-1">
            {filteredFootball.map((match) => (
              <LiveScoreFootballCard key={match.id} match={match} />
            ))}
          </div>
        )
      )}

      {/* ⚾ BASEBALL SECTION */}
      {activeSport === 'baseball' && (
        isLoadingBb ? (
          <div className="flex gap-3 overflow-x-auto py-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="min-w-[260px] h-28 bg-zinc-800/50 rounded-xl animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : filteredBaseball.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500 italic">
            No baseball matches found right now.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent py-1">
            {filteredBaseball.map((match) => (
              <LiveScoreBaseballCard key={match.id} match={match} />
            ))}
          </div>
        )
      )}
    </div>
  );
};
