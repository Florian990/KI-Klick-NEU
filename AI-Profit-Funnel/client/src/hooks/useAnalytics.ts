import { useCallback, useEffect, useRef, useState } from 'react';

const VISITOR_ID_KEY = 'ki_klick_visitor_id';
const TEST_VISITOR_ID_KEY = 'ki_klick_visitor_id_test';
const TEST_TOKEN_KEY = 'ki_klick_test_token';

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch {}
}
function safeRemove(key: string): void {
  try { localStorage.removeItem(key); } catch {}
}

// Test mode lets the admin run the funnel themselves without polluting the stats and
// without creating a real lead/CRM entry. It is gated by a SECRET token: the same value
// must be configured server-side as ADMIN_TEST_TOKEN, otherwise the server ignores it
// (so a random visitor can never suppress a real lead). The token is obtained either via
// the authenticated admin dashboard toggle, or by opening ?test=<token> once on a device.
export function getTestToken(): string | null {
  const t = safeGet(TEST_TOKEN_KEY);
  return t && t.length > 0 ? t : null;
}

export function isTestMode(): boolean {
  return getTestToken() !== null;
}

export function setTestToken(token: string | null): void {
  if (token && token.length > 0) safeSet(TEST_TOKEN_KEY, token);
  else safeRemove(TEST_TOKEN_KEY);
}

// Allow activating/deactivating test mode via URL:
//   ?test=<token>  -> activate on this device (token persists in localStorage)
//   ?test=0 | off | false | (empty) -> deactivate
function syncTestFlagFromUrl(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has('test')) {
      const v = (params.get('test') || '').trim();
      if (v === '' || v === '0' || v === 'false' || v === 'off') setTestToken(null);
      else setTestToken(v);
    }
  } catch {}
}

function randomId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreateVisitorId(): string {
  const test = isTestMode();
  const key = test ? TEST_VISITOR_ID_KEY : VISITOR_ID_KEY;
  let visitorId = safeGet(key);
  if (!visitorId) {
    visitorId = (test ? 'test-' : '') + randomId();
    safeSet(key, visitorId);
  }
  return visitorId;
}

export function useAnalytics() {
  const visitorIdRef = useRef<string | null>(null);
  const [isTest, setIsTest] = useState(false);

  useEffect(() => {
    syncTestFlagFromUrl();
    setIsTest(isTestMode());
    visitorIdRef.current = getOrCreateVisitorId();
  }, []);

  const trackPageView = useCallback(async (page: string) => {
    const visitorId = visitorIdRef.current || getOrCreateVisitorId();
    try {
      await fetch('/api/analytics/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          page,
          referrer: document.referrer || null,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }, []);

  const trackEvent = useCallback(async (eventType: string, eventData?: Record<string, any>, page?: string) => {
    const visitorId = visitorIdRef.current || getOrCreateVisitorId();
    try {
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          eventType,
          eventData: eventData ? JSON.stringify(eventData) : null,
          page: page || window.location.pathname,
        }),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, []);

  return { trackPageView, trackEvent, isTest };
}
