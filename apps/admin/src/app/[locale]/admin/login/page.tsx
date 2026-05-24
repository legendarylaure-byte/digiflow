'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/en/admin/dashboard';
    } catch (err: any) {
      setError('Invalid credentials or unauthorized');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-sm rounded-xl bg-gray-800 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <img src="/logo.png" alt="DigiFlow" className="mx-auto h-10" />
          <h1 className="mt-4 text-xl font-bold text-white">Admin Panel</h1>
          <p className="mt-1 text-sm text-gray-400">Authorized personnel only</p>
        </div>
        {error && <p className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-400">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Admin email"
            className="w-full rounded-lg border border-gray-700 bg-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:border-brand-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-gray-700 bg-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:border-brand-500 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-500">
          DigiFlow Admin v0.1.0 &middot; VyomAi Cloud Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}
