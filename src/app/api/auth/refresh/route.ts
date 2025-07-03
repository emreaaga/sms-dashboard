// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // 1. Берём из куки
  const oldRt = request.cookies.get('refresh_token')?.value;
  if (!oldRt) {
    return NextResponse.json({ message: 'Refresh token missing' }, { status: 401 });
  }

  // 2. Проксируем на внешний API
  const external = await fetch(
    'http://185.8.212.114:8987/api/system/auth/refresh',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: oldRt }),
    }
  );
  const body = await external.json();

  if (!external.ok || body.status !== 0) {
    return NextResponse.json(
      { message: body.message || 'Refresh failed' },
      { status: external.status }
    );
  }

  const {
    accessToken,
    refreshToken: newRt,
    expiresIn,
    refreshExpiresIn,
  } = body.data;

  const res = NextResponse.json({ expiresIn, refreshExpiresIn });
  res.cookies.set('access_token', accessToken, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: Math.floor(expiresIn / 1000),
  });
  res.cookies.set('refresh_token', newRt, {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: Math.floor(refreshExpiresIn / 1000),
  });

  return res;
}
