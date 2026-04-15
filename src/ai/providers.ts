import { auth } from '@/lib/firebase';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequestContext {
  gameSessionId?: string;
  playerName?: string;
  phase?: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const token = await auth?.currentUser?.getIdToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch {
    // Guest user — no token attached
  }
  return headers;
}

/**
 * Send messages to the AI provider (configured server-side via .env).
 * The client never needs to know about API keys or provider details.
 */
export async function sendAIMessage(
  messages: ChatMessage[],
  context?: AIRequestContext
): Promise<string> {
  const headers = await getAuthHeaders();
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages,
      gameSessionId: context?.gameSessionId,
      playerName: context?.playerName,
      phase: context?.phase,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const detail = errData?.error || response.statusText;
    throw new Error(detail);
  }

  const data = await response.json();
  return data.content;
}
