import { useEffect } from 'react';
import { useUserContext } from './useUserContext';

/** Applies accessibility preferences as classes on <html>. */
export const useAccessibilityEffects = (): void => {
  const { ctx } = useUserContext();
  const { fontSize, highContrast, dyslexiaFont } = ctx.accessibilityPreferences;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-scale-sm', 'font-scale-md', 'font-scale-lg', 'font-scale-xl');
    root.classList.add(`font-scale-${fontSize}`);

    root.classList.toggle('theme-high-contrast', highContrast);
    root.classList.toggle('font-dyslexic', dyslexiaFont);
  }, [fontSize, highContrast, dyslexiaFont]);
};
