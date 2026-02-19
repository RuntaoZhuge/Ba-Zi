import OpenAI from 'openai';
import { extractQimenAnalysisContext } from '@bazi/domain';
import type { QimenResult } from '@bazi/domain';

export const runtime = 'nodejs';

const SYSTEM_PROMPT_ZH = `你是一位精通奇门遁甲的预测大师，擅长时家阳盘转盘奇门（张志春体系）。你通过分析天盘、地盘、九星、八门、八神五层信息来解读奇门盘局。

分析要求：
- 基于传统奇门遁甲理论，以值符值使、奇仪组合、门星落宫为核心
- 语言亲切自然，避免过于晦涩
- 每个维度 2-3 段，重点突出，有实际指导意义
- 仅用 ### 作为各维度的大标题，正文中不要使用任何 # 标记
- 可用 **加粗** 强调关键词，用 - 列表罗列要点`;

const SYSTEM_PROMPT_EN = `You are a master of Qi Men Dun Jia (奇门遁甲), specializing in the Hourly Yang-Plate Rotating method (Zhang Zhichun school). You analyze the five layers of a Qi Men board: Heaven Plate, Earth Plate, Nine Stars, Eight Gates, and Eight Deities.

Requirements:
- Ground analysis in traditional Qi Men Dun Jia theory, focusing on Duty Star/Gate, stem combinations, and gate-star palace relationships
- Use clear, approachable language
- 2-3 paragraphs per dimension, highlighting key insights
- Use ### ONLY for dimension headings. Do NOT use any # headings in body text
- Use **bold** for key terms and - lists for bullet points`;

function buildPrompt(result: QimenResult, locale: string): string {
  const ctx = extractQimenAnalysisContext(result);

  if (locale === 'zh') {
    return `## 奇门盘局信息
- 局：${ctx.juInfo}
- 日时：${ctx.dayHourGanZhi}
- 值符：${ctx.zhiFu}
- 值使：${ctx.zhiShi}
- ${ctx.xunInfo}
- 格局特征：${ctx.patterns}
${ctx.question ? `- 所问之事：${ctx.question}` : ''}

## 九宫详情
${ctx.palaceSummary}

请按以下结构分析，每个维度用 ### 作为标题：
### 盘局总论
遁局类型、值符值使分析，整体局势判断
### 用神分析
结合所问之事，分析用神所在宫位的天地盘干、门、星、神组合
### 吉凶判断
八门落宫吉凶，三奇六仪组合解读，格局判断
### 时机方位
有利时机、有利方位的建议
### 综合建议
结合盘局给出具体可行的建议`;
  }

  return `## Qi Men Board Information
- Ju: ${ctx.juInfo}
- Day/Hour: ${ctx.dayHourGanZhi}
- Duty Star: ${ctx.zhiFu}
- Duty Gate: ${ctx.zhiShi}
- ${ctx.xunInfo}
- Patterns: ${ctx.patterns}
${ctx.question ? `- Question: ${ctx.question}` : ''}

## Nine Palaces Detail
${ctx.palaceSummary}

Please analyze in this structure, use ### as heading for each dimension:
### Overall Board Analysis
Dun type, Duty Star/Gate analysis, general situation assessment
### Subject Analysis
Analyze the palace relevant to the question, including heaven/earth stems, gate, star, deity
### Fortune Assessment
Eight Gates palace positions, San Qi Liu Yi combinations, pattern interpretation
### Timing & Direction
Favorable timing and directions
### Comprehensive Advice
Practical suggestions based on the board`;
}

export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'NO_API_KEY' }, { status: 503 });
  }

  const { result, locale = 'zh' } = (await req.json()) as {
    result: QimenResult;
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
