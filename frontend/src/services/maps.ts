/**
 * Embedded map uses Maps Embed API (Search mode).
 * GCP: enable **Maps Embed API**, billing on; API key restricts by HTTP referrer (`http://localhost:5173/*`, prod domain).
 */

const RAW_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim() ?? '';

export const isMapsConfigured = (): boolean => Boolean(RAW_KEY);

export interface PollingBooth {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm?: number;
}

export const findNearbyBooths = async (
  query: string
): Promise<PollingBooth[]> => {
  // Mock data — replace with Places API call.
  const seed = query.length || 7;
  return [
    {
      id: 'b1',
      name: 'Govt. Higher Secondary School - Booth 142',
      address: '23, Sardar Patel Rd, ' + (query || 'your area'),
      lat: 28.6139 + seed * 0.0001,
      lng: 77.209 + seed * 0.0001,
      distanceKm: 0.6,
    },
    {
      id: 'b2',
      name: 'Municipal Library - Booth 98',
      address: '5, Tagore Lane, ' + (query || 'your area'),
      lat: 28.615,
      lng: 77.215,
      distanceKm: 1.1,
    },
    {
      id: 'b3',
      name: 'Community Hall - Booth 211',
      address: '15, Nehru Park, ' + (query || 'your area'),
      lat: 28.612,
      lng: 77.212,
      distanceKm: 1.4,
    },
  ];
};

/**
 * Embed URL when a key exists (Embed API).
 * Uses URLSearchParams so `key`, `q`, and optional params are encoded correctly.
 */
export function buildEmbedUrl(placeOrSearchQuery: string): string {
  const raw = placeOrSearchQuery?.trim();
  /** Single q string passed to Embed API (search mode). */
  const q =
    raw && raw !== 'India'
      ? (`polling booth ${raw}`.trim() || 'polling booth India')
      : 'polling booths in India';

  if (!RAW_KEY) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
  }

  const params = new URLSearchParams({
    key: RAW_KEY,
    q,
  });

  params.set('maptype', 'roadmap');

  /**
   * Google recommends bounding search with center+zoom OR geo in q.
   * Broad “India” search without bounds often behaves poorly inside the Embed iframe.
   */
  const broad = !raw || raw === 'India';
  if (broad) {
    params.set('center', '20.5937,78.9629');
    params.set('zoom', '5');
  } else {
    params.set('zoom', '12');
  }

  return `https://www.google.com/maps/embed/v1/search?${params.toString()}`;
}
/** Opens google.com/maps search (does not consume Embed quota). */
export const mapsSearchHref = (q: string): string => {
  const search = `polling booth ${q || ''}`.trim() || 'polling booth India';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(search)}`;
};

