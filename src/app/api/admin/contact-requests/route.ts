import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/database/admin';
import { deleteContactRequest, getContactRequests } from '@/utils/database/contact-request';

// GET /api/admin/contact-requests
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const q = searchParams.get('q') || undefined;

    const result = await getContactRequests(page, limit, q);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication required')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'Admin access required') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/contact-requests?id=...
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await deleteContactRequest(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Authentication required')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'Admin access required') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
