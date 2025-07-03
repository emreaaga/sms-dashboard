import { NextRequest, NextResponse } from 'next/server';

const EXTERNAL_URL = 'http://185.8.212.114:8987/api/sms-templates';
const VALID_STATUSES = ['PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'REJECTED'] as const;

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('access_token')?.value;
        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json() as {
            name: string;
            content: string;
            status: string;
            originator: string;
            merchantId: string;
        };

        const { name, content, status, originator, merchantId } = body;
        if (
            !name ||
            !content ||
            !status ||
            !originator ||
            !merchantId ||
            !VALID_STATUSES.includes(status as any)
        ) {
            return NextResponse.json(
                { message: 'Invalid request payload' },
                { status: 400 }
            );
        }
        const externalRes = await fetch(EXTERNAL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ name, content, status, originator, merchantId }),
        });
        const data = await externalRes.json();
        return NextResponse.json(data, { status: externalRes.status });
    } catch (err: any) {
        console.error('[/api/sms-templates] error:', err);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
