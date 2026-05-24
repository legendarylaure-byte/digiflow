'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { loginWithEmail, loginWithGoogle } from '@/lib/firebase/auth';
import { spaceGrotesk } from '@/lib/fonts';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Scene3D = dynamic(() => import('@/components/auth/scene-3d'), { ssr: false });
const StarFieldCSS = dynamic(() => import('@/components/auth/stars'), { ssr: false });

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

export default function LoginPage() {
  const t = useTranslations('auth');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [taglineIdx, setTaglineIdx] = useState(0);
  const taglineRef = useRef<HTMLSpanElement>(null);
  const authRedirectDone = useRef(false);

  const tagline = 'Intelligent Workflow. Infinite Possibilities.';

  useEffect(() => {
    if (!authLoading && isAuthenticated && !authRedirectDone.current) {
      authRedirectDone.current = true;
      window.location.href = '/en/dashboard';
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (!taglineRef.current) return;
    const interval = setInterval(() => {
      setTaglineIdx((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      window.location.href = '/en/dashboard';
      toast.success(t('loginTitle'));
    } catch (error: any) {
      const message =
        error.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : error.code === 'auth/too-many-requests'
            ? 'Too many attempts. Please try again later.'
            : 'Failed to sign in';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      await loginWithGoogle();
      if (!authRedirectDone.current) {
        authRedirectDone.current = true;
        window.location.href = '/en/dashboard';
      }
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Google login error:', error);
        toast.error('Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${spaceGrotesk.variable} flex min-h-screen bg-[#0a0015]`}>
      {!isMobile && (
        <div className="relative hidden md:flex md:w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a0015] via-[#1a0a2e] to-[#0d0020]">
          <Scene3D />
          <div className="relative z-10 text-center px-8">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1.5 }}
              className="text-sm text-white/30 font-[family-name:var(--font-space-grotesk)] tracking-widest uppercase mt-48"
            >
              VyomAI Cloud Pvt. Ltd.
            </motion.p>
          </div>
        </div>
      )}

      {isMobile && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0015] via-[#1a0a2e] to-[#0d0020]">
          <StarFieldCSS />
        </div>
      )}

      <div className={`relative z-10 flex ${isMobile ? 'w-full min-h-screen items-center justify-center p-4' : 'w-full md:w-1/2 items-center justify-center p-8'} bg-[#0f0a1a] md:bg-transparent`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6, type: 'spring', stiffness: 120 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7C3FED] to-[#EC5E3A] opacity-20 blur-3xl animate-pulse" style={{ width: 280, height: 280, left: -15, top: -15 }} />
              <img
                src="/vyomai-logo.png"
                alt="VyomAI"
                className="relative z-10"
                style={{ width: isMobile ? 200 : 250, height: 'auto' }}
              />
            </div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] bg-gradient-to-r from-[#7C3FED] to-[#EC5E3A] bg-clip-text text-transparent tracking-tight"
            >
              DigiFlow
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-2 text-sm text-white/50 font-[family-name:var(--font-space-grotesk)] text-center h-6"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={taglineIdx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.5 }}
                  ref={taglineRef}
                >
                  {tagline}
                </motion.span>
              </AnimatePresence>
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="rounded-2xl backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] p-6 md:p-8 shadow-2xl"
          >
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60 font-[family-name:var(--font-space-grotesk)] tracking-wide uppercase">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@vyomai.com"
                    required
                    className="w-full rounded-xl bg-white/[0.06] border border-white/[0.1] py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-300 focus:border-[#7C3FED] focus:ring-1 focus:ring-[#7C3FED]/30"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-white/60 font-[family-name:var(--font-space-grotesk)] tracking-wide uppercase">
                    Password
                  </label>
                  <a href="/forgot-password" className="text-xs text-[#7C3FED] hover:text-[#EC5E3A] transition-colors">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl bg-white/[0.06] border border-white/[0.1] py-3 pl-10 pr-10 text-sm text-white placeholder:text-white/25 outline-none transition-all duration-300 focus:border-[#7C3FED] focus:ring-1 focus:ring-[#7C3FED]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#7C3FED] to-[#EC5E3A] py-3 text-sm font-semibold text-white shadow-lg shadow-[#7C3FED]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#7C3FED]/30 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 text-xs text-white/30 bg-[#0f0a1a] md:bg-transparent">
                  or continue with
                </span>
              </div>
            </div>

            <motion.button
              onClick={handleGoogleLogin}
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-white/[0.06] border border-white/[0.1] py-3 text-sm text-white/80 hover:text-white hover:bg-white/[0.1] transition-all duration-300 disabled:opacity-60"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </motion.button>

            <p className="mt-6 text-center text-sm text-white/40">
              Don&apos;t have an account?{' '}
              <a href="/register" className="font-medium text-[#7C3FED] hover:text-[#EC5E3A] transition-colors">
                Sign up
              </a>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="mt-6 flex justify-center gap-3"
          >
            <a href="/en" className="text-xs text-white/20 hover:text-white/40 transition-colors">EN</a>
            <span className="text-xs text-white/10">|</span>
            <a href="/ne" className="text-xs text-white/20 hover:text-white/40 transition-colors">NE</a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
