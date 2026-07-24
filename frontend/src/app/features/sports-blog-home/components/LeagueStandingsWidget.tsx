'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, RefreshCw, ChevronDown } from 'lucide-react';

interface StandingItem {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    crest: string;
  };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string;
}

interface StandingsData {
  competition?: { name: string; emblem: string };
  standings?: Array<{
    type: string;
    table: StandingItem[];
  }>;
}

async function fetchLeagueStandings(leagueCode: string): Promise<StandingsData> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const res = await fetch(`${backendUrl}/api/v1/livescores/standings/${leagueCode}`, {
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error('Failed to fetch standings');
  }
  return res.json();
}

const LEAGUES = [
  { code: 'PL', name: 'Premier League' },
  { code: 'PD', name: 'La Liga' },
  { code: 'CL', name: 'Champions League' },
  { code: 'SA', name: 'Serie A' },
  { code: 'BL1', name: 'Bundesliga' },
];

export const LeagueStandingsWidget: React.FC = () => {
  const [selectedLeague, setSelectedLeague] = useState<string>('PL');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['leagueStandings', selectedLeague],
    queryFn: () => fetchLeagueStandings(selectedLeague),
    staleTime: 5 * 60 * 1000, // 5 minutes stale time for standings
  });

  const table = data?.standings?.[0]?.table || [];

  return (
    <div className="w-full bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
            <Trophy size={16} />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            League Standings
          </h3>
        </div>

        {/* League Selector Dropdown */}
        <div className="relative">
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="appearance-none bg-zinc-950 text-xs text-zinc-200 font-semibold border border-zinc-700/80 rounded-xl px-3 py-1.5 pr-7 cursor-pointer hover:border-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
          >
            {LEAGUES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2 py-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-8 bg-zinc-800/40 rounded-lg" />
          ))}
        </div>
      ) : table.length === 0 ? (
        <div className="py-6 text-center text-xs text-zinc-500 italic">
          Standings unavailable right now.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800/80 font-mono text-[10px] uppercase">
                <th className="py-2 px-1 text-center w-6">#</th>
                <th className="py-2 px-2">Team</th>
                <th className="py-2 px-1 text-center">MP</th>
                <th className="py-2 px-1 text-center">GD</th>
                <th className="py-2 px-1 text-center font-bold text-zinc-300">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {table.slice(0, 10).map((row) => (
                <tr
                  key={row.team.id}
                  className="hover:bg-zinc-800/30 transition-colors group text-zinc-300"
                >
                  {/* Position */}
                  <td className="py-2 px-1 text-center font-bold text-zinc-400 text-[11px]">
                    <span
                      className={`inline-block w-5 text-center ${
                        row.position <= 4
                          ? 'text-emerald-400 font-extrabold'
                          : row.position === 5
                          ? 'text-blue-400'
                          : row.position >= 18
                          ? 'text-red-400'
                          : ''
                      }`}
                    >
                      {row.position}
                    </span>
                  </td>

                  {/* Team Crest & Name */}
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      {row.team.crest && (
                        // eslint-disable-next-next/no-img-element
                        <img
                          src={row.team.crest}
                          alt={row.team.shortName}
                          className="w-4 h-4 object-contain"
                        />
                      )}
                      <span className="font-semibold text-zinc-200 group-hover:text-white truncate max-w-[120px]">
                        {row.team.shortName || row.team.name}
                      </span>
                    </div>
                  </td>

                  {/* Matches Played */}
                  <td className="py-2 px-1 text-center font-mono text-zinc-400">
                    {row.playedGames}
                  </td>

                  {/* Goal Difference */}
                  <td className="py-2 px-1 text-center font-mono text-zinc-400">
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>

                  {/* Points */}
                  <td className="py-2 px-1 text-center font-black text-white text-xs">
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
