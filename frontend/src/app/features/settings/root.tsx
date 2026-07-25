'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, FileText, Bell, Flame } from 'lucide-react';
import { AccountTab } from './components/AccountTab';
import { PublishingTab } from './components/PublishingTab';
import { NotificationsTab } from './components/NotificationsTab';
import type { SettingsTab, SettingsViewProps } from './types';

export default function SettingsRoot({ user }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Top Header Navigation */}
      <header className="w-full bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-40 backdrop-blur bg-zinc-950/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Arena</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="bg-red-600/90 p-1.5 rounded-lg flex items-center justify-center">
              <Flame size={16} className="text-white" />
            </div>
            <span className="text-xs font-extrabold tracking-tighter uppercase italic text-white">
              KHELA <span className="text-red-500">DEKHO</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Settings Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Settings
          </h1>
          <p className="text-sm text-zinc-400 font-light">
            Manage your account details, publishing options, and notification preferences.
          </p>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="border-b border-zinc-800 mb-8">
          <nav className="flex space-x-8 overflow-x-auto no-scrollbar" aria-label="Settings Tabs">
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`pb-4 px-1 border-b-2 font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'account'
                  ? 'border-red-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <User size={16} className={activeTab === 'account' ? 'text-red-500' : 'text-zinc-500'} />
              <span>Account</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('publishing')}
              className={`pb-4 px-1 border-b-2 font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'publishing'
                  ? 'border-red-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <FileText size={16} className={activeTab === 'publishing' ? 'text-red-500' : 'text-zinc-500'} />
              <span>Publishing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`pb-4 px-1 border-b-2 font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'notifications'
                  ? 'border-red-500 text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Bell size={16} className={activeTab === 'notifications' ? 'text-red-500' : 'text-zinc-500'} />
              <span>Notifications</span>
            </button>
          </nav>
        </div>

        {/* Tab Panels */}
        <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-4 sm:p-6 shadow-xl">
          {activeTab === 'account' && <AccountTab user={user} />}
          {activeTab === 'publishing' && <PublishingTab user={user} />}
          {activeTab === 'notifications' && <NotificationsTab user={user} />}
        </div>
      </main>
    </div>
  );
}
