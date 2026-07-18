'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Flame, Mail, Lock, User, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { loginUser } from '../actions/login_user';
import { registerUser } from '../actions/register_user';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Toggle between 'login' and 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Sync mode with URL search param on load (if present)
  useEffect(() => {
    const initialMode = searchParams.get('mode');
    if (initialMode === 'register' || initialMode === 'login') {
      setMode(initialMode);
    }
  }, [searchParams]);

  // Login Mutation
  const loginMutation = useMutation({
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

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (result) => {
      if (result.ok) {
        toast.success('Account created successfully!', {
          description: 'Welcome to Khela Dekho.',
        });
        router.push('/');
        router.refresh();
      } else {
        setFormError(result.error);
        toast.error('Registration Failed', {
          description: result.error || 'Could not create account.',
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (mode === 'login') {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ username, email, password });
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 font-sans grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side: Image Panel */}
      <div className="hidden lg:block relative w-full h-full">
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
      <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-zinc-900/20 min-h-screen border-l border-zinc-900">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">
              {mode === 'login' ? 'Login your account' : 'Create your account'}
            </p>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {mode === 'login' ? 'Welcome Back!' : 'Join the Arena!'}
            </h1>
            <p className="text-sm text-zinc-400 mt-1 font-light">
              {mode === 'login' 
                ? 'Enter your email and password to access the arena.' 
                : 'Enter your details below to set up your account.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                >
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <User size={16} />
                  </span>
                  <input
                    id="username"
                    type="text"
                    required
                    minLength={1}
                    maxLength={50}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-950/80 text-white placeholder-zinc-600 border border-zinc-800 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/80 rounded-xl py-3 pl-10 pr-4 text-sm transition-all outline-none"
                    placeholder="your_username"
                  />
                </div>
              </div>
            )}

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
                {mode === 'login' && (
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
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950/80 text-white placeholder-zinc-600 border border-zinc-800 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/80 rounded-xl py-3 pl-10 pr-4 text-sm transition-all outline-none"
                  placeholder="Enter your password"
                />
              </div>
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
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-red-950/40 cursor-pointer active:scale-[0.99] select-none text-sm uppercase tracking-wider font-semibold"
            >
              {mode === 'login' 
                ? (isPending ? 'Signing in...' : 'Sign In') 
                : (isPending ? 'Creating account...' : 'Create Account')}
            </button>
          </form>

          <div className="text-center text-sm text-zinc-500">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => {
                    setFormError(null);
                    setMode('register');
                  }}
                  className="text-red-500 hover:text-red-400 font-semibold transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setFormError(null);
                    setMode('login');
                  }}
                  className="text-red-500 hover:text-red-400 font-semibold transition-colors bg-transparent border-none p-0 cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
