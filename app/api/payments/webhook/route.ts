import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyDodoSignature } from '@/lib/payments/dodo-provider';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-dodo-signature');

  if (!signature || !verifyDodoSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  const supabase = createClient();

  // Handle payment success
  if (event.type === 'payment.succeeded') {
    const { user_id, subscription_id } = event.data;
    
    // Update user profile to 'premium'
    const { error } = await supabase
      .from('profiles')
      .update({ 
        subscription_status: 'active',
        subscription_id,
        updated_at: new Date()
      })
      .eq('id', user_id);

    if (error) {
      console.error('Failed to update subscription', error);
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
