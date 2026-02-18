import OpenAI from 'openai';
import { extractMeihuaAnalysisContext } from '@bazi/domain';
import type { MeihuaResult } from '@bazi/domain';

export const runtime = 'nodejs';

const SYSTEM_PROMPT_ZH = `你是一位精通《梅花易数》的周易占卜大师，擅长通过体用生克、卦象变化来判断事物的吉凶和发展趋势。

分析要求：
- 基于传统梅花易数理论，体用生克为核心
- 语言亲切自然，避免过于晦涩
- 每个维度 2-3 段，重点突出，有实际指导意义
- 仅用 ### 作为各维度的大标题（如 ### 卦象总论），正文中不要使用任何 # 标记
- 可用 **加粗** 强调关键词，用 - 列表罗列要点`;

const SYSTEM_PROMPT_EN = `You are a master of Meihua Yishu (Plum Blossom Numerology), an I-Ching divination expert who specializes in Ti-Yong (Subject-Object) five-element analysis to determine fortune and trends.

Requirements:
- Ground analysis in traditional Meihua Yishu theory, with Ti-Yong relationships as the core
- Use clear, approachable language
- 2-3 paragraphs per dimension, highlighting key insights
- Use ### ONLY for dimension headings (e.g. ### Hexagram Overview). Do NOT use any # headings in body text
- Use **bold** for key terms and - lists for bullet points`;

const DETAIL_SYSTEM_ZH = `你是一位精通《梅花易数》的周易占卜大师。
现在需要你对某一个维度进行深入、详细的专项分析。

要求：
- 深入剖析，比概览分析更加详尽，至少 5-8 段
- 结合经典理论引用原文，但用白话解释
- 给出具体、可操作的建议
- 仅用 ### 作为子话题标题，正文中不要使用任何 # 标记
- 可用 **加粗** 强调关键词，用 - 列表罗列要点
- 不要重复概览中已有的基本信息，直接深入分析`;

const DETAIL_SYSTEM_EN = `You are a master of Meihua Yishu (Plum Blossom Numerology).
You are now providing an in-depth, detailed analysis of one specific dimension.

Requirements:
- Provide thorough analysis, at least 5-8 paragraphs, much more detailed than the overview
- Reference classical texts with plain-language explanations
- Give specific, actionable advice
- Use ### ONLY for sub-topic headings. Do NOT use any # headings in body text
- Use **bold** for key terms and - lists for bullet points
- Skip basic info already covered in the overview, go straight into deep analysis`;

function buildPrompt(result: MeihuaResult, locale: string): string {
  const ctx = extractMeihuaAnalysisContext(result);

  if (locale === 'zh') {
    return `## 卦象信息
- 起卦方式：${ctx.method}
${ctx.question ? `- 所问之事：${ctx.question}` : ''}
- 本卦：${ctx.benGuaSummary}
- 互卦：${ctx.huGuaSummary}
- 变卦：${ctx.bianGuaSummary}
- 动爻：${ctx.changingLineSummary}
- 体用关系：${ctx.tiYongSummary}
- 五行分析：${ctx.wuxingAnalysis}
- 时令：${ctx.seasonalContext}

请按以下结构分析，每个维度用 ### 作为标题：
### 卦象总论
本卦含义，卦辞解读，整体态势
### 体用分析
五行生克关系，吉凶判断
### 事态发展
互卦揭示的过程和中间变化
### 最终结果
变卦揭示的走向和结局
### 动爻解读
爻辞具体指示，关键变化点
### 时机与方位
有利的时间、方向、数字
### 综合建议
总结判断，具体行动建议`;
  }

  return `## Hexagram Data
- Divination Method: ${ctx.method}
${ctx.question ? `- Question: ${ctx.question}` : ''}
- Original Hexagram: ${ctx.benGuaSummary}
- Mutual Hexagram: ${ctx.huGuaSummary}
- Changed Hexagram: ${ctx.bianGuaSummary}
- Changing Line: ${ctx.changingLineSummary}
- Ti-Yong Relationship: ${ctx.tiYongSummary}
- Five Elements: ${ctx.wuxingAnalysis}
- Season: ${ctx.seasonalContext}

Please analyze in this structure, use ### as heading for each dimension:
### Hexagram Overview
Original hexagram meaning, judgement text interpretation, overall situation
### Ti-Yong Analysis
Five-element relationships, fortune determination
### Development Process
What the mutual hexagram reveals about the process
### Final Outcome
What the changed hexagram reveals about the result
### Changing Line Reading
Specific guidance from the line text
### Timing & Direction
Favorable timing, directions, and numbers
### Overall Advice
Summary and specific action recommendations`;
}

function buildDetailPrompt(
  result: MeihuaResult,
  locale: string,
  dimension: string,
  summary: string,
): string {
  const ctx = extractMeihuaAnalysisContext(result);

  const hexInfo = locale === 'zh'
    ? `起卦：${ctx.method} | 本卦：${ctx.benGuaSummary} | 互卦：${ctx.huGuaSummary} | 变卦：${ctx.bianGuaSummary} | 动爻：${ctx.changingLineSummary} | 体用：${ctx.tiYongSummary} | 五行：${ctx.wuxingAnalysis} | 时令：${ctx.seasonalContext}`
    : `Method: ${ctx.method} | Original: ${ctx.benGuaSummary} | Mutual: ${ctx.huGuaSummary} | Changed: ${ctx.bianGuaSummary} | Changing: ${ctx.changingLineSummary} | Ti-Yong: ${ctx.tiYongSummary} | Elements: ${ctx.wuxingAnalysis} | Season: ${ctx.seasonalContext}`;

  if (locale === 'zh') {
    return `## 卦象摘要
${hexInfo}

## 概览分析（已完成）
${summary}

## 请对「${dimension}」进行深入专项分析
要求：
- 比上面的概览更加详尽深入，至少分 3-5 个子话题展开
- 仅用 ### 作为子话题标题，正文中不要使用任何 # 标记
- 结合此卦的具体信息进行个性化分析
- 给出具体可操作的建议`;
  }

  return `## Hexagram Summary
${hexInfo}

## Overview (already done)
${summary}

## Please provide an in-depth analysis of "${dimension}"
Requirements:
- Much more detailed than the overview above, cover 3-5 sub-topics
- Use ### ONLY for sub-topic headings, do NOT use any # headings in body text
- Personalize analysis based on this specific hexagram reading
- Give specific, actionable advice`;
}

export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'NO_API_KEY' }, { status: 503 });
  }

  const { result, locale = 'zh', dimension, summary } = (await req.json()) as {
    result: MeihuaResult;
    locale?: string;
    dimension?: string;
    summary?: string;
  };

  const isDetail = Boolean(dimension && summary);

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  });

  const systemPrompt = isDetail
    ? (locale === 'zh' ? DETAIL_SYSTEM_ZH : DETAIL_SYSTEM_EN)
    : (locale === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN);

  const userPrompt = isDetail
    ? buildDetailPrompt(result, locale, dimension!, summary!)
    : buildPrompt(result, locale);

  const maxTokens = isDetail ? 4000 : 3000;

  const stream = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: maxTokens,
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
