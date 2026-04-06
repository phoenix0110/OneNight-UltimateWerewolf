export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatProvider {
  id: string;
  name: string;
  sendMessage(messages: ChatMessage[]): Promise<string>;
}

export interface ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
}

export const BUILT_IN_PROVIDERS: Omit<ProviderConfig, 'apiKey'>[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    baseUrl: 'https://api.minimax.chat/v1',
    model: 'MiniMax-M2.7-highspeed',
  },
  {
    id: 'kimi',
    name: 'Kimi',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'kimi-k2.5',
  },
];

export function createProvider(config: ProviderConfig): ChatProvider {
  return {
    id: config.id,
    name: config.name,
    async sendMessage(messages: ChatMessage[]): Promise<string> {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          provider: {
            baseUrl: config.baseUrl,
            model: config.model,
            apiKey: config.apiKey,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        const detail = errData?.error || response.statusText;
        throw new Error(detail);
      }

      const data = await response.json();
      return data.content;
    },
  };
}
