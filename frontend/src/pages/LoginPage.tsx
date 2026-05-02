import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Sparkles } from 'lucide-react';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { useUserContext } from '../hooks/useUserContext';
import { signInWithGoogle } from '../services/firebase';

export const LoginPage = () => {
  const { login } = useUserContext();
  const navigate = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('admin@votewise.ai');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await login(email, password);
      const dest = (loc.state as { from?: string } | null)?.from ?? '/';
      navigate(dest, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg.includes('401') ? 'Invalid email or password.' : msg);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const u = await signInWithGoogle();
      setNotice(
        `Signed in with Google as ${u.email}. Use email & password above for your VoteWise account (JWT / quiz / admin).`,
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <Card glow className="!p-8">
          <h1 className="font-display text-2xl font-bold text-white text-center">Welcome back</h1>
          <p className="text-center text-sm text-slate-400 mt-1">
            Sign in to track your checklist, quiz score, and reminders.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  className="input pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  className="input pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <p className="text-rose-300 text-sm bg-rose-500/10 border border-rose-400/30 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
            {notice && (
              <p className="text-emerald-200 text-sm bg-emerald-500/10 border border-emerald-400/30 rounded-xl px-3 py-2">
                {notice}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              <LogIn size={16} /> {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-slate-500">
            <div className="flex-1 h-px bg-white/10" />
            <span>OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button onClick={handleGoogle} disabled={busy} className="btn-ghost w-full">
            <Sparkles size={14} /> Continue with Google
          </button>

          <p className="mt-4 text-xs text-center text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-300 hover:text-white">Create one</Link>
          </p>

          <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <p className="font-semibold text-slate-200">Demo logins (auto-filled):</p>
            <p>• admin@votewise.ai / Admin@123</p>
            <p>• voter@votewise.ai / Voter@123</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
