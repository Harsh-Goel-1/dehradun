import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_PHONE = process.env.ADMIN_PHONE || '';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/properties — Fetch all properties (admin only)
 * Requires ?phone= query param matching ADMIN_PHONE
 */
export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get('phone');

  if (!phone || !isAdmin(phone)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

/**
 * POST /api/admin/properties — Admin actions (delete, toggle featured)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, phone, id } = body;

    if (!phone || !isAdmin(phone)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (action === 'delete' && id) {
      const { error } = await supabaseAdmin
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle_featured' && id) {
      // Get current featured status
      const { data: prop } = await supabaseAdmin
        .from('properties')
        .select('featured')
        .eq('id', id)
        .single();

      const { error } = await supabaseAdmin
        .from('properties')
        .update({ featured: !prop?.featured })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, featured: !prop?.featured });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}

function isAdmin(phone: string): boolean {
  if (!ADMIN_PHONE) return false;
  // Normalize both numbers for comparison (strip spaces, ensure +91)
  const normalize = (p: string) => p.replace(/[\s\-()]/g, '').replace(/^0+/, '');
  return normalize(phone) === normalize(ADMIN_PHONE);
}
