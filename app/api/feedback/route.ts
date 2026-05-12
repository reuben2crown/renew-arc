import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, feedbackType, message, pageUrl, rating } = await req.json();
    
    if (!userId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient();

    const { error } = await supabase
      .from('feedback')
      .insert([{
        profile_id: userId,
        feedback_type: feedbackType || 'general',
        message,
        page_url: pageUrl,
        rating: rating || null,
        status: 'new',
        created_at: new Date(),
      }]);

    if (error) {
      console.error('Failed to save feedback:', error);
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get feedback for admin users (you can add role check here)
    const { data, error } = await supabase
      .from('feedback')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
