'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Flame, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { loginUser } from '../actions/login_user';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: (result) => {
      if (result.ok) {
        toast.success('Successfully logged in!', {
          description: 'Welcome back to Khela Dekho.',
        });
        router.push('/');
        router.refresh();
      } else {
        toast.error('Authentication Failed', {
          description: result.error || 'Incorrect email or password.',
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-[2rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left Side: Image Panel */}
        <div className="hidden lg:block lg:col-span-5 relative">
          <img
            src="/auth-placeholder-img.webp"
            alt="Khela Dekho Arena"
            className="absolute inset-0 w-full h-full object-cover select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/10" />
          
          {/* Logo overlay on top-left of the image */}
          <div className="absolute top-8 left-8 flex items-center gap-2.5 z-10">
            <div className="bg-red-600/90 backdrop-blur p-2 rounded-xl flex items-center justify-center rotate-[-3deg]">
              <Flame size={20} className="text-white" />
            </div>
            <span className="text-sm font-extrabold tracking-tighter uppercase italic text-white">
              KHELA <span className="text-red-500">DEKHO</span>
            </span>
          </div>

          {/* Text overlay on bottom of the image */}
          <div className="absolute bottom-8 left-8 right-8 z-10">
            <h2 className="text-2xl font-extrabold tracking-tight text-white leading-tight mb-2 uppercase italic">
              Khela Dekho Arena
            </h2>
            <p className="text-xs text-zinc-300 font-medium leading-relaxed uppercase tracking-wider">
              The Ultimate Sports Arena
            </p>
            <p className="text-xs text-zinc-400 font-light mt-2 leading-relaxed">
              Access live metrics, verified transfer updates, and tactical reviews from top contributors.
            </p>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="col-span-1 lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-zinc-900/40">
          <div className="max-w-md w-full mx-auto space-y-8">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">
                Login your account
              </p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Welcome Back!
              </h1>
              <p className="text-sm text-zinc-400 mt-1 font-light">
                Enter your email and password to access the arena.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                >
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail size={16} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950/80 text-white placeholder-zinc-600 border border-zinc-800 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/80 rounded-xl py-3 pl-10 pr-4 text-sm transition-all outline-none"
                    placeholder="hello@kheladekho.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-xs text-red-500 hover:text-red-400 transition-colors font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info("Password Reset", {
                        description: "Password reset functionality is currently disabled."
                      });
                    }}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock size={16} />
                  </span>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950/80 text-white placeholder-zinc-600 border border-zinc-800 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/80 rounded-xl py-3 pl-10 pr-4 text-sm transition-all outline-none"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-red-950/40 cursor-pointer active:scale-[0.99] select-none text-sm uppercase tracking-wider font-semibold"
              >
                {isPending ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-zinc-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-red-500 hover:text-red-400 font-semibold transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
