'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, FileText, Bell, Flame } from 'lucide-react';
import { AccountTab } from './components/AccountTab';
import { PublishingTab } from './components/PublishingTab';
import { NotificationsTab } from './components/NotificationsTab';
import type { SettingsTab, SettingsViewProps } from './types';

import { BrandLogo } from '../../components/BrandLogo';

export default function SettingsRoot({ user }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-200">
      {/* Top Header Navigation */}
      <header className="w-full bg-card border-b border-border sticky top-0 z-40 backdrop-blur transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-semibold uppercase tracking-wider group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Arena</span>
          </Link>

          <BrandLogo size="sm" showSubtitle={false} href="/" />
        </div>
      </header>

      {/* Main Settings Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            Manage your account details, publishing options, and notification preferences.
          </p>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="border-b border-border mb-8">
          <nav className="flex space-x-8 overflow-x-auto no-scrollbar" aria-label="Settings Tabs">
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`pb-4 px-1 border-b-2 font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'account'
                  ? 'border-terracotta-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <User size={16} className={activeTab === 'account' ? 'text-terracotta-primary' : 'text-muted-foreground'} />
              <span>Account</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('publishing')}
              className={`pb-4 px-1 border-b-2 font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'publishing'
                  ? 'border-terracotta-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <FileText size={16} className={activeTab === 'publishing' ? 'text-terracotta-primary' : 'text-muted-foreground'} />
              <span>Publishing</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`pb-4 px-1 border-b-2 font-bold text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'notifications'
                  ? 'border-terracotta-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Bell size={16} className={activeTab === 'notifications' ? 'text-terracotta-primary' : 'text-muted-foreground'} />
              <span>Notifications</span>
            </button>
          </nav>
        </div>

        {/* Tab Panels */}
        <div className="bg-card border border-border rounded-3xl p-4 sm:p-6 shadow-xl transition-colors duration-200">
          {activeTab === 'account' && <AccountTab user={user} />}
          {activeTab === 'publishing' && <PublishingTab user={user} />}
          {activeTab === 'notifications' && <NotificationsTab user={user} />}
        </div>
      </main>
    </div>
  );
}
