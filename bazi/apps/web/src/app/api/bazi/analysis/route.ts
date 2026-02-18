import OpenAI from 'openai';
import { extractAnalysisContext } from '@bazi/domain';
import type { BaZiResult, WuXing } from '@bazi/domain';

export const runtime = 'nodejs';

const SYSTEM_PROMPT_ZH = `你是一位精通《滴天髓》《渊海子平》《三命通会》的传统命理大师，擅长将复杂的八字命理以通俗易懂的方式解读。

分析要求：
- 基于传统命理理论，言之有据，引用经典但不堆砌术语
- 语言亲切自然，避免过于晦涩
- 每个维度 2-3 段，重点突出，有实际指导意义
- 最后附上"综合建议"作为总结
- 仅用 ### 作为各维度的大标题（如 ### 命格总论），正文中不要使用任何 # 标记
- 可用 **加粗** 强调关键词，用 - 列表罗列要点`;

const SYSTEM_PROMPT_EN = `You are a traditional Chinese BaZi (Four Pillars of Destiny) master, deeply versed in classical texts "DiTianSui", "YuanHaiZiPing", and "SanMingTongHui". You explain complex destiny readings in an accessible, friendly manner.

Requirements:
- Ground analysis in traditional BaZi theory with classical references
- Use clear, approachable language
- 2-3 paragraphs per dimension, highlighting key insights
- End with "Overall Advice" as summary
- Use ### ONLY for dimension headings (e.g. ### Destiny Overview). Do NOT use any # headings in body text
- Use **bold** for key terms and - lists for bullet points`;

const DETAIL_SYSTEM_ZH = `你是一位精通《滴天髓》《渊海子平》《三命通会》的传统命理大师。
现在需要你对八字命盘的某一个维度进行深入、详细的专项分析。

要求：
- 深入剖析，比概览分析更加详尽，至少 5-8 段
- 结合经典理论引用原文，但用白话解释
- 给出具体、可操作的建议
- 仅用 ### 作为子话题标题，正文中不要使用任何 # 标记
- 可用 **加粗** 强调关键词，用 - 列表罗列要点
- 不要重复概览中已有的基本信息，直接深入分析`;

const DETAIL_SYSTEM_EN = `You are a traditional Chinese BaZi master, deeply versed in classical texts.
You are now providing an in-depth, detailed analysis of one specific dimension of a BaZi chart.

Requirements:
- Provide thorough analysis, at least 5-8 paragraphs, much more detailed than the overview
- Reference classical texts with plain-language explanations
- Give specific, actionable advice
- Use ### ONLY for sub-topic headings. Do NOT use any # headings in body text
- Use **bold** for key terms and - lists for bullet points
- Skip basic info already covered in the overview, go straight into deep analysis`;

const WUXING_ZH: Record<WuXing, string> = {
  '木': '木', '火': '火', '土': '土', '金': '金', '水': '水',
};

const WUXING_EN: Record<WuXing, string> = {
  '木': 'Wood', '火': 'Fire', '土': 'Earth', '金': 'Metal', '水': 'Water',
};

