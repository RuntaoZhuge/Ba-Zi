import OpenAI from 'openai';
import { extractZiweiAnalysisContext } from '@bazi/domain';
import type { ZiweiResult } from '@bazi/domain';

export const runtime = 'nodejs';

const SYSTEM_PROMPT_ZH = `你是一位精通紫微斗数的命理大师，擅长通过星曜组合、四化飞星、宫位关系来解读命盘格局。

分析要求：
- 基于传统紫微斗数理论，以星曜亮度和四化为核心
- 语言亲切自然，避免过于晦涩
- 每个维度 2-3 段，重点突出，有实际指导意义
- 仅用 ### 作为各维度的大标题（如 ### 命宫格局），正文中不要使用任何 # 标记
- 可用 **加粗** 强调关键词，用 - 列表罗列要点`;

const SYSTEM_PROMPT_EN = `You are a master of Zi Wei Dou Shu (Purple Star Astrology), an expert who specializes in reading destiny charts through star combinations, Four Transformations, and palace relationships.

Requirements:
- Ground analysis in traditional Zi Wei Dou Shu theory, with star brightness and Si Hua as the core
- Use clear, approachable language
- 2-3 paragraphs per dimension, highlighting key insights
- Use ### ONLY for dimension headings (e.g. ### Destiny Palace Pattern). Do NOT use any # headings in body text
- Use **bold** for key terms and - lists for bullet points`;

const DETAIL_SYSTEM_ZH = `你是一位精通紫微斗数的命理大师。
现在需要你对某一个维度进行深入、详细的专项分析。

要求：
- 深入剖析，比概览分析更加详尽，至少 5-8 段
- 结合星曜组合、亮度、四化的具体信息进行个性化分析
- 给出具体、可操作的建议
- 仅用 ### 作为子话题标题，正文中不要使用任何 # 标记
- 可用 **加粗** 强调关键词，用 - 列表罗列要点
- 不要重复概览中已有的基本信息，直接深入分析`;

const DETAIL_SYSTEM_EN = `You are a master of Zi Wei Dou Shu (Purple Star Astrology).
You are now providing an in-depth, detailed analysis of one specific dimension.

Requirements:
- Provide thorough analysis, at least 5-8 paragraphs, much more detailed than the overview
- Personalize based on specific star combinations, brightness, and Four Transformations
- Give specific, actionable advice
- Use ### ONLY for sub-topic headings. Do NOT use any # headings in body text
- Use **bold** for key terms and - lists for bullet points
- Skip basic info already covered in the overview, go straight into deep analysis`;

function buildPrompt(result: ZiweiResult, locale: string): string {
  const ctx = extractZiweiAnalysisContext(result);

  if (locale === 'zh') {
    return `## 命盘信息
- 姓名：${ctx.name}
- 性别：${ctx.gender}
- 出生：${ctx.lunarBirthInfo}
- 五行局：${ctx.wuxingJu}
- 命宫：${ctx.mingPalace}
- 身宫：${ctx.shenPalace}
- 四化：${ctx.siHuaSummary}
- 格局特征：${ctx.keyPattern}
- 大运：${ctx.decadeLucks}

## 十二宫详情
${ctx.allPalaces}

请按以下结构分析，每个维度用 ### 作为标题：
### 命宫格局
命宫主星组合、亮度、四化解读，整体命格评价
### 事业财运
官禄宫、财帛宫、田宅宫分析，事业方向和财运趋势
### 感情婚姻
夫妻宫、子女宫分析，感情态度和婚姻状况
### 人际关系
兄弟宫、交友宫分析，贵人运和社交特质
### 健康状况
疾厄宫分析，健康注意事项
### 大运走势
主要大运时期分析，人生关键节点
### 综合建议
整体格局判断，人生发展建议`;
  }

  return `## Chart Information
- Name: ${ctx.name}
- Gender: ${ctx.gender}
- Birth: ${ctx.lunarBirthInfo}
- Five Element Bureau: ${ctx.wuxingJu}
- Destiny Palace: ${ctx.mingPalace}
- Body Palace: ${ctx.shenPalace}
- Four Transformations: ${ctx.siHuaSummary}
- Key Patterns: ${ctx.keyPattern}
- Decade Luck: ${ctx.decadeLucks}

## Twelve Palaces Detail
${ctx.allPalaces}

Please analyze in this structure, use ### as heading for each dimension:
### Destiny Palace Pattern
Main star combinations, brightness, Four Transformations, overall destiny assessment
### Career & Wealth
Career Palace, Wealth Palace, Property Palace analysis
### Love & Marriage
Marriage Palace, Children Palace analysis
### Relationships
Siblings Palace, Friends Palace analysis
### Health
Illness Palace analysis
### Decade Luck Trends
Major life periods and key turning points
### Overall Advice
Comprehensive assessment and life development suggestions`;
}

function buildDetailPrompt(
  result: ZiweiResult,
  locale: string,
  dimension: string,
  summary: string,
): string {
  const ctx = extractZiweiAnalysisContext(result);

  const chartInfo = locale === 'zh'
    ? `命盘：${ctx.lunarBirthInfo} | ${ctx.wuxingJu} | 命宫：${ctx.mingPalace} | 四化：${ctx.siHuaSummary} | 格局：${ctx.keyPattern}`
    : `Chart: ${ctx.lunarBirthInfo} | ${ctx.wuxingJu} | Destiny: ${ctx.mingPalace} | Si Hua: ${ctx.siHuaSummary} | Pattern: ${ctx.keyPattern}`;

  if (locale === 'zh') {
    return `## 命盘摘要
${chartInfo}

## 十二宫
${ctx.allPalaces}

## 概览分析（已完成）
${summary}

## 请对「${dimension}」进行深入专项分析
要求：
- 比上面的概览更加详尽深入，至少分 3-5 个子话题展开
- 仅用 ### 作为子话题标题，正文中不要使用任何 # 标记
- 结合此命盘的具体星曜组合进行个性化分析
- 给出具体可操作的建议`;
  }

  return `## Chart Summary
${chartInfo}

## Twelve Palaces
${ctx.allPalaces}

## Overview (already done)
${summary}

## Please provide an in-depth analysis of "${dimension}"
Requirements:
- Much more detailed than the overview above, cover 3-5 sub-topics
- Use ### ONLY for sub-topic headings, do NOT use any # headings in body text
- Personalize analysis based on this specific chart's star combinations
- Give specific, actionable advice`;
}

export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'NO_API_KEY' }, { status: 503 });
  }

  const { result, locale = 'zh', dimension, summary } = (await req.json()) as {
    result: ZiweiResult;
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
