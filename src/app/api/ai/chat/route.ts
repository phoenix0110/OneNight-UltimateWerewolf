import fs from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  messages: { role: string; content: string }[];
  gameSessionId?: string;
  playerName?: string;
  phase?: string;
}

interface ProviderConfig {
  name: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  buildBody: (model: string, messages: { role: string; content: string }[], phase?: string) => Record<string, unknown>;
}

function getPhaseMaxTokens(phase?: string): number {
  if (phase === 'vote') return 1024;
  return 2048;
}

function getProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];

  const openrouterKey = (process.env.OPENROUTER_API_KEY || '').trim();
  const model = process.env.AI_MODEL || 'google/gemini-3.1-flash-lite-preview';
  if (openrouterKey) {
    providers.push({
      name: `OpenRouter(${model})`,
      apiKey: openrouterKey,
      baseUrl: 'https://openrouter.ai/api/v1',
      model,
      buildBody: (m, msgs, phase) => ({
        model: m,
        messages: msgs,
        max_tokens: getPhaseMaxTokens(phase),
        temperature: 0.8,
      }),
    });
  }

  const kimiKey = (process.env.AI_API_KEY || '').trim();
  const kimiBase = (process.env.AI_BASE_URL || 'https://api.moonshot.cn/v1').replace(/\/+$/, '');
  const fallbackModel = process.env.AI_FALLBACK_MODEL || 'kimi-k2.5';
  if (kimiKey) {
    const isKimiK25 = fallbackModel.startsWith('kimi-k2.5');
    providers.push({
      name: `Kimi(${fallbackModel})`,
      apiKey: kimiKey,
      baseUrl: kimiBase,
      model: fallbackModel,
      buildBody: (m, msgs, phase) => {
        const body: Record<string, unknown> = {
          model: m,
          messages: msgs,
          max_tokens: isKimiK25 ? getPhaseMaxTokens(phase) : 300,
        };
        if (isKimiK25) {
          body.thinking = { type: 'disabled' };
        } else {
          body.temperature = 0.8;
        }
        return body;
      },
    });
  }

  return providers;
}

function appendLog(sessionId: string, entry: Record<string, unknown>) {
  if (process.env.AI_DEBUG_LOG !== 'true') return;

  try {
    const logsDir = path.join(process.cwd(), 'logs', 'ai');
    fs.mkdirSync(logsDir, { recursive: true });

    const logFile = path.join(logsDir, `${sessionId}.log`);
    const timestamp = new Date().toISOString();
    const separator = '='.repeat(80);

    const lines = [
      separator,
      `[${timestamp}] Provider: ${entry.provider}`,
      `Player: ${entry.playerName || 'unknown'} | Phase: ${entry.phase || 'unknown'}`,
      separator,
    ];

    if (entry.inputMessages) {
      lines.push('--- INPUT MESSAGES ---');
      for (const msg of entry.inputMessages as { role: string; content: string }[]) {
        lines.push(`[${msg.role.toUpperCase()}]`);
        lines.push(msg.content);
        lines.push('');
      }
    }

    if (entry.output) {
      lines.push('--- OUTPUT ---');
      lines.push(entry.output as string);
    }

    if (entry.finishReason) {
      lines.push(`--- FINISH_REASON: ${entry.finishReason} ---`);
    }

    if (entry.usage) {
      const u = entry.usage as { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      lines.push(`--- USAGE: prompt=${u.prompt_tokens ?? '?'} completion=${u.completion_tokens ?? '?'} total=${u.total_tokens ?? '?'} ---`);
    }

    if (entry.error) {
      lines.push('--- ERROR ---');
      lines.push(entry.error as string);
    }

    if (entry.truncatedRetry) {
      lines.push('--- TRUNCATED, RETRYING ---');
    }

    if (entry.fallback) {
      lines.push(`--- FALLBACK: ${entry.fallback} ---`);
    }

    lines.push('', '');
    fs.appendFileSync(logFile, lines.join('\n'), 'utf-8');
  } catch {
    // logging should never break the game
  }
}

interface ProviderResult {
  content: string;
  provider: string;
  finishReason?: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

const SENTENCE_ENDERS = /[。！？!?.…」』）)\n]$/;

function looksComplete(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return SENTENCE_ENDERS.test(trimmed);
}

async function callProvider(
  provider: ProviderConfig,
  messages: { role: string; content: string }[],
  phase?: string,
): Promise<ProviderResult> {
  const body = provider.buildBody(provider.model, messages, phase);

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${provider.name} error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  const finishReason = data.choices?.[0]?.finish_reason;
  const usage = data.usage;

  if (!content) {
    throw new Error(
      `${provider.name} returned empty content (finish_reason=${finishReason}): ${JSON.stringify(data)}`
    );
  }

  return { content, provider: provider.name, finishReason, usage };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, gameSessionId, playerName, phase } = body;
    const sessionId = gameSessionId || 'no-session';

    const providers = getProviders();
    if (providers.length === 0) {
      return NextResponse.json(
        { error: 'No AI providers configured. Set OPENROUTER_API_KEY or AI_API_KEY in .env' },
        { status: 500 }
      );
    }

    let lastError: string = '';

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      try {
        const result = await callProvider(provider, messages, phase);

        const isVote = phase === 'vote';
        const truncated = result.finishReason === 'length'
          || (!isVote && !looksComplete(result.content));

        if (truncated) {
          appendLog(sessionId, {
            provider: result.provider,
            playerName,
            phase,
            output: result.content,
            finishReason: result.finishReason,
            usage: result.usage,
            truncatedRetry: true,
          });
        }

        appendLog(sessionId, {
          provider: result.provider,
          playerName,
          phase,
          inputMessages: messages,
          output: result.content,
          finishReason: result.finishReason,
          usage: result.usage,
          fallback: i > 0 ? `fallback from ${providers[i - 1].name}` : undefined,
        });

        return NextResponse.json({ content: result.content });
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.error(`[AI] ${provider.name} failed:`, lastError);

        appendLog(sessionId, {
          provider: provider.name,
          playerName,
          phase,
          inputMessages: messages,
          error: lastError,
        });
      }
    }

    return NextResponse.json(
      { error: `All providers failed. Last error: ${lastError}` },
      { status: 502 }
    );
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
