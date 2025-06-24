const API = 'http://185.8.212.114:8987'

type LoginResponse = {
  status: number
  data: {
    accessToken: string
    refreshToken: string
    expiresIn: number
    refreshExpiresIn: number
  }
}

let refreshTimeoutId: number | null = null

export function scheduleRefresh(expiresIn: number) {
  const msBefore = expiresIn - 60_000
  if (refreshTimeoutId) clearTimeout(refreshTimeoutId)
  refreshTimeoutId = window.setTimeout(doRefresh, msBefore)
}

async function doRefresh() {
  try {
    const refreshToken = sessionStorage.getItem('refreshToken')
    if (!refreshToken) throw new Error('Нет refreshToken')

    const res = await fetch(`${API}/api/system/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })
    const body: LoginResponse = await res.json()
    if (!res.ok || body.status !== 0) throw new Error(body.message || 'Refresh error')

    const { accessToken, refreshToken: newRt, expiresIn } = body.data
    sessionStorage.setItem('accessToken', accessToken)
    sessionStorage.setItem('refreshToken', newRt)
    sessionStorage.setItem('expiresIn', String(expiresIn))

    // следующий таймер
    scheduleRefresh(expiresIn)
    console.log('[auth] Токен обновлён, новый expiresIn =', expiresIn)
  } catch (e) {
    console.error('[auth] Не удалось обновить токен:', e)
    window.location.replace('/login')
  }
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API}/api/system/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  const body: LoginResponse = await res.json()
  if (!res.ok || body.status !== 0) throw new Error(body.message || 'Login error')

  const { accessToken, refreshToken, expiresIn } = body.data
  sessionStorage.setItem('accessToken', accessToken)
  sessionStorage.setItem('refreshToken', refreshToken)
  sessionStorage.setItem('expiresIn', String(expiresIn))

}

export function logout() {
  sessionStorage.clear()
  window.location.replace('/login')
}