function buildPrompt(result: BaZiResult, locale: string): string {
  const ctx = extractAnalysisContext(result);
  const { chart, yun } = result;
  const fp = chart.fourPillars;
  const wuxingMap = locale === 'zh' ? WUXING_ZH : WUXING_EN;

  const pillars = `${fp.year.stemBranch.ganZhi} ${fp.month.stemBranch.ganZhi} ${fp.day.stemBranch.ganZhi} ${fp.hour?.stemBranch.ganZhi ?? '(时辰未知)'}`;

  if (locale === 'zh') {
    return `## 命盘信息
- 四柱：${pillars}
- 日主：${chart.dayMaster}（${wuxingMap[WUXING_ZH[ctx.yongShen] ? ctx.yongShen : '木']}... 实际为${wuxingMap[chart.wuxingDistribution ? Object.entries(chart.wuxingDistribution).find(([, v]) => v > 0)?.[0] as WuXing || '木' : '木']}）
- ${ctx.strength}（${ctx.strengthFactors}）
- 格局：${ctx.geJu}
- 用神：${wuxingMap[ctx.yongShen]}，喜神：${wuxingMap[ctx.xiShen]}，忌神：${wuxingMap[ctx.jiShen]}
- 五行分布：${ctx.wuxingSummary}
- 十神：${ctx.shishenSummary}
- 神煞：${ctx.shenshaSummary}
- 纳音：年${chart.nayin.year}，日${chart.nayin.day}
${chart.mingGong ? `- 命宫：${chart.mingGong.ganZhi}（${chart.mingGong.naYin}）` : ''}
${chart.shenGong ? `- 身宫：${chart.shenGong.ganZhi}（${chart.shenGong.naYin}）` : ''}
- 起运年龄：${yun.startAge}岁
- 大运概要：${ctx.dayunSummary}

请按以下结构分析，每个维度用 ### 作为标题：
### 命格总论
格局特点，日主强弱，用神喜忌
### 性格特征
日主特质，十神影响
### 事业方向
适合行业，发展建议
### 财运分析
求财方式，理财建议
### 婚姻感情
感情态度，配偶特征
### 健康提示
五行偏枯对应脏腑
### 大运流年
关键运程节点分析
### 综合建议
总结要点`;
  }

  return `## Chart Data
- Four Pillars: ${pillars}
- Day Master: ${chart.dayMaster} (${wuxingMap[ctx.yongShen]})
- ${ctx.strength === '身强' ? 'Strong' : 'Weak'} Day Master (${ctx.strengthFactors})
- Pattern: ${ctx.geJu}
- Useful God: ${wuxingMap[ctx.yongShen]}, Favorable: ${wuxingMap[ctx.xiShen]}, Unfavorable: ${wuxingMap[ctx.jiShen]}
- Five Elements: ${ctx.wuxingSummary}
- Ten Gods: ${ctx.shishenSummary}
- Spirit Stars: ${ctx.shenshaSummary}
- NaYin: Year ${chart.nayin.year}, Day ${chart.nayin.day}
${chart.mingGong ? `- Destiny Palace: ${chart.mingGong.ganZhi} (${chart.mingGong.naYin})` : ''}
- Fortune Start Age: ${yun.startAge}
- Fortune Overview: ${ctx.dayunSummary}

Please analyze in this structure, use ### as heading for each dimension:
### Destiny Overview
Pattern characteristics, day master strength, useful elements
### Personality Traits
Day master qualities, ten gods influence
### Career Direction
Suitable industries, development advice
### Wealth Analysis
Wealth acquisition style, financial advice
### Marriage & Relationships
Attitude toward love, partner characteristics
### Health Guidance
Five element imbalance and corresponding organs
### Fortune Cycles
Key periods and turning points
### Overall Advice
Summary and recommendations`;
}

/** Build chart info string shared by detail prompts */
function buildChartInfo(result: BaZiResult, locale: string): string {
  const ctx = extractAnalysisContext(result);
  const { chart, yun } = result;
  const fp = chart.fourPillars;
  const wuxingMap = locale === 'zh' ? WUXING_ZH : WUXING_EN;
  const pillars = `${fp.year.stemBranch.ganZhi} ${fp.month.stemBranch.ganZhi} ${fp.day.stemBranch.ganZhi} ${fp.hour?.stemBranch.ganZhi ?? '(时辰未知)'}`;

  return locale === 'zh'
    ? `四柱：${pillars} | 日主：${chart.dayMaster} | ${ctx.strength}（${ctx.strengthFactors}）| 格局：${ctx.geJu} | 用神：${wuxingMap[ctx.yongShen]}，喜神：${wuxingMap[ctx.xiShen]}，忌神：${wuxingMap[ctx.jiShen]} | 五行：${ctx.wuxingSummary} | 十神：${ctx.shishenSummary} | 神煞：${ctx.shenshaSummary} | 纳音：年${chart.nayin.year}，日${chart.nayin.day} | 起运：${yun.startAge}岁 | 大运：${ctx.dayunSummary}`
    : `Pillars: ${pillars} | Day Master: ${chart.dayMaster} | ${ctx.strength === '身强' ? 'Strong' : 'Weak'} (${ctx.strengthFactors}) | Pattern: ${ctx.geJu} | Useful: ${wuxingMap[ctx.yongShen]}, Favorable: ${wuxingMap[ctx.xiShen]}, Unfavorable: ${wuxingMap[ctx.jiShen]} | Elements: ${ctx.wuxingSummary} | Ten Gods: ${ctx.shishenSummary} | Stars: ${ctx.shenshaSummary} | Fortune start: ${yun.startAge}`;
}

function buildDetailPrompt(
  result: BaZiResult,
  locale: string,
  dimension: string,
  summary: string,
): string {
  const chartInfo = buildChartInfo(result, locale);

  if (locale === 'zh') {
    return `## 命盘摘要
${chartInfo}

## 概览分析（已完成）
${summary}

## 请对「${dimension}」进行深入专项分析
要求：
- 比上面的概览更加详尽深入，至少分 3-5 个子话题展开
- 仅用 ### 作为子话题标题，正文中不要使用任何 # 标记
- 结合此命盘的具体信息进行个性化分析
- 给出具体可操作的建议`;
  }

  return `## Chart Summary
${chartInfo}

## Overview (already done)
${summary}

## Please provide an in-depth analysis of "${dimension}"
Requirements:
- Much more detailed than the overview above, cover 3-5 sub-topics
- Use ### ONLY for sub-topic headings, do NOT use any # headings in body text
- Personalize analysis based on this specific chart
- Give specific, actionable advice`;
}

