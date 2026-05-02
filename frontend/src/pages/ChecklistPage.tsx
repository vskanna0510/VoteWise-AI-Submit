import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CalendarPlus, MapPin, Search, ExternalLink } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { CHECKLISTS, ROLE_LABELS, ROLE_DISPLAY_ORDER, ROLE_DISPLAY_ENGLISH } from '../data/checklist';
import { useUserContext } from '../hooks/useUserContext';
import { useKeyedStrings, useLocalizedTexts } from '../hooks/useLocalizedTexts';
import { useTranslatedChecklist } from '../hooks/useTranslatedEntities';
import { addEventToCalendar } from '../services/calendar';
import { findNearbyBooths, buildEmbedUrl, mapsSearchHref, isMapsConfigured, type PollingBooth } from '../services/maps';
import type { UserRole } from '../data/types';

const STORAGE_KEY = 'votewise.checklist';

const CK: Record<string, string> = {
  eyebrow: 'Voter Checklist',
  titleLead: 'Your personal ',
  titleGlow: 'voting plan.',
  sub: 'Tick off each item, add reminders to your Google Calendar, and locate your polling booth.',
  planPrefix: 'Plan for:',
  switchRoleAria: 'Switch role',
  completeMid: 'of',
  completeSuffix: 'complete',
  boothTitle: 'Find your polling booth',
  boothMapsNote:
    'Tap search to move the map. In Google Cloud, enable Maps Embed API, turn on billing for the project, and restrict this browser key by HTTP referrer (e.g. http://localhost:5173/* plus your deployed URL).',
  boothPlaceholder: 'Pin code or area',
  boothSearchAria: 'Booth search',
  pollingMapIframe: 'Polling booth map',
  kmAway: 'km away',
  openInMapsTab: 'Open in Google Maps (new tab)',
  embedHintNoKey:
    'If the map area is blank, use the link below — embeds usually need VITE_GOOGLE_MAPS_API_KEY (Maps Embed API) in production.',
  mapsReferrerTip:
    'If you see Google\'s red error banner in the map: Edit your Maps API key → Application restrictions → HTTP referrers. Add BOTH http://localhost:5173/* and http://127.0.0.1:5173/* (exact host you use). Enable Maps Embed API + billing.',
  electionDayReminder: 'Election Day reminder',
  electionDayBody: 'Add a single click reminder for the next election day.',
  addCalElection: 'Add to Google Calendar',
  remindBtn: 'Remind',
  remindTitle: 'Add to Google Calendar',
};

const loadDone = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, boolean>;
  } catch {
    return {};
  }
};

