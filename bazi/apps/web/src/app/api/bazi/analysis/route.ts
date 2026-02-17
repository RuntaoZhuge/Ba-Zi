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
- 使用 Markdown 格式，用 ## 作为各维度标题，**加粗**关键词`;

const SYSTEM_PROMPT_EN = `You are a traditional Chinese BaZi (Four Pillars of Destiny) master, deeply versed in classical texts "DiTianSui", "YuanHaiZiPing", and "SanMingTongHui". You explain complex destiny readings in an accessible, friendly manner.

Requirements:
- Ground analysis in traditional BaZi theory with classical references
- Use clear, approachable language
- 2-3 paragraphs per dimension, highlighting key insights
- End with "Overall Advice" as summary
- Use Markdown with ## headings and **bold** for key terms`;

const DETAIL_SYSTEM_ZH = `你是一位精通《滴天髓》《渊海子平》《三命通会》的传统命理大师。
现在需要你对八字命盘的某一个维度进行深入、详细的专项分析。

要求：
- 深入剖析，比概览分析更加详尽，至少 5-8 段
- 结合经典理论引用原文，但用白话解释
- 给出具体、可操作的建议
- 使用 ### 作为子标题，**加粗**关键词
- 不要重复概览中已有的基本信息，直接深入分析`;

const DETAIL_SYSTEM_EN = `You are a traditional Chinese BaZi master, deeply versed in classical texts.
You are now providing an in-depth, detailed analysis of one specific dimension of a BaZi chart.

Requirements:
- Provide thorough analysis, at least 5-8 paragraphs, much more detailed than the overview
- Reference classical texts with plain-language explanations
- Give specific, actionable advice
- Use ### for sub-headings and **bold** for key terms
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

## 请按以下结构分析
1. **命格总论**：格局特点，日主强弱，用神喜忌
2. **性格特征**：日主特质，十神影响
3. **事业方向**：适合行业，发展建议
4. **财运分析**：求财方式，理财建议
5. **婚姻感情**：感情态度，配偶特征
6. **健康提示**：五行偏枯对应脏腑
7. **大运流年**：关键运程节点分析
8. **综合建议**：总结要点`;
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

## Please analyze in this structure
1. **Destiny Overview**: Pattern characteristics, day master strength, useful elements
2. **Personality Traits**: Day master qualities, ten gods influence
3. **Career Direction**: Suitable industries, development advice
4. **Wealth Analysis**: Wealth acquisition style, financial advice
5. **Marriage & Relationships**: Attitude toward love, partner characteristics
6. **Health Guidance**: Five element imbalance and corresponding organs
7. **Fortune Cycles**: Key periods and turning points
8. **Overall Advice**: Summary and recommendations`;
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
- 用 ### 作为子标题
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
- Use ### for sub-headings
- Personalize analysis based on this specific chart
- Give specific, actionable advice`;
}

/** Dimension-specific prompt instructions */
const DIMENSION_PROMPTS_ZH: Record<string, string> = {
  career: `## 请对此命盘进行详细的「事业方向」专项分析
请从以下角度深入分析：
### 适合行业与职业
基于日主五行、用神喜忌、十神组合，分析最适合的行业方向
### 职场风格与优势
从十神性格特征分析职场中的行为模式和核心竞争力
### 创业还是就职
基于命格分析适合自主创业还是受雇于人
### 贵人方位与合作
哪些属相、五行方位的人是事业贵人
### 事业发展节点
结合大运流年分析事业关键转折期
### 具体建议
给出可操作的职业发展建议`,

  wealth: `## 请对此命盘进行详细的「财运分析」专项分析
请从以下角度深入分析：
### 正财与偏财
分析命盘中正财偏财的强弱，适合稳定收入还是投资投机
### 求财方式
基于用神喜忌分析最适合的赚钱方式和行业
### 理财风格
十神组合对理财习惯的影响，花钱模式分析
### 财运旺衰时期
结合大运流年分析财运高峰期和低谷期
### 破财风险
命盘中的破财信号和需要注意的年份
### 具体建议
给出可操作的理财和求财建议`,

  marriage: `## 请对此命盘进行详细的「婚姻感情」专项分析
请从以下角度深入分析：
### 感情观与态度
日主和十神组合对感情态度的影响
### 配偶特征
从配偶星（男看财星，女看官星）分析另一半的性格、外貌、职业特征
### 婚姻质量
夫妻宫（日支）状态分析婚姻和谐度
### 桃花运时期
结合大运流年分析恋爱和婚姻的关键年份
### 感情注意事项
命盘中的不利婚姻信号和化解方法
### 具体建议
给出可操作的感情建议`,

  health: `## 请对此命盘进行详细的「健康分析」专项分析
请从以下角度深入分析：
### 五行对应脏腑
木→肝胆、火→心小肠、土→脾胃、金→肺大肠、水→肾膀胱，分析五行偏枯影响
### 先天体质特征
基于日主强弱和五行分布分析先天体质
### 易发疾病
五行过旺或不足对应的健康隐患
### 养生方向
基于用神喜忌给出五行养生建议（饮食、运动、方位）
### 健康注意年份
结合大运流年分析需要特别注意健康的时期
### 具体建议
给出可操作的养生和保健建议`,

  fortune: `## 请对此命盘进行详细的「大运流年」专项分析
请从以下角度深入分析：
### 大运总览
逐步分析每步大运的五行、十神与原命盘的作用关系
### 当前大运详析
重点分析当前所走大运的吉凶、机遇和挑战
### 近五年流年分析
逐年分析近五年每年的天干地支与命盘的关系，指出吉凶事项
### 关键转折大运
标注一生中最重要的几步大运及影响方向（事业、财运、感情、健康）
### 大运与流年交互
分析大运流年的天干地支组合产生的合、冲、刑、害
### 具体建议
给出当前及未来几年的重点注意事项和行动建议`,
};

