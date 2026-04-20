import { NextRequest, NextResponse } from 'next/server';

import { getAdminDb } from '@/lib/firebase-admin';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function checkAuth(req: NextRequest): boolean {
  if (!ADMIN_SECRET) return false;
  const header = req.headers.get('authorization');
  return header === `Bearer ${ADMIN_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  const email = req.nextUrl.searchParams.get('email');
  const uid = req.nextUrl.searchParams.get('uid');

  if (!email && !uid) {
    return NextResponse.json({ error: 'Provide ?email= or ?uid=' }, { status: 400 });
  }

  const db = getAdminDb();

  try {
    if (uid) {
      const snap = await db.collection('users').doc(uid).get();
      if (!snap.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      const data = snap.data();
      return NextResponse.json({
        uid: snap.id,
        email: data?.email,
        displayName: data?.displayName,
        nickname: data?.nickname,
        subscription: data?.subscription,
        stats: data?.stats,
      });
    }

    const snap = await db.collection('users').where('email', '==', email).limit(1).get();
    if (snap.empty) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const doc = snap.docs[0];
    const data = doc.data();
    return NextResponse.json({
      uid: doc.id,
      email: data?.email,
      displayName: data?.displayName,
      nickname: data?.nickname,
      subscription: data?.subscription,
      stats: data?.stats,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return unauthorized();

  try {
    const body = await req.json();
    const { uid, email, gamesRemaining, delta } = body as {
      uid?: string; email?: string; gamesRemaining?: number; delta?: number;
    };

    if (!uid && !email) {
      return NextResponse.json({ error: 'Provide uid or email' }, { status: 400 });
    }
    if (gamesRemaining === undefined && delta === undefined) {
      return NextResponse.json({ error: 'Provide gamesRemaining (absolute) or delta (+/- adjustment)' }, { status: 400 });
    }

    const db = getAdminDb();

    let targetUid = uid;
    if (!targetUid && email) {
      const snap = await db.collection('users').where('email', '==', email).limit(1).get();
      if (snap.empty) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      targetUid = snap.docs[0].id;
    }

    const userRef = db.collection('users').doc(targetUid!);
    const snap = await userRef.get();
    if (!snap.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const current = snap.data()?.subscription?.gamesRemaining ?? 0;
    const newValue = gamesRemaining !== undefined
      ? gamesRemaining
      : Math.max(0, current + (delta ?? 0));

    await userRef.set(
      { subscription: { plan: newValue > 0 ? 'paid' : 'free', gamesRemaining: newValue, expiresAt: null } },
      { merge: true },
    );

    return NextResponse.json({
      uid: targetUid,
      previous: current,
      gamesRemaining: newValue,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
