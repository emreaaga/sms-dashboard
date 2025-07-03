import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const external = await fetch(
    'http://185.8.212.114:8987/api/system/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }
  );
  const body = await external.json();

  if (!external.ok || body.status !== 0) {
    return NextResponse.json(
      { message: body.message || 'Login failed' },
      { status: external.status }
    );
  }

  const { accessToken, refreshToken, expiresIn, refreshExpiresIn } = body.data;

  const res = NextResponse.json({
    expiresIn,         
    refreshExpiresIn,
  });

  res.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(expiresIn / 1000), 
  });
  res.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(refreshExpiresIn / 1000),
  });

  return res;
}
