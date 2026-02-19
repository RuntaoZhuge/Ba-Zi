import OpenAI from 'openai';
import { extractLiuyaoAnalysisContext } from '@bazi/domain';
import type { LiuyaoResult } from '@bazi/domain';

export const runtime = 'nodejs';

const SYSTEM_PROMPT_ZH = `你是一位精通六爻纳甲的预测大师。你通过分析本卦、变卦、六亲、世应、动爻、日月建等信息来解读卦象。

分析要求：
- 基于传统六爻纳甲理论，以用神为核心，结合日月建旺衰、动爻生克、世应关系进行判断
- 语言亲切自然，避免过于晦涩
- 每个维度 2-3 段，重点突出，有实际指导意义
- 仅用 ### 作为各维度的大标题，正文中不要使用任何 # 标记
- 可用 **加粗** 强调关键词，用 - 列表罗列要点`;

const SYSTEM_PROMPT_EN = `You are a master of Liu Yao Na Jia (六爻纳甲) divination. You analyze hexagrams through original/changed hexagrams, six relations, Shi/Ying positions, moving lines, and day/month branch influences.

Requirements:
- Ground analysis in traditional Liu Yao Na Jia theory, focusing on the subject spirit, day/month branch strength, moving line interactions, and Shi/Ying relationships
- Use clear, approachable language
- 2-3 paragraphs per dimension, highlighting key insights
- Use ### ONLY for dimension headings. Do NOT use any # headings in body text
- Use **bold** for key terms and - lists for bullet points`;

function buildPrompt(result: LiuyaoResult, locale: string): string {
  const ctx = extractLiuyaoAnalysisContext(result);

  if (locale === 'zh') {
    return `## 卦象信息
- 卦名：${ctx.hexInfo}
- 日月：${ctx.dayMonth}
- 旬空：${ctx.xunKong}
- ${ctx.movingInfo}
- ${ctx.changedHex}
- 伏神：${ctx.hiddenGods}
${ctx.question ? `- 所问之事：${ctx.question}` : ''}

## 六爻详情（从上到下）
${ctx.linesSummary}

请按以下结构分析，每个维度用 ### 作为标题：
### 卦象总论
卦名含义、所属卦宫、世应位置分析
### 用神分析
根据所问之事确定用神，分析用神旺衰、是否得日月生助
### 动爻解读
动爻变化、动爻与用神的生克关系
### 吉凶判断
综合日月建、动爻、世应关系判断吉凶
### 综合建议
结合卦象给出具体可行的建议`;
  }

  return `## Hexagram Information
- Hexagram: ${ctx.hexInfo}
- Day/Month: ${ctx.dayMonth}
- Void: ${ctx.xunKong}
- ${ctx.movingInfo}
- ${ctx.changedHex}
- Hidden Gods: ${ctx.hiddenGods}
${ctx.question ? `- Question: ${ctx.question}` : ''}

## Line Details (top to bottom)
${ctx.linesSummary}

Please analyze in this structure, use ### as heading for each dimension:
### Overall Hexagram Analysis
Hexagram meaning, palace affiliation, Shi/Ying position analysis
### Subject Spirit Analysis
Determine the subject spirit based on the question, analyze its strength and support from day/month
### Moving Lines Interpretation
Moving line transformations and their relationships to the subject spirit
### Fortune Assessment
Comprehensive assessment combining day/month, moving lines, and Shi/Ying relationships
### Comprehensive Advice
Practical suggestions based on the hexagram reading`;
}

export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'NO_API_KEY' }, { status: 503 });
  }

  const { result, locale = 'zh' } = (await req.json()) as {
    result: LiuyaoResult;
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
