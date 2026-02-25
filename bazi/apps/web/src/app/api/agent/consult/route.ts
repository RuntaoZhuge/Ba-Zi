import OpenAI from 'openai';
import {
  calculateBaZi,
  extractAnalysisContext,
  calculateMeihua,
  extractMeihuaAnalysisContext,
  calculateQimen,
  extractQimenAnalysisContext,
  calculateLiuyao,
  extractLiuyaoAnalysisContext,
  calculateLiuren,
  extractLiurenAnalysisContext,
} from '@bazi/domain';
import type { BirthInput } from '@bazi/domain';

export const runtime = 'nodejs';

// === Types ===

interface Profile {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: 'male' | 'female';
  calendarType: 'solar' | 'lunar';
}

type Method = 'bazi' | 'meihua' | 'qimen' | 'liuyao' | 'liuren';

interface MethodResult {
  method: Method;
  label: string;
  context: string;
}

// === Question Classification ===

function classifyQuestion(question: string, hasProfile: boolean): Method[] {
  // Life path, personality, career, fortune cycles
  const lifePattern =
    /命|性格|事业|工作|财运|婚姻|感情|健康|大运|流年|命格|一生|人生|命运|前途|运气|运程|career|personality|fortune|destiny|wealth|health|marriage|life/i;

  // Today/daily fortune
  const dailyPattern =
    /今天|今日|明天|明日|每日|每天|日运|today|tomorrow|daily/i;

  // Timing, strategy, direction
  const timingPattern =
    /方向|方位|时机|何时|什么时候|哪里|去哪|搬家|出行|开业|动土|择日|选日|direction|when|where|timing|move|travel/i;

  // Specific event decision
  const eventPattern =
    /应该|该不该|适合|可以|能不能|要不要|好不好|值不值|选择|决定|should|suitable|decide|choose/i;

  // Outcome prediction
  const outcomePattern =
    /能否|成功|结果|会不会|是否|有没有|能成|能赢|吉凶|成败|outcome|succeed|result|will/i;

  // BaZi-specific life questions (requires birth info)
  if (hasProfile && lifePattern.test(question)) {
    return ['bazi'];
  }

  // Daily fortune (BaZi + supplementary Meihua)
  if (hasProfile && dailyPattern.test(question)) {
    return ['bazi', 'meihua'];
  }

  // Timing and direction → QiMen
  if (timingPattern.test(question)) {
    return hasProfile ? ['qimen', 'bazi'] : ['qimen'];
  }

  // Outcome prediction → LiuYao
  if (outcomePattern.test(question)) {
    return ['liuyao'];
  }

  // Specific event/decision → Meihua
  if (eventPattern.test(question)) {
    return ['meihua'];
  }

  // Default fallback
  if (hasProfile) {
    return ['bazi', 'meihua'];
  }
  return ['meihua'];
}

// === Calculator Runners ===

function runBazi(profile: Profile, question: string): MethodResult | null {
  try {
    const input: BirthInput = {
      year: profile.year,
      month: profile.month,
      day: profile.day,
      hour: profile.hour,
      minute: profile.minute,
      gender: profile.gender,
      calendarType: profile.calendarType,
    };
    const result = calculateBaZi(input);
    const ctx = extractAnalysisContext(result);
    const fp = result.chart.fourPillars;
    const pillars = `${fp.year.stemBranch.ganZhi} ${fp.month.stemBranch.ganZhi} ${fp.day.stemBranch.ganZhi} ${fp.hour?.stemBranch.ganZhi ?? '(时辰未知)'}`;

    const context = [
      `【八字命盘】`,
      `四柱：${pillars}`,
      `日主：${result.chart.dayMaster}`,
      `${ctx.strength}（${ctx.strengthFactors}）`,
      `格局：${ctx.geJu}`,
      `用神：${ctx.yongShen}，喜神：${ctx.xiShen}，忌神：${ctx.jiShen}`,
      `五行：${ctx.wuxingSummary}`,
      `十神：${ctx.shishenSummary}`,
      `神煞：${ctx.shenshaSummary}`,
      `纳音：年${result.chart.nayin.year}，日${result.chart.nayin.day}`,
      result.chart.mingGong
        ? `命宫：${result.chart.mingGong.ganZhi}（${result.chart.mingGong.naYin}）`
        : '',
      `起运：${result.yun.startAge}岁`,
      `大运：${ctx.dayunSummary}`,
    ]
      .filter(Boolean)
      .join('\n');

    return { method: 'bazi', label: '八字命盘', context };
  } catch {
    return null;
  }
}

