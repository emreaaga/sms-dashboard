// app/api/report/sms/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 1. Берём JWT из HttpOnly-cookie
    const token = request.cookies.get('access_token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Перекидываем все query-параметры на внешний сервис
    const incoming = new URL(request.url);
    const external = new URL(
      'http://185.8.212.114:8987/api/report/sms'
    );
    incoming.searchParams.forEach((value, key) => {
      external.searchParams.append(key, value);
    });

    // 3. Делаем запрос к реальному API
    const externalRes = await fetch(external.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await externalRes.json();

    // 4. Проксируем ответ (статус + тело)
    return NextResponse.json(data, { status: externalRes.status });
  } catch (err) {
    console.error('[/api/report/sms] error:', err);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
