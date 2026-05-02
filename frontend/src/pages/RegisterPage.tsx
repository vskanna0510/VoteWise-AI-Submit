import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { useUserContext } from '../hooks/useUserContext';
import { ROLE_LABELS } from '../data/checklist';
import type { UserRole } from '../data/types';

export const RegisterPage = () => {
  const { register } = useUserContext();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('first_time_voter');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register({ name, email, password, role });
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo size="lg" />
        </div>
        <Card glow className="!p-8">
          <h1 className="font-display text-2xl font-bold text-white text-center">Create your account</h1>
          <p className="text-center text-sm text-slate-400 mt-1">No personal data is shared with parties.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div>
              <label className="label">Name</label>
              <div className="relative">
                <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input pl-9" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" className="input pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" className="input pl-9" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">Min 8 chars · 1 uppercase · 1 lowercase · 1 digit.</p>
            </div>
            <div>
              <label className="label">I am a…</label>
              <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="input">
                {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                  <option key={r} value={r} className="bg-navy-800">{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="text-rose-300 text-sm bg-rose-500/10 border border-rose-400/30 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              <UserPlus size={16} /> {busy ? 'Creating…' : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-xs text-center text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-300 hover:text-white">Sign in</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};
