import React, { Suspense } from 'react';
import { LoginForm } from '../components/LoginForm';

export default function LoginRoot() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white font-sans">Loading arena...</div>}>
      <LoginForm />
    </Suspense>
  );
}
