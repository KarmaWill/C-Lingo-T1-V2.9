const API_BASE = (
  import.meta.env.VITE_API_BASE_URL as string | undefined
)?.replace(/\/$/, '') || 'http://localhost:3000';

const TOKEN_KEY = 'clingo-user-token';

export function getApiBase(): string {
  return API_BASE;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function login(username: string, password: string) {
  const data = await apiFetch<{ token: string; user: { id: string; username: string; role: string } }>(
    '/api/auth/login',
    { method: 'POST', body: JSON.stringify({ username, password }) },
  );
  setToken(data.token);
  return data.user;
}

export async function register(username: string, password: string) {
  return apiFetch<{ message: string; username: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function submitFeedback(content: string, productCode = 'tablet_app') {
  return apiFetch('/api/feedback', {
    method: 'POST',
    body: JSON.stringify({ productCode, content }),
  });
}

export async function getProductConfig(code: string) {
  const data = await apiFetch<{ configs: Record<string, string> }>(
    `/api/products/${code}/config`,
  );
  return data.configs;
}
