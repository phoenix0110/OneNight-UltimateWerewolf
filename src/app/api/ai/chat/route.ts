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

    const apiKey = provider.apiKey || process.env.DEFAULT_AI_API_KEY || '';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No API key provided' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${provider.baseUrl}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: provider.model,
          messages,
          max_tokens: 100,
          temperature: 0.8,
        }),
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
    const content =
      data.choices?.[0]?.message?.content || 'I have nothing to say.';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
