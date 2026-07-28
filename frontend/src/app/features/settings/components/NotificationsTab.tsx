'use client';

import React from 'react';
import { toast } from 'sonner';
import { ChevronRight, Bell, Mail, Heart } from 'lucide-react';
import { ProfileListTile } from './ProfileListTile';
import type { AuthUser } from '../../auth/types';

interface NotificationsTabProps {
  user: AuthUser | null;
}

export function NotificationsTab({ user }: NotificationsTabProps) {
  const handleToggle = (name: string) => {
    toast.success(`Notification updated`, {
      description: `${name} preferences saved.`,
    });
  };

  return (
    <div className="space-y-4">
      <ProfileListTile
        title="Email Notifications"
        description="Receive weekly summaries of top trending match reviews and transfer updates"
        onClick={() => handleToggle('Email Digest')}
        value={
          <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
            Subscribed
          </span>
        }
      />

      <div className="border-t border-border" />

      <ProfileListTile
        title="Post Reaction Alerts"
        description="Get notified when someone reacts (Like, Love, Laugh) to your articles"
        onClick={() => handleToggle('Reactions')}
        value={
          <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
            Enabled
          </span>
        }
      />

      <div className="border-t border-border" />

      <ProfileListTile
        title="Live Match Goal Tickers"
        description="Receive live notifications for selected favorite football, cricket, and baseball teams"
        onClick={() => handleToggle('Live Tickers')}
        value={
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Configure Teams</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        }
      />
    </div>
  );
}

