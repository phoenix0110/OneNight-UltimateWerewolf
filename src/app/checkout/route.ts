import { Checkout } from '@creem_io/nextjs';

const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '');

export const GET = Checkout({
  apiKey: process.env.CREEM_API_KEY!,
  testMode: process.env.CREEM_API_KEY?.startsWith('creem_test_') ?? true,
  defaultSuccessUrl: appUrl ? `${appUrl}/en/checkout/success` : '/en/checkout/success',
});
