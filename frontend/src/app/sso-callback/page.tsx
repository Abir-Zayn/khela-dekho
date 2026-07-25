import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-400 font-medium tracking-wide uppercase">
          Completing authentication...
        </p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
