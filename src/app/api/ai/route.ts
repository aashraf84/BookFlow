import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const systemPrompts: Record<string, string> = {
  forecast:
    'You are an AI inventory forecasting assistant for a bookstore and stationery business. Analyze sales patterns, seasonal trends, and inventory levels to provide actionable restocking recommendations. Consider factors like academic calendar cycles, festival seasons, and historical demand. Provide specific quantity recommendations and timing advice.',
  assistant:
    'You are an AI sales assistant for a bookstore and stationery business. Help with customer recommendations, sales strategies, pricing optimization, and cross-selling opportunities. Understand book genres, stationery categories, and customer preferences. Provide data-driven suggestions to increase sales.',
  academic:
    'You are an AI academic planning assistant for a bookstore that serves schools and educational institutions. Help with academic package planning, textbook selection, curriculum-aligned recommendations, school supply lists, and bulk order management. Understand different education boards and academic levels.',
  marketing:
    'You are an AI marketing assistant for a bookstore and stationery business. Help create marketing campaigns, promotional strategies, customer engagement plans, loyalty program optimization, and social media content. Consider book launches, seasonal events, and back-to-school periods.',
  business:
    'You are an AI business intelligence assistant for a bookstore, publishing, and stationery business. Help with financial analysis, profitability insights, operational efficiency, growth strategies, and market opportunity identification. Provide data-driven business recommendations.',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, query, context } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const promptType = type || 'assistant';
    const systemPrompt = systemPrompts[promptType] || systemPrompts.assistant;

    // Build context-aware message
    let contextMessage = '';
    if (context) {
      contextMessage = `\n\nCurrent context/data:\n${JSON.stringify(context, null, 2)}`;
    }

    const fullMessage = query + contextMessage;

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: fullMessage },
      ],
      thinking: { type: 'disabled' },
    });

    const content =
      completion.choices?.[0]?.message?.content ||
      'I apologize, but I was unable to generate a response. Please try again.';

    return NextResponse.json({
      data: {
        type: promptType,
        query,
        response: content,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('AI POST error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    );
  }
}