function runMeihua(question: string): MethodResult | null {
  try {
    const now = new Date();
    const result = calculateMeihua({
      method: 'time',
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      question,
    });
    const ctx = extractMeihuaAnalysisContext(result);

    const context = [
      `【梅花易数】`,
      `起卦方式：${ctx.method}`,
      `本卦：${ctx.benGuaSummary}`,
      `互卦：${ctx.huGuaSummary}`,
      `变卦：${ctx.bianGuaSummary}`,
      `动爻：${ctx.changingLineSummary}`,
      `体用关系：${ctx.tiYongSummary}`,
      `五行分析：${ctx.wuxingAnalysis}`,
      `时令：${ctx.seasonalContext}`,
    ].join('\n');

    return { method: 'meihua', label: '梅花易数', context };
  } catch {
    return null;
  }
}

function runQimen(question: string): MethodResult | null {
  try {
    const now = new Date();
    const result = calculateQimen({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      question,
    });
    const ctx = extractQimenAnalysisContext(result);

    const context = [
      `【奇门遁甲】`,
      `局：${ctx.juInfo}`,
      `日时：${ctx.dayHourGanZhi}`,
      `值符：${ctx.zhiFu}`,
      `值使：${ctx.zhiShi}`,
      ctx.xunInfo,
      `格局特征：${ctx.patterns}`,
      ``,
      `九宫详情：`,
      ctx.palaceSummary,
    ].join('\n');

    return { method: 'qimen', label: '奇门遁甲', context };
  } catch {
    return null;
  }
}

function runLiuyao(question: string): MethodResult | null {
  try {
    const now = new Date();
    const result = calculateLiuyao({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      question,
      method: 'random',
    });
    const ctx = extractLiuyaoAnalysisContext(result);

    const context = [
      `【六爻卦象】`,
      ctx.hexInfo,
      ctx.dayMonth,
      ctx.movingInfo,
      ctx.changedHex,
      `六爻详情：`,
      ctx.linesSummary,
      ctx.hiddenGods,
      ctx.xunKong,
    ].join('\n');

    return { method: 'liuyao', label: '六爻纳甲', context };
  } catch {
    return null;
  }
}

function runLiuren(question: string): MethodResult | null {
  try {
    const now = new Date();
    const result = calculateLiuren({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      question,
    });
    const ctx = extractLiurenAnalysisContext(result);

    const context = [
      `【大六壬】`,
      ctx.dayHourInfo,
      ctx.monthJiang,
      `四课：\n${ctx.lessonsSummary}`,
      ctx.transmissionInfo,
      ctx.xunKong,
    ].join('\n');

    return { method: 'liuren', label: '大六壬', context };
  } catch {
    return null;
  }
}

// === Method Name Mapping ===

const METHOD_LABELS: Record<Method, { zh: string; en: string }> = {
  bazi: { zh: '八字命盘', en: 'BaZi Four Pillars' },
  meihua: { zh: '梅花易数', en: 'Plum Blossom Numerology' },
  qimen: { zh: '奇门遁甲', en: 'Qi Men Dun Jia' },
  liuyao: { zh: '六爻纳甲', en: 'Six Lines Divination' },
  liuren: { zh: '大六壬', en: 'Da Liu Ren' },
};

const METHOD_REASONS: Record<Method, { zh: string; en: string }> = {
  bazi: {
    zh: '您的问题涉及命理、运势或人生方向，八字命盘是最适合的分析工具',
    en: 'Your question relates to destiny, fortune, or life direction — BaZi is the most suitable analysis method',
  },
  meihua: {
    zh: '您的问题涉及具体事件的决策判断，梅花易数善于通过卦象揭示事物本质',
    en: 'Your question involves a specific event or decision — Plum Blossom excels at revealing the nature of situations',
  },
  qimen: {
    zh: '您的问题涉及时机、方位或策略选择，奇门遁甲是最佳的预测决策工具',
    en: 'Your question involves timing, direction, or strategy — Qi Men is the best tool for prediction and decision-making',
  },
  liuyao: {
    zh: '您的问题涉及具体事项的成败吉凶，六爻占卜能给出明确的判断',
    en: 'Your question involves the outcome of a specific matter — Six Lines divination provides clear judgment',
  },
  liuren: {
    zh: '您的问题涉及事态发展预测，大六壬擅长推演事物的来龙去脉',
    en: 'Your question involves predicting how a situation will develop — Da Liu Ren excels at tracing cause and effect',
  },
};

// === System Prompts ===

const SYSTEM_PROMPT_ZH = `你是一位精通多种传统术数的命理大师，融会贯通八字命理、梅花易数、奇门遁甲、六爻纳甲、大六壬等预测体系。你的名号是「明德先生」。

你的角色：
- 像一位经验丰富的老先生，温和而有见地
- 根据求问者的问题，运用最合适的术数方法进行分析
- 将专业术语转化为通俗易懂的语言
- 给出具体、可操作的建议

**对话连贯性（重要）：**
- 你能记住之前的所有对话内容
- 当求问者继续追问时，要基于之前的分析进行更深入的解读
- 如果之前已经分析过某个方面，不要简单重复，而是给出新的角度或更具体的建议
- 关注求问者问题的演变，从中洞察其真实关切
- 如果发现求问者的问题存在矛盾或反复，温和地指出并给出智慧的引导

分析要求：
- 先简要说明你采用了哪种（些）术数方法及原因
- 基于排盘结果进行深入解读，言之有据
- 语言亲切自然，像朋友间的交谈，但保持专业深度
- 给出明确的吉凶判断和行动建议
- 仅用 ### 作为各部分的大标题，正文中不要使用任何 # 标记
- 可用 **加粗** 强调关键词，用 - 列表罗列要点
- 最后以"明德先生寄语"作为总结，给出温暖而有智慧的建议`;

