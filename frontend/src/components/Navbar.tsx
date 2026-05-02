import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, LogIn, LogOut, Sparkles, Accessibility,
} from 'lucide-react';
import { Logo } from './Logo';
import { useUserContext } from '../hooks/useUserContext';
import { useLocalizedTexts } from '../hooks/useLocalizedTexts';
import { ROLE_LABELS } from '../data/checklist';
import { cn } from '../utils/cn';

const MAIN_NAV_LINKS = [
  { to: '/assistant', label: 'AI Assistant' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/simulator', label: 'Simulator' },
  { to: '/checklist', label: 'Checklist' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/myth-vs-fact', label: 'Myth vs Fact' },
  { to: '/evaluation', label: 'Evaluation' },
] as const;

/** Module-level frozen list for translation batching — order MUST match Navbar usage below. */
const NAV_I18N_STRINGS = [
  ...MAIN_NAV_LINKS.map((l) => l.label),
  'Admin',
  'Logout',
  'Sign in',
  'Log out',
  'Open accessibility settings',
] as const;

export const Navbar = ({ onOpenA11y }: { onOpenA11y: () => void }) => {
  const [open, setOpen] = useState(false);
  const { user, logout, ctx } = useUserContext();
  const navigate = useNavigate();
  const localized = useLocalizedTexts(NAV_I18N_STRINGS);

  const navLen = MAIN_NAV_LINKS.length;
  const navDisplay = MAIN_NAV_LINKS.map((_, i) => localized[i] ?? MAIN_NAV_LINKS[i].label);
  const adminLabel = localized[navLen] ?? 'Admin';
  const logoutLabel = localized[navLen + 1] ?? 'Logout';
  const signInLabel = localized[navLen + 2] ?? 'Sign in';
  const logOutMobileLabel = localized[navLen + 3] ?? 'Log out';
  const a11yLabel = localized[navLen + 4] ?? 'Open accessibility settings';

  return (
    <header className="sticky top-0 z-40">
      <div className="absolute inset-0 bg-navy-950/70 backdrop-blur-xl border-b border-white/10 -z-10" />
      <nav
        className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 h-16"
        aria-label="Main"
      >
        <Logo size="md" />

        <ul className="hidden lg:flex items-center gap-1">
          {MAIN_NAV_LINKS.map((n, i) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-white/10 text-white shadow-glow'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  )
                }
              >
                {navDisplay[i]}
              </NavLink>
            </li>
          ))}
          {user?.role === 'admin' && (
            <li>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-accent-pink text-white'
                      : 'text-accent-pink hover:bg-white/5'
                  )
                }
              >
                {adminLabel}
              </NavLink>
            </li>
          )}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenA11y}
            className="btn-ghost !px-3 !py-2"
            aria-label={a11yLabel}
            title={a11yLabel}
          >
            <Accessibility size={18} />
          </button>
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <span className="chip">
                <Sparkles size={12} /> {ROLE_LABELS[ctx.role]}
              </span>
              <button type="button" onClick={logout} className="btn-ghost" title={logoutLabel}>
                <LogOut size={16} /> <span className="hidden md:inline">{logoutLabel}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn-primary hidden sm:inline-flex"
            >
              <LogIn size={16} /> {signInLabel}
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden btn-ghost !px-3 !py-2"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden border-t border-white/10 bg-navy-900/95 backdrop-blur-xl"
          >
            <ul className="px-4 py-3 space-y-1">
              {MAIN_NAV_LINKS.map((n, i) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'block px-3 py-2.5 rounded-xl text-sm font-medium',
                        isActive ? 'bg-brand-600/30 text-white' : 'text-slate-300 hover:bg-white/5'
                      )
                    }
                  >
                    {navDisplay[i]}
                  </NavLink>
                </li>
              ))}
              {user?.role === 'admin' && (
                <li>
                  <NavLink
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-sm font-medium text-accent-pink"
                  >
                    {adminLabel}
                  </NavLink>
                </li>
              )}
              <li className="pt-2 flex gap-2">
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="btn-ghost w-full"
                  >
                    <LogOut size={16} /> {logOutMobileLabel}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/login');
                      setOpen(false);
                    }}
                    className="btn-primary w-full"
                  >
                    <LogIn size={16} /> {signInLabel}
                  </button>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