export const ChecklistPage = () => {
  const { ctx, setRole, setChecklistProgress } = useUserContext();
  const u = useKeyedStrings(CK);
  const roleLbls = useLocalizedTexts(ROLE_DISPLAY_ENGLISH);
  const [done, setDone] = useState<Record<string, boolean>>(loadDone);
  const [boothQuery, setBoothQuery] = useState('');
  /** Map iframe only commits on Search — avoids reloading the embed on every keystroke. */
  const [committedMapQuery, setCommittedMapQuery] = useState('');
  const [booths, setBooths] = useState<PollingBooth[]>([]);
  const [loadingBooths, setLoadingBooths] = useState(false);

  const rawItems = CHECKLISTS[ctx.role];
  const items = useTranslatedChecklist(rawItems, ctx.language);
  const roleLabelTranslated =
    roleLbls[ROLE_DISPLAY_ORDER.indexOf(ctx.role)] ?? ROLE_LABELS[ctx.role];

  const total = items.length;
  const completed = items.filter((it) => done[it.id]).length;
  const pct = useMemo(() => (total > 0 ? (completed / total) * 100 : 0), [completed, total]);

  useEffect(() => {
    setChecklistProgress(Math.round(pct));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
  }, [done, pct, setChecklistProgress]);

  const toggle = (id: string) => setDone((p) => ({ ...p, [id]: !p[id] }));

  const embedSrc = buildEmbedUrl(committedMapQuery.trim() ? committedMapQuery : 'India');

  const findBooths = async () => {
    setLoadingBooths(true);
    setCommittedMapQuery(boothQuery.trim());
    try {
      const list = await findNearbyBooths(boothQuery.trim() || '');
      setBooths(list);
    } finally {
      setLoadingBooths(false);
    }
  };

  const labelForRole = (r: UserRole) =>
    roleLbls[ROLE_DISPLAY_ORDER.indexOf(r)] ?? ROLE_LABELS[r];

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
        subtitle={u.sub}
      />

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center gap-2 justify-between mb-4">
              <h3 className="font-display text-xl font-bold text-white">
                {u.planPrefix} {roleLabelTranslated}
              </h3>
              <select
                value={ctx.role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="input !w-auto !py-1.5 text-sm"
                aria-label={u.switchRoleAria}
              >
                {ROLE_DISPLAY_ORDER.filter((r) => CHECKLISTS[r]).map((r) => (
                  <option key={r} value={r} className="bg-navy-800">
                    {labelForRole(r)}
                  </option>
                ))}
              </select>
            </div>
            <ProgressBar
              value={pct}
              label={`${completed} ${u.completeMid} ${total} ${u.completeSuffix}`}
            />

            <ul className="mt-6 space-y-2">
              {items.map((item, i) => {
                const isDone = !!done[item.id];
                return (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition ${
                      isDone
                        ? 'bg-emerald-500/5 border-emerald-400/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className={`shrink-0 mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition ${
                        isDone
                          ? 'bg-emerald-400 border-emerald-400 text-navy-900'
                          : 'border-white/30 hover:border-brand-400'
                      }`}
                      aria-pressed={isDone}
                      aria-label={
                        isDone ? `Mark ${item.title} as not done` : `Mark ${item.title} as done`
                      }
                    >
                      {isDone && <Check size={14} strokeWidth={3} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        addEventToCalendar({
                          title: item.reminderTitle,
                          description: item.description,
                          startISO: new Date(Date.now() + 86_400_000).toISOString(),
                          durationMinutes: 30,
                        })
                      }
                      className="btn-ghost !px-2.5 !py-1.5 text-xs whitespace-nowrap"
                      title={u.remindTitle}
                    >
                      <CalendarPlus size={14} />{' '}
                      <span className="hidden sm:inline">{u.remindBtn}</span>
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <h3 className="font-display text-lg font-bold text-white mb-2 flex items-center gap-2">
              <MapPin size={16} className="text-brand-300" /> {u.boothTitle}
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              {isMapsConfigured() ? u.boothMapsNote : u.embedHintNoKey}
            </p>
            <div className="flex gap-2">
              <input
                value={boothQuery}
                onChange={(e) => setBoothQuery(e.target.value)}
                placeholder={u.boothPlaceholder}
                className="input"
                aria-label={u.boothSearchAria}
              />
              <button
                type="button"
                onClick={findBooths}
                className="btn-primary !px-3"
                disabled={loadingBooths}
              >
                <Search size={16} />
              </button>
            </div>
            <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-white/5 min-h-[260px] min-w-[260px]">
              <iframe
                title={u.pollingMapIframe}
                key={embedSrc}
                src={embedSrc}
                width="100%"
                height={320}
                className="block w-full border-0 bg-navy-900"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                loading="eager"
              />
            </div>
            {isMapsConfigured() && (
              <p className="mt-2 text-[11px] text-slate-500 leading-snug">{u.mapsReferrerTip}</p>
            )}
            <div className="mt-3 flex flex-col gap-2">
              <a
                href={mapsSearchHref(boothQuery.trim() || committedMapQuery)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-center text-sm py-2.5"
              >
                <ExternalLink size={16} className="inline-block align-text-bottom mr-1.5" />
                {u.openInMapsTab}
              </a>
              {!isMapsConfigured() && (
                <p className="text-[11px] text-slate-500 leading-snug">
                  Set{' '}
                  <code className="text-brand-300/90">VITE_GOOGLE_MAPS_API_KEY</code> for the embedded map
                  — enable Maps Embed API and allow your deployed origin under API restrictions.
                </p>
              )}
            </div>
            {booths.length > 0 && (
              <ul className="mt-3 space-y-2 text-sm">
                {booths.map((b) => (
                  <li key={b.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <p className="font-medium text-white">{b.name}</p>
                    <p className="text-xs text-slate-400">{b.address}</p>
                    {typeof b.distanceKm === 'number' && (
                      <p className="text-[11px] text-brand-300 mt-1">
                        {b.distanceKm} {u.kmAway}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h3 className="font-display text-lg font-bold text-white mb-1">{u.electionDayReminder}</h3>
            <p className="text-sm text-slate-400 mb-3">{u.electionDayBody}</p>
            <button
              type="button"
              onClick={() =>
                addEventToCalendar({
                  title: 'Election Day - Vote!',
                  description: 'Carry your EPIC or any approved ID.',
                  startISO: new Date(Date.now() + 30 * 86_400_000).toISOString(),
                  durationMinutes: 60,
                })
              }
              className="btn-primary w-full"
            >
              <CalendarPlus size={16} /> {u.addCalElection}
            </button>
          </Card>
        </aside>
      </div>
    </div>
  );
};