const SYSTEM_PROMPT_EN = `You are a master diviner proficient in multiple traditional Chinese divination systems: BaZi (Four Pillars), Meihua Yishu (Plum Blossom), Qi Men Dun Jia, Liu Yao (Six Lines), and Da Liu Ren. Your title is "Master Mingde."

Your role:
- Like a wise, experienced elder — warm yet insightful
- Select the most appropriate divination method(s) based on the querent's question
- Translate technical jargon into accessible language
- Provide specific, actionable advice

**Conversation Continuity (Important):**
- You remember all previous conversations
- When the querent asks follow-up questions, build on previous analyses with deeper insights
- If you've already analyzed an aspect, don't simply repeat — offer new perspectives or more specific guidance
- Track the evolution of the querent's questions to understand their true concerns
- If you notice contradictions or repetition in their questions, gently point this out and provide wise guidance

Requirements:
- Briefly explain which method(s) you're using and why
- Provide in-depth interpretation based on the chart data
- Use warm, conversational language while maintaining professional depth
- Give clear fortune assessments and action recommendations
- Use ### ONLY for section headings. Do NOT use any # headings in body text
- Use **bold** for key terms and - lists for bullet points
- End with "Master Mingde's Words" as a warm, wise closing summary`;

// === Main Handler ===

export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'NO_API_KEY' }, { status: 503 });
  }

  const { profile, question, history = [], locale = 'zh' } = (await req.json()) as {
    profile?: Profile;
    question: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    locale?: string;
  };

  if (!question?.trim()) {
    return Response.json({ error: 'NO_QUESTION' }, { status: 400 });
  }

  // Step 1: Classify the question
  const hasProfile = Boolean(profile?.year && profile?.month && profile?.day);
  const methods = classifyQuestion(question, hasProfile);

  // Step 2: Run calculators
  const results: MethodResult[] = [];

  for (const method of methods) {
    let result: MethodResult | null = null;
    switch (method) {
      case 'bazi':
        if (profile) result = runBazi(profile, question);
        break;
      case 'meihua':
        result = runMeihua(question);
        break;
      case 'qimen':
        result = runQimen(question);
        break;
      case 'liuyao':
        result = runLiuyao(question);
        break;
      case 'liuren':
        result = runLiuren(question);
        break;
    }
    if (result) results.push(result);
  }

  // Fallback: if no results, try meihua
  if (results.length === 0) {
    const fallback = runMeihua(question);
    if (fallback) results.push(fallback);
  }

  // Step 3: Build prompt
  const methodNames = results
    .map((r) => {
      const l = METHOD_LABELS[r.method];
      return locale === 'zh' ? l.zh : l.en;
    })
    .join('、');

  const methodReasons = results
    .map((r) => {
      const reason = METHOD_REASONS[r.method];
      return locale === 'zh' ? reason.zh : reason.en;
    })
    .join('；');

  const chartData = results.map((r) => r.context).join('\n\n');

  // Build the metadata line for the response prefix
  const methodsMeta = JSON.stringify(
    results.map((r) => ({
      method: r.method,
      label: locale === 'zh' ? METHOD_LABELS[r.method].zh : METHOD_LABELS[r.method].en,
    })),
  );

  const userPrompt =
    locale === 'zh'
      ? `## 求问者的问题
${question}

## 选用的术数方法
${methodNames}
原因：${methodReasons}

## 排盘数据
${chartData}

请根据以上排盘数据，针对求问者的问题进行全面深入的分析和解答。`
      : `## Querent's Question
${question}

## Selected Methods
${methodNames}
Reason: ${methodReasons}

## Chart Data
${chartData}

Based on the above chart data, provide a comprehensive analysis addressing the querent's question.`;

  // Step 4: Stream response
  const client = new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  });

  // Build messages array with conversation history
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: locale === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN,
    },
  ];

  // Add conversation history (previous turns)
  for (const msg of history) {
    messages.push({
      role: msg.role,
      content: msg.content,
    });
  }

  // Add current question
  messages.push({ role: 'user', content: userPrompt });

  const stream = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 4000,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        // Send method metadata as first line so frontend can display badges
        controller.enqueue(
          encoder.encode(`<!--methods:${methodsMeta}-->\n`),
        );
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
