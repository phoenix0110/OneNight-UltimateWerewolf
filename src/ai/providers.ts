export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Send messages to the AI provider (configured server-side via .env).
 * The client never needs to know about API keys or provider details.
 */
export async function sendAIMessage(messages: ChatMessage[]): Promise<string> {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const detail = errData?.error || response.statusText;
    throw new Error(detail);
  }

  const data = await response.json();
  return data.content;
}