const DIMENSION_PROMPTS_EN: Record<string, string> = {
  career: `## Please provide a detailed "Career Direction" analysis
Analyze from these angles:
### Suitable Industries & Occupations
Based on day master element, useful gods, and ten gods combinations
### Workplace Style & Strengths
From ten gods personality traits, analyze core competencies
### Entrepreneurship vs Employment
Based on destiny pattern, analyze which path suits better
### Beneficial People & Directions
Which zodiac signs and element directions bring career luck
### Career Milestones
Key career turning points based on fortune cycles
### Specific Advice
Give actionable career development recommendations`,

  wealth: `## Please provide a detailed "Wealth Analysis"
Analyze from these angles:
### Direct vs Indirect Wealth
Analyze regular income vs investment/speculative income potential
### Wealth Acquisition Methods
Best money-making approaches based on useful elements
### Financial Habits
How ten gods influence spending and saving patterns
### Wealth Peak & Valley Periods
Key financial periods from fortune cycles
### Financial Risks
Warning signs and years to watch out for
### Specific Advice
Give actionable financial recommendations`,

  marriage: `## Please provide a detailed "Marriage & Relationships" analysis
Analyze from these angles:
### Attitude Toward Love
How day master and ten gods influence romantic outlook
### Partner Characteristics
From spouse star (wealth for men, official for women) analyze partner traits
### Marriage Quality
Day branch (spouse palace) analysis for harmony
### Romance Timing
Key years for love and marriage from fortune cycles
### Cautions
Unfavorable marriage signals and remedies
### Specific Advice
Give actionable relationship recommendations`,

  health: `## Please provide a detailed "Health Analysis"
Analyze from these angles:
### Five Elements & Organs
Wood→Liver, Fire→Heart, Earth→Spleen, Metal→Lungs, Water→Kidneys
### Constitutional Traits
Innate physical constitution from day master strength and element distribution
### Health Vulnerabilities
Health risks from element excess or deficiency
### Wellness Direction
Element-based wellness advice (diet, exercise, direction)
### Health Alert Years
Years requiring extra health attention from fortune cycles
### Specific Advice
Give actionable health and wellness recommendations`,

  fortune: `## Please provide a detailed "Fortune Cycles" analysis
Analyze from these angles:
### Major Fortune Overview
Analyze each major fortune period's elements, ten gods interaction with natal chart
### Current Major Fortune
Focus on current fortune period's opportunities and challenges
### Next 5 Annual Fortunes
Year-by-year analysis of upcoming annual fortunes
### Key Turning Points
Identify life's most important fortune periods for career, wealth, love, health
### Fortune Interactions
Analyze combinations, clashes, and punishments between fortune cycles and natal chart
### Specific Advice
Give actionable advice for current and upcoming periods`,
};

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

function buildDimensionPrompt(
  result: BaZiResult,
  locale: string,
  dimension: string,
): string {
  const chartInfo = buildChartInfo(result, locale);
  const prompts = locale === 'zh' ? DIMENSION_PROMPTS_ZH : DIMENSION_PROMPTS_EN;
  const dimensionInstructions = prompts[dimension] || prompts['career'];

  if (locale === 'zh') {
    return `## 命盘信息
${chartInfo}

${dimensionInstructions}

要求：
- 至少分 5 个子话题，每个子话题 2-3 段
- 用 ### 作为子标题，**加粗**关键词
- 结合此人具体命盘数据进行个性化分析
- 最后给出具体可操作的建议`;
  }

  return `## Chart Data
${chartInfo}

${dimensionInstructions}

Requirements:
- Cover at least 5 sub-topics, 2-3 paragraphs each
- Use ### for sub-headings, **bold** for key terms
- Personalize based on this specific chart
- End with specific, actionable advice`;
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

  // Four modes: period-specific, standalone dimension, detail (dimension + summary), overview
  const isPeriodAnalysis = Boolean(period);
  const isStandaloneDimension = Boolean(dimension && !summary && !period);
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
  } else if (isStandaloneDimension) {
    systemPrompt = locale === 'zh' ? DETAIL_SYSTEM_ZH : DETAIL_SYSTEM_EN;
    userPrompt = buildDimensionPrompt(result, locale, dimension!);
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
