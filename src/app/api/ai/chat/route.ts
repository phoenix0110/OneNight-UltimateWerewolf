import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  messages: { role: string; content: string }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages } = body;

    const apiKey = (process.env.AI_API_KEY || '').trim();
    const baseUrl = (process.env.AI_BASE_URL || 'https://api.moonshot.cn/v1').replace(/\/+$/, '');
    const model = process.env.AI_MODEL || 'kimi-k2.5';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI_API_KEY not configured in .env' },
        { status: 500 }
      );
    }

    const isKimiK25 = model.startsWith('kimi-k2.5');
    const requestBody: Record<string, unknown> = {
      model,
      messages,
      max_tokens: isKimiK25 ? 300 : 200,
    };
    if (isKimiK25) {
      requestBody.thinking = { type: 'disabled' };
    } else {
      requestBody.temperature = 0.8;
    }

    const response = await fetch(
      `${baseUrl}/chat/completions`,
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
