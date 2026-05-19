import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin client bypasses RLS — only used server-side
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, id } = body;

    // Require user_id for all mutations
    if (!data?.user_id) {
      return NextResponse.json({ error: 'Unauthorized: missing user_id' }, { status: 401 });
    }

    if (action === 'insert') {
      const { data: result, error } = await supabaseAdmin
        .from('properties')
        .insert(data)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ data: result });
    }

    if (action === 'update') {
      if (!id) return NextResponse.json({ error: 'Missing property id' }, { status: 400 });

      // Ensure user can only update their own properties
      const { data: result, error } = await supabaseAdmin
        .from('properties')
        .update(data)
        .eq('id', id)
        .eq('user_id', data.user_id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ data: result });
    }

    if (action === 'delete') {
      if (!id) return NextResponse.json({ error: 'Missing property id' }, { status: 400 });

      const { error } = await supabaseAdmin
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('user_id', data.user_id);

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
