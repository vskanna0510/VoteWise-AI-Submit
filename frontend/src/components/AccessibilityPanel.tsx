import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, Contrast, BookOpen, Mic, Languages } from 'lucide-react';
import { useUserContext } from '../hooks/useUserContext';
import { useLocalizedTexts } from '../hooks/useLocalizedTexts';
import type { Language } from '../data/types';

const FONT_SIZES: Array<{ id: 'sm' | 'md' | 'lg' | 'xl'; label: string }> = [
  { id: 'sm', label: 'Small' },
  { id: 'md', label: 'Medium' },
  { id: 'lg', label: 'Large' },
  { id: 'xl', label: 'X-Large' },
];

const LANGUAGES: Array<{ id: Language; label: string }> = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिन्दी' },
  { id: 'ta', label: 'தமிழ்' },
  { id: 'te', label: 'తెలుగు' },
  { id: 'bn', label: 'বাংলা' },
  { id: 'mr', label: 'मराठी' },
];

/** Order mirrors JSX below — translate together when language changes */
const ACCESSIBILITY_COPY = [
  'Accessibility',
  'Close accessibility panel',
  'Accessibility settings',
  'Font size',
  ...FONT_SIZES.map((f) => f.label),
  'High contrast',
  'Pure black + white for max readability',
  'Dyslexia-friendly font',
  'Switch UI to OpenDyslexic / Comic Sans',
  'Voice input (placeholder)',
  'Enable mic button in chat (browser STT)',
  'Language',
  'Interface language',
  'Translations are requested through the VoteWise server (proxied to Google). Add GOOGLE_TRANSLATE_API_KEY to backend .env with your Cloud Translation API key.',
] as const;

export const AccessibilityPanel = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { ctx, setAccessibility, setLanguage } = useUserContext();
  const a = ctx.accessibilityPreferences;
  const lc = useLocalizedTexts(ACCESSIBILITY_COPY);

  const [
    accessibilityTitle,
    closePanelAria,
    dialogAriaLabel,
    fontSectionTitle,
    szSmall,
    szMedium,
    szLarge,
    szXLarge,
    highContrastLbl,
    highContrastDesc,
    dyslexiaLbl,
    dyslexiaDesc,
    voiceLbl,
    voiceDesc,
    languageLbl,
    languageSelectAria,
    translateHint,
  ] = lc;

  const szLabels = [szSmall, szMedium, szLarge, szXLarge];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label={closePanelAria}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-label={dialogAriaLabel}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[380px] z-50 glass-strong p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-white">{accessibilityTitle}</h2>
              <button type="button" onClick={onClose} className="btn-ghost !px-2 !py-2" aria-label={closePanelAria}>
                <X size={18} />
              </button>
            </div>

            <section className="space-y-6">
              <div>
                <h3 className="label flex items-center gap-2"><Type size={14} /> {fontSectionTitle}</h3>
                <div className="grid grid-cols-4 gap-2">
                  {FONT_SIZES.map((f, idx) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setAccessibility({ fontSize: f.id })}
                      className={`btn !py-2 !px-2 text-xs ${
                        a.fontSize === f.id
                          ? 'bg-gradient-to-r from-brand-600 to-accent-pink text-white'
                          : 'bg-white/5 border border-white/10'
                      }`}
                      aria-pressed={a.fontSize === f.id}
                    >
                      {szLabels[idx]}
                    </button>
                  ))}
                </div>
              </div>

              <Toggle
                icon={<Contrast size={16} />}
                label={highContrastLbl}
                description={highContrastDesc}
                checked={a.highContrast}
                onChange={(v) => setAccessibility({ highContrast: v })}
              />

              <Toggle
                icon={<BookOpen size={16} />}
                label={dyslexiaLbl}
                description={dyslexiaDesc}
                checked={a.dyslexiaFont}
                onChange={(v) => setAccessibility({ dyslexiaFont: v })}
              />

              <Toggle
                icon={<Mic size={16} />}
                label={voiceLbl}
                description={voiceDesc}
                checked={a.voiceInput}
                onChange={(v) => setAccessibility({ voiceInput: v })}
              />

              <div>
                <h3 className="label flex items-center gap-2"><Languages size={14} /> {languageLbl}</h3>
                <select
                  value={ctx.language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="input"
                  aria-label={languageSelectAria}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id} className="bg-navy-800">
                      {l.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-400">{translateHint}</p>
              </div>
            </section>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

const Toggle = ({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label className="flex items-start justify-between gap-3 cursor-pointer">
    <div className="flex-1">
      <div className="flex items-center gap-2 text-slate-100 font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
    <span
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition ${
        checked ? 'bg-gradient-to-r from-brand-500 to-accent-pink' : 'bg-white/10'
      }`}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
      />
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </span>
  </label>
);
