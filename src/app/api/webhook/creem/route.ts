import { Webhook } from '@creem_io/nextjs';

import { getAdminDb } from '@/lib/firebase-admin';

const TIER_CONFIG: Record<string, number> = {};

function loadTierConfig() {
  const tiers = [
    { envKey: 'NEXT_PUBLIC_CREEM_TIER1_PRODUCT_ID', games: 2 },
    { envKey: 'NEXT_PUBLIC_CREEM_TIER2_PRODUCT_ID', games: 5 },
    { envKey: 'NEXT_PUBLIC_CREEM_TIER3_PRODUCT_ID', games: 50 },
  ];
  for (const { envKey, games } of tiers) {
    const id = process.env[envKey];
    if (id) TIER_CONFIG[id] = games;
  }
}
loadTierConfig();

function getProductId(product: unknown): string | null {
  if (!product) return null;
  if (typeof product === 'string') return product;
  if (typeof product === 'object' && 'id' in product) {
    const id = (product as { id?: unknown }).id;
    return typeof id === 'string' ? id : null;
  }
  return null;
}

async function grantGamesByProduct(userId: string, productId: string | null) {
  const db = getAdminDb();
  const userRef = db.collection('users').doc(userId);

  if (!productId) {
    console.error(`[Creem Webhook] Missing productId for user ${userId}`);
    return;
  }

  const gamesToAdd = TIER_CONFIG[productId];
  if (!gamesToAdd) {
    console.warn(`[Creem Webhook] Unknown product ${productId} for user ${userId}, skipping`);
    return;
  }

  const snap = await userRef.get();
  const current = snap.exists ? (snap.data()?.subscription?.gamesRemaining ?? 0) : 0;
  await userRef.set(
    {
      subscription: {
        plan: 'paid',
        gamesRemaining: current + gamesToAdd,
        expiresAt: null,
      },
    },
    { merge: true }
  );
  console.log(`[Creem Webhook] Added ${gamesToAdd} games for user ${userId} (was ${current}, now ${current + gamesToAdd})`);
}

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

  onGrantAccess: async ({ reason, customer, metadata, product }) => {
    const userId = metadata?.referenceId as string;
    if (!userId) {
      console.error(`[Creem Webhook] onGrantAccess(${reason}): missing referenceId for ${customer.email}`);
      return;
    }
    console.log(`[Creem Webhook] Granting access (${reason}) to ${customer.email} [${userId}]`);
    await grantGamesByProduct(userId, getProductId(product));
  },

  onRevokeAccess: async ({ reason, customer, metadata }) => {
    const userId = metadata?.referenceId as string;
    if (!userId) {
      console.error(`[Creem Webhook] onRevokeAccess(${reason}): missing referenceId for ${customer.email}`);
      return;
    }
    console.log(`[Creem Webhook] Revoking access (${reason}) from ${customer.email} [${userId}]`);
  },

  onCheckoutCompleted: async ({ customer, product, metadata, subscription }) => {
    const userId = metadata?.referenceId as string;
    if (!userId) {
      console.error(`[Creem Webhook] onCheckoutCompleted: missing referenceId for ${customer?.email}`);
      return;
    }

    if (!subscription) {
      await grantGamesByProduct(userId, getProductId(product));
    }

    console.log(`[Creem Webhook] Checkout completed: ${customer?.email} purchased ${product.name}`, metadata);
  },
});
