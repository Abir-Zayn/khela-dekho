'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Flame, Mail, Lock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, useClerk } from '@clerk/nextjs';
import { useSignIn } from '@clerk/nextjs/legacy';
import { SignUpForm } from './SignUpForm';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();

  // Toggle between 'login' and 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Sync mode with URL search param on load (if present)
  useEffect(() => {
    const initialMode = searchParams.get('mode');
    if (initialMode === 'register' || initialMode === 'login') {
      setMode(initialMode);
    }
  }, [searchParams]);

  // If user is already signed in, redirect to home
  useEffect(() => {
    if (isSignedIn) {
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    }
  }, [isSignedIn, router, searchParams]);

  const handleSocialSignIn = async (strategy: 'oauth_google' | 'oauth_facebook') => {
    if (isSignedIn) {
      await signOut();
    }
    if (!isSignInLoaded || !signIn) {
      toast.info('Clerk Loading...', { description: 'Please wait a moment while auth initializes.' });
      return;
    }
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: searchParams.get('redirect') || '/',
      });
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message || 'Could not initiate social login.';
      if (msg.toLowerCase().includes('already exist') || msg.toLowerCase().includes('already signed in')) {
        router.push(searchParams.get('redirect') || '/');
        return;
      }
      toast.error('Social Login Error', { description: msg });
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    if (!isSignInLoaded || !signIn) {
      setIsSubmitting(false);
      setFormError('Authentication service is initializing. Please try again in a moment.');
      return;
    }
    try {
      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      if (result.status === 'complete') {
        await setSignInActive({ session: result.createdSessionId });
        toast.success('Successfully logged in!', {
          description: 'Welcome back to Khela Dekho.',
        });
        const redirectUrl = searchParams.get('redirect') || '/';
        router.push(redirectUrl);
        router.refresh();
      } else {
        setFormError('Additional verification required.');
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Incorrect email or password.';
      setFormError(msg);
      toast.error('Authentication Failed', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 font-sans grid grid-cols-1 lg:grid-cols-2">
      {/* Left Side: Image Panel */}
      <div className="hidden lg:block relative w-full h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
        </div>
      </div>

      {/* Right Side: Auth Form Container */}
      <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-zinc-900/20 min-h-screen border-l border-zinc-900">
        {mode === 'register' ? (
          <SignUpForm onSwitchToLogin={() => setMode('login')} />
        ) : (
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

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div id="clerk-captcha" />

              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                >
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail size={16} />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    className="w-full bg-zinc-950/80 text-white placeholder-zinc-600 border border-zinc-800 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/80 rounded-xl py-3 pl-10 pr-4 text-sm transition-all outline-none"
                    placeholder="hello@kheladekho.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-xs text-red-500 hover:text-red-400 transition-colors font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('Password Reset', {
                        description: "Use Clerk's account recovery or click forgot password.",
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
                    id="login-password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange('password')}
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
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-red-950/40 cursor-pointer active:scale-[0.99] select-none text-sm uppercase tracking-wider font-semibold"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Social OAuth Buttons */}
            <div className="space-y-4 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-zinc-800 w-full" />
                <span className="bg-zinc-950 px-3 text-xs text-zinc-500 uppercase tracking-widest absolute">
                  or continue with
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleSocialSignIn('oauth_google')}
                  className="flex items-center justify-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer hover:border-zinc-700"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialSignIn('oauth_facebook')}
                  className="flex items-center justify-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer hover:border-zinc-700"
                >
                  <svg className="w-4 h-4 fill-current text-blue-500" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </button>
              </div>
            </div>

            <div className="text-center text-sm text-zinc-500">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-red-500 hover:text-red-400 font-semibold transition-colors bg-transparent border-none p-0 cursor-pointer"
              >
                Create one
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
