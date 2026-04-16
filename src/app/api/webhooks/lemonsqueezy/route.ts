import crypto from 'crypto';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/firebase';

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';

const STARTER_GAMES = 10;
const MONTHLY_GAMES = 200;

function verifySignature(rawBody: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

interface LemonSqueezyEvent {
  meta: {
    event_name: string;
    custom_data?: { user_id?: string };
  };
  data: {
    id: string;
    attributes: {
      status?: string;
      variant_name?: string;
      product_name?: string;
      first_order_item?: {
        variant_name?: string;
        product_name?: string;
      };
      renews_at?: string;
      ends_at?: string | null;
      customer_id?: number;
    };
  };
}

function extractUserId(event: LemonSqueezyEvent): string | null {
  return event.meta.custom_data?.user_id ?? null;
}

function isStarterProduct(event: LemonSqueezyEvent): boolean {
  const attrs = event.data.attributes;
  const name = (
    attrs.variant_name ||
    attrs.product_name ||
    attrs.first_order_item?.variant_name ||
    attrs.first_order_item?.product_name ||
    ''
  ).toLowerCase();
  return name.includes('starter') || name.includes('pay to go');
}

async function handleOrderCreated(event: LemonSqueezyEvent) {
  const userId = extractUserId(event);
  if (!userId || !db) return;

  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  if (isStarterProduct(event)) {
    const current = snap.data().subscription?.gamesRemaining ?? 0;
    await updateDoc(userRef, {
      'subscription.plan': 'starter',
      'subscription.gamesRemaining': current + STARTER_GAMES,
    });
  }
}

async function handleSubscriptionCreated(event: LemonSqueezyEvent) {
  const userId = extractUserId(event);
  if (!userId || !db) return;

  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const renewsAt = event.data.attributes.renews_at;
  await updateDoc(userRef, {
    'subscription.plan': 'monthly',
    'subscription.gamesRemaining': MONTHLY_GAMES,
    'subscription.expiresAt': renewsAt ? new Date(renewsAt) : null,
  });
}

async function handleSubscriptionPayment(event: LemonSqueezyEvent) {
  const userId = extractUserId(event);
  if (!userId || !db) return;

  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const renewsAt = event.data.attributes.renews_at;
  await updateDoc(userRef, {
    'subscription.plan': 'monthly',
    'subscription.gamesRemaining': MONTHLY_GAMES,
    'subscription.expiresAt': renewsAt ? new Date(renewsAt) : null,
  });
}

async function handleSubscriptionCancelled(event: LemonSqueezyEvent) {
  const userId = extractUserId(event);
  if (!userId || !db) return;

  const userRef = doc(db, 'users', userId);
  const endsAt = event.data.attributes.ends_at;

  await updateDoc(userRef, {
    'subscription.expiresAt': endsAt ? new Date(endsAt) : null,
  });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature') || '';

    if (!WEBHOOK_SECRET) {
      console.error('[Webhook] LEMONSQUEEZY_WEBHOOK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event: LemonSqueezyEvent = JSON.parse(rawBody);
    const eventName = event.meta.event_name;

    switch (eventName) {
      case 'order_created':
        await handleOrderCreated(event);
        break;
      case 'subscription_created':
        await handleSubscriptionCreated(event);
        break;
      case 'subscription_payment_success':
        await handleSubscriptionPayment(event);
        break;
      case 'subscription_cancelled':
      case 'subscription_expired':
        await handleSubscriptionCancelled(event);
        break;
      default:
        console.log(`[Webhook] Unhandled event: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
