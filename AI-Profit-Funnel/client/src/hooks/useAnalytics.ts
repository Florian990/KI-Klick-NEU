import { useCallback, useEffect, useRef } from 'react';

const VISITOR_ID_KEY = 'ki_klick_visitor_id';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

export function useAnalytics() {
  const visitorIdRef = useRef<string | null>(null);

  useEffect(() => {
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

  return { trackPageView, trackEvent };
}
