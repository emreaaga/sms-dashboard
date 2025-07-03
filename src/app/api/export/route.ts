import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const incoming = new URL(request.url);
  const external = new URL(
    'http://185.8.212.114:8987/api/report/sms/export'
  );
  incoming.searchParams.forEach((v, k) => external.searchParams.append(k, v));

  const externalRes = await fetch(external.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!externalRes.ok) {
    const err = await externalRes.json().catch(() => ({}));
    return NextResponse.json(err, { status: externalRes.status });
  }

  const data = await externalRes.arrayBuffer();
  const headers = new Headers();
  headers.set(
    'Content-Type',
    externalRes.headers.get('content-type') || 'application/octet-stream'
  );
  headers.set(
    'Content-Disposition',
    externalRes.headers.get('content-disposition') ||
      'attachment; filename="export.xlsx"'
  );

  return new NextResponse(data, { status: 200, headers });
}
