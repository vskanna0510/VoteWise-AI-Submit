import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Trash2, Edit3, Save, X, Users, MessageSquare, ShieldAlert, BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { fetchFaqs, createFaq, updateFaq, deleteFaq } from '../services/faq';
import { fetchAnalytics, type AdminAnalytics } from '../services/admin';
import { fetchTimeline, upsertStep } from '../services/timeline';
import type { FAQ, TimelineStep } from '../data/types';
import { useKeyedStrings } from '../hooks/useLocalizedTexts';

const AD: Record<string, string> = {
  eyebrow: 'Admin Dashboard',
  titleLead: 'Manage VoteWise ',
  titleGlow: 'behind the scenes.',
  subtitle: 'Curate FAQs, edit timeline content, and monitor neutral-assistant analytics.',
};

export const AdminPage = () => {
  const u = useKeyedStrings(AD);
  return (
    <div>
      <PageHeader
        eyebrow={u.eyebrow}
        title={
          <>
            {u.titleLead}
            <span className="gradient-text">{u.titleGlow}</span>
          </>
        }
        subtitle={u.subtitle}
      />

      <AnalyticsBlock />
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <FaqManager />
        <TimelineManager />
      </div>
    </div>
  );
};

const Stat = ({
  icon: Icon, label, value, accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent: string;
}) => (
  <Card>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
      <Icon size={18} className="text-white" />
    </div>
    <p className="mt-3 text-xs text-slate-400 uppercase tracking-wider">{label}</p>
    <p className="text-3xl font-display font-bold text-white">{value}</p>
  </Card>
);

