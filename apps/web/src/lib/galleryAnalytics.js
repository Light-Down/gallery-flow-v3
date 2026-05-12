const DEFAULT_ENDPOINT = '/api/galerie/events';

function getAnalyticsEndpoint() {
  return import.meta.env.VITE_ANALYTICS_ENDPOINT || DEFAULT_ENDPOINT;
}

function isAnalyticsDisabled() {
  return import.meta.env.VITE_DISABLE_ANALYTICS === 'true';
}

function getSessionId() {
  if (typeof window === 'undefined') return null;

  const storageKey = 'galleryAnalyticsSessionId';
  const existing = window.sessionStorage.getItem(storageKey);
  if (existing) return existing;

  const nextId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.sessionStorage.setItem(storageKey, nextId);
  return nextId;
}

function getPageContext() {
  if (typeof window === 'undefined') return {};

  return {
    path: window.location.pathname,
    referrer: document.referrer || null,
    sessionId: getSessionId(),
  };
}

export function trackGalleryEvent(event) {
  if (isAnalyticsDisabled() || typeof window === 'undefined') return;

  const endpoint = getAnalyticsEndpoint();
  const payload = {
    ...getPageContext(),
    ...event,
  };
  const body = JSON.stringify(payload);

  try {
    const endpointUrl = new URL(endpoint, window.location.origin);

    if (endpointUrl.origin === window.location.origin && navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(endpointUrl.toString(), blob);
      return;
    }

    window.fetch(endpointUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      credentials: endpointUrl.origin === window.location.origin ? 'same-origin' : 'omit',
    }).catch(() => {});
  } catch {
    // Analytics must never interrupt gallery access.
  }
}
