import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return renderFriendlyError('Please sign in to view receipts.', 401);
    }

    const url = new URL(request.url);
    const transactionId = url.searchParams.get('transactionId') || '';
    const dispositionParam = url.searchParams.get('disposition') || 'inline';
    const disposition = dispositionParam === 'attachment' ? 'attachment' : 'inline';

    if (!transactionId) {
      return renderFriendlyError('Missing transaction id.', 400);
    }

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId }, include: { customer: true } });
    const currentCustomerId = user?.customer?.paddleCustomerId;
    if (!currentCustomerId) {
      return renderFriendlyError('No billing record found for your account.', 404);
    }

    const apiKey = process.env.PADDLE_API_KEY;
    if (!apiKey) {
      return renderFriendlyError('Receipt service is not configured. Please contact support.', 500);
    }
    const isSandbox = (process.env.NEXT_PUBLIC_PADDLE_ENV || '').toLowerCase() === 'sandbox';
    const API_BASE = isSandbox ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';

    // Verify transaction ownership
    const txResp = await fetch(`${API_BASE}/transactions/${encodeURIComponent(transactionId)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
    });
    if (!txResp.ok) {
      return renderFriendlyError(
        'We could not find that receipt. It may have been archived or the id is invalid.',
        txResp.status,
      );
    }
    const txJson = (await txResp.json()) as { data?: { customerId?: string; customer_id?: string } };
    const txCustomerId = txJson?.data?.customerId || txJson?.data?.customer_id || null;
    if (!txCustomerId || txCustomerId !== currentCustomerId) {
      return renderFriendlyError("You don't have access to this receipt.", 403);
    }

    // Fetch invoice
    const invResp = await fetch(
      `${API_BASE}/transactions/${encodeURIComponent(transactionId)}/invoice?disposition=${encodeURIComponent(
        disposition,
      )}`,
      { method: 'GET', headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' } },
    );
    if (!invResp.ok) {
      return renderFriendlyError(
        'We were unable to fetch this invoice at the moment. Please try again later.',
        invResp.status,
      );
    }

    const data = (await invResp.json()) as { data?: { url?: string } };
    const invoiceUrl = data?.data?.url || (typeof data === 'string' ? (data as unknown as string) : undefined);
    if (invoiceUrl) return NextResponse.redirect(invoiceUrl, { status: 302 });

    return renderFriendlyError('Invoice is not available for this transaction.', 502);
  } catch (error) {
    console.error('Invoice fetch failed:', error);
    return renderFriendlyError('Something went wrong while loading your receipt. Please try again.', 500);
  }
}

function renderFriendlyError(message: string, status: number) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const html = `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Receipt</title>
      <style>
        body{font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background:#0B0B0C; color:#EDEDED; margin:0; padding:0}
        .wrap{max-width:560px; margin:10vh auto; padding:24px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px}
        h1{font-size:18px; margin:0 0 12px}
        p{margin:0 0 16px; color:#B5B5B5}
        .row{display:flex; gap:12px}
        a,button{appearance:none; border:1px solid rgba(255,255,255,0.16); background:rgba(255,255,255,0.06); color:#EDEDED; text-decoration:none; padding:8px 12px; border-radius:8px; font-size:14px}
        .primary{background:#3B82F6; border-color:#2563EB}
      </style>
    </head>
    <body>
      <div class="wrap">
        <h1>Unable to load receipt</h1>
        <p>${escapeHtml(message)}</p>
        <div class="row">
          <a class="primary" href="${appUrl}/dashboard/payments">Back to payments</a>
          <button onclick="window.close()">Close</button>
        </div>
      </div>
    </body>
  </html>`;
  return new NextResponse(html, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