const AnalyticsBlock = () => {
  const [a, setA] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics().then(setA).catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return <Card className="border-rose-400/30 bg-rose-500/5 text-rose-200">⚠️ {error}</Card>;
  }
  if (!a) {
    return <p className="text-slate-400">Loading analytics…</p>;
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={Users} label="Total users" value={a.totalUsers} accent="bg-gradient-to-br from-brand-600 to-accent-pink" />
        <Stat icon={MessageSquare} label="Chat messages" value={a.totalChats} accent="bg-gradient-to-br from-accent-cyan to-brand-500" />
        <Stat icon={ShieldAlert} label="Refusals" value={`${a.refusedChats} (${a.refusalRate}%)`} accent="bg-gradient-to-br from-amber-500 to-rose-500" />
        <Stat icon={BarChart3} label="FAQ views" value={a.totalFaqViews} accent="bg-gradient-to-br from-accent-emerald to-accent-cyan" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <h3 className="font-display font-bold text-white mb-3">Top intents</h3>
          <ul className="space-y-2">
            {a.intentDistribution.length === 0 && <p className="text-sm text-slate-400">No data yet.</p>}
            {a.intentDistribution.map((d) => {
              const max = a.intentDistribution[0]?.count ?? 1;
              const pct = (d.count / max) * 100;
              return (
                <li key={d._id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-200">{d._id}</span>
                    <span className="text-slate-400">{d.count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      className="h-full bg-gradient-to-r from-brand-500 to-accent-pink"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card>
          <h3 className="font-display font-bold text-white mb-3">Users by role</h3>
          <ul className="space-y-2">
            {a.roleDistribution.length === 0 && <p className="text-sm text-slate-400">No data yet.</p>}
            {a.roleDistribution.map((d) => {
              const max = a.roleDistribution[0]?.count ?? 1;
              const pct = (d.count / max) * 100;
              return (
                <li key={d._id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-200">{d._id}</span>
                    <span className="text-slate-400">{d.count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      className="h-full bg-gradient-to-r from-accent-cyan to-brand-500"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
};

const FaqManager = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [editing, setEditing] = useState<Partial<FAQ> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => fetchFaqs().then(setFaqs).catch((e: Error) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing || !editing.question || !editing.answer) return;
    try {
      if (editing._id) {
        await updateFaq(editing._id, editing);
      } else {
        await createFaq({
          question: editing.question,
          answer: editing.answer,
          category: (editing.category as FAQ['category']) ?? 'general',
          tags: editing.tags ?? [],
          isActive: true,
        });
      }
      setEditing(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    await deleteFaq(id);
    await load();
  };

  return (
    <Card className="!p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl font-bold text-white">FAQs</h3>
        <button
          onClick={() =>
            setEditing({
              question: '',
              answer: '',
              category: 'general',
              tags: [],
              isActive: true,
            })
          }
          className="btn-primary !py-1.5"
        >
          <Plus size={14} /> New
        </button>
      </div>
      {error && <p className="text-rose-300 text-sm mb-2">{error}</p>}
      <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {faqs.map((f) => (
          <li key={f._id} className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white">{f.question}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{f.answer}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="chip text-[10px]">{f.category}</span>
                  {f.tags.map((t) => (
                    <span key={t} className="chip text-[10px]">#{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-1">
                <button onClick={() => setEditing(f)} className="btn-ghost !p-1.5" aria-label="Edit FAQ">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => f._id && remove(f._id)} className="btn-ghost !p-1.5 text-rose-300" aria-label="Delete FAQ">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <div className="mt-4 p-4 rounded-2xl border border-brand-400/40 bg-brand-700/10 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white">{editing._id ? 'Edit FAQ' : 'New FAQ'}</h4>
            <button onClick={() => setEditing(null)} className="btn-ghost !p-1.5"><X size={14} /></button>
          </div>
          <input
            value={editing.question ?? ''}
            onChange={(e) => setEditing({ ...editing, question: e.target.value })}
            className="input"
            placeholder="Question"
          />
          <textarea
            value={editing.answer ?? ''}
            onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
            className="input min-h-[100px]"
            placeholder="Answer"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={editing.category ?? 'general'}
              onChange={(e) => setEditing({ ...editing, category: e.target.value as FAQ['category'] })}
              className="input"
            >
              {['general', 'registration', 'voting', 'eligibility', 'process'].map((c) => (
                <option key={c} value={c} className="bg-navy-800">{c}</option>
              ))}
            </select>
            <input
              value={(editing.tags ?? []).join(', ')}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                })
              }
              className="input"
              placeholder="tags, comma, separated"
            />
          </div>
          <button onClick={save} className="btn-primary w-full"><Save size={14} /> Save FAQ</button>
        </div>
      )}
    </Card>
  );
};

const TimelineManager = () => {
  const [steps, setSteps] = useState<TimelineStep[]>([]);
  const [editing, setEditing] = useState<Partial<TimelineStep> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => fetchTimeline().then(setSteps).catch((e: Error) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!editing) return;
    try {
      await upsertStep(editing);
      setEditing(null);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  return (
    <Card className="!p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl font-bold text-white">Timeline</h3>
        <button
          onClick={() =>
            setEditing({
              order: steps.length + 1,
              key: '',
              title: '',
              shortDescription: '',
              longDescription: '',
              durationDays: 1,
              icon: 'Calendar',
              color: '#8b5cf6',
            })
          }
          className="btn-primary !py-1.5"
        >
          <Plus size={14} /> New
        </button>
      </div>
      {error && <p className="text-rose-300 text-sm mb-2">{error}</p>}
      <ol className="space-y-2">
        {steps.map((s) => (
          <li key={s._id ?? s.key} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-white">
                <span className="text-brand-300 mr-1">{s.order}.</span>
                {s.title}
              </p>
              <p className="text-xs text-slate-400">{s.shortDescription}</p>
            </div>
            <button onClick={() => setEditing(s)} className="btn-ghost !p-1.5"><Edit3 size={14} /></button>
          </li>
        ))}
      </ol>

      {editing && (
        <div className="mt-4 p-4 rounded-2xl border border-brand-400/40 bg-brand-700/10 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white">{editing._id ? 'Edit step' : 'New step'}</h4>
            <button onClick={() => setEditing(null)} className="btn-ghost !p-1.5"><X size={14} /></button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" value={editing.order ?? 1} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} className="input" placeholder="Order" />
            <input value={editing.key ?? ''} onChange={(e) => setEditing({ ...editing, key: e.target.value })} className="input col-span-2" placeholder="key (e.g. mcc)" />
          </div>
          <input value={editing.title ?? ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="input" placeholder="Title" />
          <input value={editing.shortDescription ?? ''} onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })} className="input" placeholder="Short description" />
          <textarea value={editing.longDescription ?? ''} onChange={(e) => setEditing({ ...editing, longDescription: e.target.value })} className="input min-h-[100px]" placeholder="Long description" />
          <div className="grid grid-cols-3 gap-2">
            <input type="number" value={editing.durationDays ?? 1} onChange={(e) => setEditing({ ...editing, durationDays: Number(e.target.value) })} className="input" placeholder="Days" />
            <input value={editing.icon ?? 'Calendar'} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className="input" placeholder="Icon" />
            <input value={editing.color ?? '#8b5cf6'} onChange={(e) => setEditing({ ...editing, color: e.target.value })} className="input" placeholder="#hex" />
          </div>
          <button onClick={save} className="btn-primary w-full"><Save size={14} /> Save step</button>
        </div>
      )}
    </Card>
  );
};
