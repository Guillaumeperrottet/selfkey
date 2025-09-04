// Configuration des domaines pour la communication inter-domaines

export const DOMAINS = {
  SELFKEY: process.env.NODE_ENV === 'production' ? 'https://selfkey.ch' : 'http://localhost:3000',
  SELFCAMP: process.env.NODE_ENV === 'production' ? 'https://selfcamp.ch' : 'http://localhost:3000',
} as const;

export const API_ENDPOINTS = {
  AVAILABILITY: `${DOMAINS.SELFKEY}/api/public/availability`,
} as const;

export function isOnSelfcamp(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'selfcamp.ch' || hostname === 'www.selfcamp.ch';
}

export function isOnSelfkey(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'selfkey.ch' || hostname === 'www.selfkey.ch';
}
