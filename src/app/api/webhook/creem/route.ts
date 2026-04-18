import { Webhook } from '@creem_io/nextjs';

import { adminDb } from '@/lib/firebase-admin';

const STARTER_GAMES = 5;
const MONTHLY_GAMES = 50;

function getProductId(product: unknown): string | null {
  if (!product) return null;
  if (typeof product === 'string') return product;
  if (typeof product === 'object' && 'id' in product) {
    const id = (product as { id?: unknown }).id;
    return typeof id === 'string' ? id : null;
  }
  return null;
}

async function grantAccessByProduct(userId: string, productId: string | null, periodEnd?: Date) {
  const userRef = adminDb.collection('users').doc(userId);
  const starterProductId = process.env.NEXT_PUBLIC_CREEM_STARTER_PRODUCT_ID;
  const monthlyProductId = process.env.NEXT_PUBLIC_CREEM_MONTHLY_PRODUCT_ID;

  if (!productId) {
    console.error(`[Creem Webhook] Missing productId for user ${userId}`);
    return;
  }

  if (monthlyProductId && productId === monthlyProductId) {
    await userRef.set(
      {
        subscription: {
          plan: 'monthly',
          gamesRemaining: MONTHLY_GAMES,
          expiresAt: periodEnd ?? null,
        },
      },
      { merge: true }
    );
    return;
  }

  if (starterProductId && productId === starterProductId) {
    const snap = await userRef.get();
    const current = snap.exists ? (snap.data()?.subscription?.gamesRemaining ?? 0) : 0;
    await userRef.set(
      {
        subscription: {
          plan: 'starter',
          gamesRemaining: current + STARTER_GAMES,
          expiresAt: null,
        },
      },
      { merge: true }
    );
    return;
  }

  console.warn(`[Creem Webhook] Unknown product ${productId} for user ${userId}, skipping entitlement update`);
}

async function revokePremiumAccess(userId: string) {
  const userRef = adminDb.collection('users').doc(userId);
  await userRef.set(
    {
      subscription: {
        plan: 'free',
        expiresAt: null,
      },
    },
    { merge: true }
  );
}

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

  onGrantAccess: async ({ reason, customer, metadata, current_period_end_date, product }) => {
    const userId = metadata?.referenceId as string;
    if (!userId) {
      console.error(`[Creem Webhook] onGrantAccess(${reason}): missing referenceId for ${customer.email}`);
      return;
    }
    console.log(`[Creem Webhook] Granting access (${reason}) to ${customer.email} [${userId}]`);
    await grantAccessByProduct(
      userId,
      getProductId(product),
      current_period_end_date ? new Date(current_period_end_date) : undefined
    );
  },

  onRevokeAccess: async ({ reason, customer, metadata }) => {
    const userId = metadata?.referenceId as string;
    if (!userId) {
      console.error(`[Creem Webhook] onRevokeAccess(${reason}): missing referenceId for ${customer.email}`);
      return;
    }
    console.log(`[Creem Webhook] Revoking access (${reason}) from ${customer.email} [${userId}]`);
    await revokePremiumAccess(userId);
  },

  onCheckoutCompleted: async ({ customer, product, metadata, subscription }) => {
    const userId = metadata?.referenceId as string;
    if (!userId) {
      console.error(`[Creem Webhook] onCheckoutCompleted: missing referenceId for ${customer?.email}`);
      return;
    }

    // One-time purchase products may not trigger grant callbacks.
    if (!subscription) {
      await grantAccessByProduct(userId, getProductId(product));
    }

    console.log(`[Creem Webhook] Checkout completed: ${customer?.email} purchased ${product.name}`, metadata);
  },
});
