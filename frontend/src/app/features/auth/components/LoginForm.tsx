'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Flame } from 'lucide-react';
import { loginUser } from '../actions/login_user';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: (result) => {
      if (result.ok) {
        router.push('/');
        router.refresh();
      } else {
        setFormError(result.error);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-600 p-2.5 rounded-xl shadow-lg shadow-red-950/50 flex items-center justify-center rotate-[-3deg]">
            <Flame size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tighter uppercase italic leading-none">
              KHELA <span className="text-red-500">DEKHO</span>
            </h1>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">Sign in to your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950/80 text-white placeholder-zinc-500 border border-zinc-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-2.5 px-4 text-sm transition-all outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950/80 text-white placeholder-zinc-500 border border-zinc-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl py-2.5 px-4 text-sm transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          {formError && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-950/40 cursor-pointer"
          >
            {isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-red-500 hover:text-red-400 font-semibold">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