function buildPeriodPrompt(
  result: BaZiResult,
  locale: string,
  period: { type: 'dayun' | 'liunian'; ganZhi: string; startAge?: number; endAge?: number; startYear?: number; endYear?: number; year?: number; age?: number },
): string {
  const chartInfo = buildChartInfo(result, locale);

  if (locale === 'zh') {
    if (period.type === 'dayun') {
      return `## 命盘信息
${chartInfo}

## 请对「${period.ganZhi}」大运进行详细分析（${period.startAge}-${period.endAge}岁，${period.startYear}-${period.endYear}年）

请从以下角度深入分析：
### 大运五行与原局作用
分析${period.ganZhi}大运天干地支与原命盘的生克关系、合冲刑害
### 对用神喜忌的影响
此步大运是助用神还是助忌神，整体吉凶如何
### 事业影响
此大运对事业发展的具体影响
### 财运变化
此大运对财运的影响
### 感情婚姻
此大运对感情婚姻的影响
### 健康注意
此大运需要注意的健康问题
### 关键流年
此大运中哪些流年特别重要，需要注意什么
### 具体建议
在此大运中应该如何把握机遇、规避风险`;
    }
    return `## 命盘信息
${chartInfo}

## 请对「${period.ganZhi}」流年进行详细分析（${period.year}年，${period.age}岁）

请从以下角度深入分析：
### 流年天干地支与原局作用
分析${period.ganZhi}流年天干地支与原命盘的生克关系、合冲刑害
### 流年与大运交互
此流年与当前大运的天干地支如何相互作用
### 事业运势
此年事业方面的机遇和挑战
### 财运分析
此年财运的旺衰变化
### 感情运势
此年感情方面的变化
### 健康提醒
此年需要注意的健康问题
### 月份重点
哪几个月份特别关键，需要格外注意
### 具体建议
在此年中应该如何行动`;
  }

  if (period.type === 'dayun') {
    return `## Chart Data
${chartInfo}

## Please analyze the "${period.ganZhi}" Major Fortune period in detail (age ${period.startAge}-${period.endAge}, years ${period.startYear}-${period.endYear})

Analyze from these angles:
### Interaction with Natal Chart
How ${period.ganZhi}'s stems and branches interact with the natal chart
### Impact on Useful Elements
Whether this period supports or hinders the useful god
### Career Impact
Specific effects on career development
### Wealth Changes
Impact on financial fortune
### Love & Marriage
Effects on relationships
### Health Concerns
Health issues to watch during this period
### Key Annual Fortunes
Which years within this period are especially important
### Specific Advice
How to seize opportunities and avoid risks`;
  }
  return `## Chart Data
${chartInfo}

## Please analyze the "${period.ganZhi}" Annual Fortune in detail (year ${period.year}, age ${period.age})

Analyze from these angles:
### Interaction with Natal Chart
How ${period.ganZhi}'s stems and branches interact with the natal chart
### Annual & Major Fortune Interaction
How this year interacts with the current major fortune period
### Career Prospects
Opportunities and challenges this year
### Wealth Analysis
Financial fortune changes this year
### Love & Relationships
Relationship changes this year
### Health Reminders
Health issues to watch this year
### Key Months
Which months are especially important
### Specific Advice
How to act this year`;
}

export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'NO_API_KEY' }, { status: 503 });
  }

  const { result, locale = 'zh', dimension, summary, period } = (await req.json()) as {
    result: BaZiResult;
    locale?: string;
    dimension?: string;
    summary?: string;
    period?: { type: 'dayun' | 'liunian'; ganZhi: string; startAge?: number; endAge?: number; startYear?: number; endYear?: number; year?: number; age?: number };
  };

  // Three modes: period-specific, detail (dimension + summary), overview
  const isPeriodAnalysis = Boolean(period);
  const isDetail = Boolean(dimension && summary);

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  });

  let systemPrompt: string;
  let userPrompt: string;
  let maxTokens: number;

  if (isPeriodAnalysis) {
    systemPrompt = locale === 'zh' ? DETAIL_SYSTEM_ZH : DETAIL_SYSTEM_EN;
    userPrompt = buildPeriodPrompt(result, locale, period!);
    maxTokens = 4000;
  } else if (isDetail) {
    systemPrompt = locale === 'zh' ? DETAIL_SYSTEM_ZH : DETAIL_SYSTEM_EN;
    userPrompt = buildDetailPrompt(result, locale, dimension!, summary!);
    maxTokens = 4000;
  } else {
    systemPrompt = locale === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;
    userPrompt = buildPrompt(result, locale);
    maxTokens = 3000;
  }

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
