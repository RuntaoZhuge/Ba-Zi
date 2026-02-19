import OpenAI from 'openai';
import { extractLiurenAnalysisContext } from '@bazi/domain';
import type { LiurenResult } from '@bazi/domain';

export const runtime = 'nodejs';

const SYSTEM_PROMPT_ZH = `你是一位精通大六壬的预测大师。你通过分析天地盘、四课、三传、十二天将等信息来解读六壬课局。

分析要求：
- 基于传统大六壬理论，以四课三传为核心，结合天将、日干关系进行判断
- 语言亲切自然，避免过于晦涩
- 每个维度 2-3 段，重点突出，有实际指导意义
- 仅用 ### 作为各维度的大标题，正文中不要使用任何 # 标记
- 可用 **加粗** 强调关键词，用 - 列表罗列要点`;

const SYSTEM_PROMPT_EN = `You are a master of Da Liu Ren (大六壬) divination. You analyze the heaven-earth board, four lessons, three transmissions, and twelve generals to interpret the divination chart.

Requirements:
- Ground analysis in traditional Da Liu Ren theory, focusing on four lessons and three transmissions, combined with general and day-stem relationships
- Use clear, approachable language
- 2-3 paragraphs per dimension, highlighting key insights
- Use ### ONLY for dimension headings. Do NOT use any # headings in body text
- Use **bold** for key terms and - lists for bullet points`;

function buildPrompt(result: LiurenResult, locale: string): string {
  const ctx = extractLiurenAnalysisContext(result);

  if (locale === 'zh') {
    return `## 六壬课局信息
- ${ctx.dayHourInfo}
- ${ctx.monthJiang}
- ${ctx.xunKong}
${ctx.question ? `- 所问之事：${ctx.question}` : ''}

## 四课
${ctx.lessonsSummary}

## 三传
${ctx.transmissionInfo}

## 天地盘
${ctx.boardSummary}

请按以下结构分析，每个维度用 ### 作为标题：
### 课局总论
日干支、月将、天地盘旋转关系总体分析
### 四课分析
四课上下神关系、生克制化
### 三传解读
三传取法含义、初中末传递进关系、天将配合
### 吉凶判断
综合四课三传、天将、旬空判断吉凶
### 综合建议
结合课局给出具体可行的建议`;
  }

  return `## Liu Ren Chart Information
- ${ctx.dayHourInfo}
- ${ctx.monthJiang}
- ${ctx.xunKong}
${ctx.question ? `- Question: ${ctx.question}` : ''}

## Four Lessons
${ctx.lessonsSummary}

## Three Transmissions
${ctx.transmissionInfo}

## Heaven-Earth Board
${ctx.boardSummary}

Please analyze in this structure, use ### as heading for each dimension:
### Overall Chart Analysis
Day stem-branch, month general, heaven-earth board rotation analysis
### Four Lessons Analysis
Upper and lower spirits of each lesson, their ke-sheng relationships
### Three Transmissions Interpretation
Transmission extraction method meaning, initial-middle-final progression, general assignments
### Fortune Assessment
Comprehensive assessment combining lessons, transmissions, generals, and void
### Comprehensive Advice
Practical suggestions based on the chart`;
}

export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'NO_API_KEY' }, { status: 503 });
  }

  const { result, locale = 'zh' } = (await req.json()) as {
    result: LiurenResult;
    locale?: string;
  };

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  });

  const systemPrompt = locale === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;
  const userPrompt = buildPrompt(result, locale);

  const stream = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 3000,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch {
        // Stream interrupted
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
