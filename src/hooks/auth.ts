const AUTH_BASE = '/api/auth';

let refreshTimeoutId: number | null = null;

export function scheduleRefresh(expiresInMs: number) {
  const timeout = expiresInMs - 60_000;
  if (refreshTimeoutId !== null) clearTimeout(refreshTimeoutId);
  refreshTimeoutId = window.setTimeout(doRefresh, timeout);
}

async function doRefresh() {
  try {
    const res = await fetch(`${AUTH_BASE}/refresh`, {
      method: 'POST',
      credentials: 'include',      
    });
    const { expiresIn, refreshExpiresIn, message } = await res.json();
    if (!res.ok) throw new Error(message || 'Refresh error');

    scheduleRefresh(expiresIn);
    console.log('[auth] Token refreshed, expiresIn =', expiresIn);
  } catch (e) {
    console.error('[auth] Refresh failed:', e);
    window.location.replace('/login');
  }
}

export async function login(username: string, password: string) {
  const res = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  const { expiresIn, message } = await res.json();
  if (!res.ok) throw new Error(message || 'Login error');

  scheduleRefresh(expiresIn);
}

export async function logout() {
  try {
    await fetch(`${AUTH_BASE}/logout`, {
      method: 'POST',
      credentials: 'include',
    })
  } catch (err) {
    console.error('Logout error:', err)
  } finally {
    window.location.replace('/login')
  }
}

