import { Webhook } from '@creem_io/nextjs';

import { adminDb } from '@/lib/firebase-admin';

async function grantPremiumAccess(userId: string, periodEnd?: Date) {
  const userRef = adminDb.collection('users').doc(userId);
  await userRef.update({
    'subscription.plan': 'premium',
    'subscription.expiresAt': periodEnd ?? null,
  });
}

async function revokePremiumAccess(userId: string) {
  const userRef = adminDb.collection('users').doc(userId);
  await userRef.update({
    'subscription.plan': 'free',
    'subscription.expiresAt': null,
  });
}

export const POST = Webhook({
  webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,

  onGrantAccess: async ({ reason, customer, metadata, current_period_end_date }) => {
    const userId = metadata?.referenceId as string;
    if (!userId) {
      console.error(`[Creem Webhook] onGrantAccess(${reason}): missing referenceId for ${customer.email}`);
      return;
    }
    console.log(`[Creem Webhook] Granting access (${reason}) to ${customer.email} [${userId}]`);
    await grantPremiumAccess(userId, current_period_end_date ? new Date(current_period_end_date) : undefined);
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

  onCheckoutCompleted: async ({ customer, product, metadata }) => {
    console.log(`[Creem Webhook] Checkout completed: ${customer?.email} purchased ${product.name}`, metadata);
  },
});
