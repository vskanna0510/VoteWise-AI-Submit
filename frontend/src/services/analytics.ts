/**
 * Google Analytics 4 placeholder.
 * Drop-in: load gtag.js and call `window.gtag('config', VITE_GA_MEASUREMENT_ID)`.
 */

const ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const isAnalyticsConfigured = (): boolean => Boolean(ID);

let loaded = false;
const ensureLoaded = (): void => {
  if (loaded || !ID) return;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`;
  document.head.appendChild(s);
  // @ts-expect-error gtag global
  window.dataLayer = window.dataLayer || [];
  // @ts-expect-error gtag global
  window.gtag = function gtag() {
    // @ts-expect-error gtag global
    window.dataLayer.push(arguments);
  };
  // @ts-expect-error gtag global
  window.gtag('js', new Date());
  // @ts-expect-error gtag global
  window.gtag('config', ID);
  loaded = true;
};

export const trackPage = (path: string): void => {
  if (!ID) {
    // eslint-disable-next-line no-console
    console.debug('[analytics:mock] page', path);
    return;
  }
  ensureLoaded();
  // @ts-expect-error gtag global
  window.gtag('event', 'page_view', { page_path: path });
};

export const trackEvent = (name: string, params: Record<string, unknown> = {}): void => {
  if (!ID) {
    // eslint-disable-next-line no-console
    console.debug('[analytics:mock] event', name, params);
    return;
  }
  ensureLoaded();
  // @ts-expect-error gtag global
  window.gtag('event', name, params);
};
