import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  messages: { role: string; content: string }[];
  provider: {
    baseUrl: string;
    model: string;
    apiKey: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, provider } = body;

    const rawApiKey = (provider.apiKey || process.env.DEFAULT_AI_API_KEY || '').trim();
    const apiKey = rawApiKey.replace(/^Bearer\s+/i, '').trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key provided' },
        { status: 400 }
      );
    }

    const isKimiK25 = provider.model.startsWith('kimi-k2.5');
    const requestBody: Record<string, unknown> = {
      model: provider.model,
      messages,
      max_tokens: isKimiK25 ? 300 : 200,
    };
    if (isKimiK25) {
      requestBody.thinking = { type: 'disabled' };
    } else {
      requestBody.temperature = 0.8;
    }

    const normalizedBaseUrl = provider.baseUrl.replace(/\/+$/, '');
    const response = await fetch(
      `${normalizedBaseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Provider error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('AI returned empty content. Response:', JSON.stringify(data));
      return NextResponse.json(
        { error: 'AI returned empty response' },
        { status: 502 }
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
