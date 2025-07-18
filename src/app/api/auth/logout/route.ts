import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })

  res.cookies.set('access_token', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  })
  res.cookies.set('refresh_token', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  })

  return res
}
