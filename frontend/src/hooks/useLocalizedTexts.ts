import { useEffect, useMemo, useState } from 'react';
import type { Language } from '../data/types';
import { useUserContext } from './useUserContext';
import { translateBatch } from '../services/translate';

/**
 * Translates stable English UI strings when the user selects a non-English language.
 * Pass tuples from module scope (e.g. `as const`), not inlined arrays inside the component body.
 */
export function useLocalizedTexts(englishLabels: readonly string[]): string[] {
  const {
    ctx: { language },
  } = useUserContext();

  const labels = useMemo(() => [...englishLabels], [englishLabels]);
  const [out, setOut] = useState<string[]>(() => [...englishLabels]);

  useEffect(() => {
    if (language === 'en') {
      setOut(labels);
      return undefined;
    }
    let cancel = false;
    void translateBatch(labels, language as Language).then((next) => {
      if (!cancel) setOut(next.length === labels.length ? next : labels);
    });
    return () => {
      cancel = true;
    };
  }, [language, labels]);

  return out;
}

/**
 * Keyed translations — pass a frozen object literal from module scope so key order stays insertion-stable.
 */
export function useKeyedStrings<K extends string>(defs: Record<K, string>): Record<K, string> {
  const entries = useMemo(() => Object.entries(defs) as [K, string][], [defs]);
  const vals = useMemo(() => entries.map(([, v]) => v), [entries]);
  const tr = useLocalizedTexts(vals);

  return useMemo(
    () => Object.fromEntries(entries.map(([k], i) => [k, tr[i] ?? defs[k]])) as Record<K, string>,
    [defs, entries, tr],
  );
}
