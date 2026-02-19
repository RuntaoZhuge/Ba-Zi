import OpenAI from 'openai';
import type { BaZiResult, DailyFortuneContext, WuXing } from '@bazi/domain';

export const runtime = 'nodejs';

const SYSTEM_PROMPT_ZH = `你是一位精通八字命理的大师，擅长分析每日运势。

分析要求：
- 基于用户的八字命盘，结合今日的干支信息，分析今日运势
- 语言亲切自然，避免过于晦涩
- 每个维度 2-3 段，重点突出实用建议
- 仅用 ### 作为各维度的大标题
- 可用 **加粗** 强调关键词，用 - 列表罗列要点`;

const SYSTEM_PROMPT_EN = `You are a BaZi master specialized in daily fortune analysis.

Requirements:
- Analyze daily fortune based on the user's natal chart and today's stems/branches
- Use clear, approachable language
- 2-3 paragraphs per dimension with practical advice
- Use ### ONLY for dimension headings
- Use **bold** for key terms and - lists for bullet points`;

const WUXING_ZH: Record<WuXing, string> = {
  '木': '木', '火': '火', '土': '土', '金': '金', '水': '水',
};

const WUXING_EN: Record<WuXing, string> = {
  '木': 'Wood', '火': 'Fire', '土': 'Earth', '金': 'Metal', '水': 'Water',
};

function buildPrompt(result: BaZiResult, context: DailyFortuneContext, locale: string): string {
  const { chart } = result;
  const fp = chart.fourPillars;
  const wuxingMap = locale === 'zh' ? WUXING_ZH : WUXING_EN;

  const pillars = `${fp.year.stemBranch.ganZhi} ${fp.month.stemBranch.ganZhi} ${fp.day.stemBranch.ganZhi} ${fp.hour?.stemBranch.ganZhi ?? '??'}`;

  if (locale === 'zh') {
    return `## 命盘信息
- 四柱：${pillars}
- 日主：${chart.dayMaster}
- ${chart.mingge}
- 用神：${wuxingMap[context.yongShen]}，喜神：${wuxingMap[context.xiShen]}，忌神：${wuxingMap[context.jiShen]}

## 今日信息（${context.targetDate.year}年${context.targetDate.month}月${context.targetDate.day}日）
- 今日干支：${context.todayDay}（年柱${context.todayYear}，月柱${context.todayMonth}）
- 当前年龄：${context.currentAge}岁
${context.currentDaYun ? `- 当前大运：${context.currentDaYun.ganZhi}（${context.currentDaYun.startAge}-${context.currentDaYun.endAge}岁）` : ''}
${context.currentLiuNian ? `- 当前流年：${context.currentLiuNian.ganZhi}（${context.currentLiuNian.year}年）` : ''}
- 今日天干与日主关系（十神）：${context.dayGanShiShen}
- 今日地支与命盘日支关系：${context.dayZhiRelation}
- 旬空：${context.xunKong}

请按以下结构分析今日运势：
### 今日运势总论
今日干支与命盘的整体作用，吉凶倾向
### 事业工作
今日工作状态，需要注意的事项
### 财运分析
今日财运旺衰，理财建议
### 人际关系
今日人际互动，沟通注意事项
### 健康提示
今日健康状况，需要注意的方面
### 吉时吉方
今日最佳时辰和方位
### 综合建议
今日行动指南`;
  }

  return `## Chart Info
- Four Pillars: ${pillars}
- Day Master: ${chart.dayMaster}
- ${chart.mingge}
- Useful: ${wuxingMap[context.yongShen]}, Favorable: ${wuxingMap[context.xiShen]}, Unfavorable: ${wuxingMap[context.jiShen]}

## Today (${context.targetDate.year}-${context.targetDate.month}-${context.targetDate.day})
- Today's Pillars: ${context.todayDay} (Year ${context.todayYear}, Month ${context.todayMonth})
- Current Age: ${context.currentAge}
${context.currentDaYun ? `- Current Major Fortune: ${context.currentDaYun.ganZhi} (age ${context.currentDaYun.startAge}-${context.currentDaYun.endAge})` : ''}
${context.currentLiuNian ? `- Current Annual Fortune: ${context.currentLiuNian.ganZhi} (${context.currentLiuNian.year})` : ''}
- Today's Stem vs Day Master (Ten God): ${context.dayGanShiShen}
- Today's Branch vs Natal Day Branch: ${context.dayZhiRelation}
- Void: ${context.xunKong}

Analyze today's fortune:
### Daily Overview
Overall interaction and tendency
### Career & Work
Work status and precautions
### Wealth Fortune
Financial fortune and advice
### Relationships
Interpersonal interactions
### Health Guidance
Health status and concerns
### Auspicious Times & Directions
Best hours and orientations
### Overall Advice
Action guide for today`;
}

export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'NO_API_KEY' }, { status: 503 });
  }

  const { result, context, locale = 'zh' } = (await req.json()) as {
    result: BaZiResult;
    context: DailyFortuneContext;
    locale?: string;
  };

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  });

  const systemPrompt = locale === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;
  const userPrompt = buildPrompt(result, context, locale);

  const stream = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 2500,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch {
        // stream interrupted
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
