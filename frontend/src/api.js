// Central API base URL.
// Local dev : VITE_API_URL unset  -> relative "/api/..." (Vite proxy -> localhost:4000)
// Production: VITE_API_URL=https://<your-backend>.onrender.com (no trailing slash)
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export const apiUrl = (path) =>
  API_BASE && typeof path === 'string' && path.startsWith('/api') ? `${API_BASE}${path}` : path;

// Make every existing fetch('/api/...') in the app hit the backend automatically.
if (API_BASE && typeof window !== 'undefined' && !window.__apiFetchPatched) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) =>
    originalFetch(typeof input === 'string' ? apiUrl(input) : input, init);
  window.__apiFetchPatched = true;
}
