import OpenAI from 'openai';
import type { BaZiResult, BusinessCompatibility, WuXing } from '@bazi/domain';

export const runtime = 'nodejs';

const SYSTEM_PROMPT_ZH = `你是一位精通八字命理的商业合作分析大师，擅长分析两人八字在商业合作方面的配对。

分析要求：
- 基于双方八字命盘和各维度匹配分数，给出专业商业合作分析
- 语言专业严谨，客观中立，聚焦商业价值
- 每个维度 2-3 段，重点突出实用的商业合作建议
- 仅用 ### 作为各维度的大标题
- 可用 **加粗** 强调关键词，用 - 列表罗列要点`;

const SYSTEM_PROMPT_EN = `You are a BaZi master specialized in business partnership compatibility analysis.

Requirements:
- Analyze based on both charts and dimension scores for business cooperation
- Use clear, professional, and objective language focused on business value
- 2-3 paragraphs per dimension with practical business advice
- Use ### ONLY for dimension headings
- Use **bold** for key terms and - lists for bullet points`;

const WUXING_ZH: Record<WuXing, string> = {
  '木': '木', '火': '火', '土': '土', '金': '金', '水': '水',
};

const WUXING_EN: Record<WuXing, string> = {
  '木': 'Wood', '火': 'Fire', '土': 'Earth', '金': 'Metal', '水': 'Water',
};

function buildPrompt(
  person1Result: BaZiResult,
  person2Result: BaZiResult,
  compatibility: BusinessCompatibility,
  locale: string,
): string {
  const p1fp = person1Result.chart.fourPillars;
  const p2fp = person2Result.chart.fourPillars;
  const wuxingMap = locale === 'zh' ? WUXING_ZH : WUXING_EN;

  const p1Pillars = `${p1fp.year.stemBranch.ganZhi} ${p1fp.month.stemBranch.ganZhi} ${p1fp.day.stemBranch.ganZhi} ${p1fp.hour?.stemBranch.ganZhi ?? '??'}`;
  const p2Pillars = `${p2fp.year.stemBranch.ganZhi} ${p2fp.month.stemBranch.ganZhi} ${p2fp.day.stemBranch.ganZhi} ${p2fp.hour?.stemBranch.ganZhi ?? '??'}`;

  const { dayMasterRelation, wuxingBalance, yongShenMatch, branchRelations, nayinMatch } = compatibility;

  if (locale === 'zh') {
    return `## 合作人1命盘
- 四柱：${p1Pillars}
- 日主：${person1Result.chart.dayMaster}
- ${person1Result.chart.mingge}

## 合作人2命盘
- 四柱：${p2Pillars}
- 日主：${person2Result.chart.dayMaster}
- ${person2Result.chart.mingge}

## 商业合作分析数据
- 综合契合度：${compatibility.overallScore}分

### 日干合化（${dayMasterRelation.score}分）
- 合作人1日主${dayMasterRelation.person1Stem}，合作人2日主${dayMasterRelation.person2Stem}
- ${dayMasterRelation.combination || '无天干五合'}
- 合作人1对2十神：${dayMasterRelation.shiShenPerson1ToPerson2}，合作人2对1十神：${dayMasterRelation.shiShenPerson2ToPerson1}

### 五行互补（${wuxingBalance.score}分）
- 互补五行：${wuxingBalance.complementary.map(e => wuxingMap[e]).join('、') || '无'}
- 冲突五行：${wuxingBalance.conflicting.map(e => wuxingMap[e]).join('、') || '无'}

### 用神配合（${yongShenMatch.score}分）
- 合作人1用神${wuxingMap[yongShenMatch.person1YongShen]}，合作人2用神${wuxingMap[yongShenMatch.person2YongShen]}
- 合作人1喜神${wuxingMap[yongShenMatch.person1XiShen]}，合作人2喜神${wuxingMap[yongShenMatch.person2XiShen]}

### 地支关系（${branchRelations.score}分）
- 六合：${branchRelations.liuHe.join('、') || '无'}
- 六冲：${branchRelations.liuChong.join('、') || '无'}

### 纳音配对（${nayinMatch.score}分）
- 合作人1日柱纳音${nayinMatch.person1NaYin}，合作人2日柱纳音${nayinMatch.person2NaYin}
- 关系：${nayinMatch.relation}

请按以下结构分析：
### 综合评价
整体商业合作契合度与合作展望
### 日干合化分析
天干相合与十神配对对商业合作的影响
### 五行互补分析
双方五行分布在商业合作中的互补与冲突
### 用神喜忌分析
双方用神配合对合作关系的影响
### 地支关系分析
六合六冲对合作默契与冲突的影响
### 纳音配对分析
纳音五行关系在商业层面的解读
### 合作建议
商业合作中的角色分工建议、注意事项和风险提示`;
  }

  return `## Partner 1 Chart
- Four Pillars: ${p1Pillars}
- Day Master: ${person1Result.chart.dayMaster}
- ${person1Result.chart.mingge}

## Partner 2 Chart
- Four Pillars: ${p2Pillars}
- Day Master: ${person2Result.chart.dayMaster}
- ${person2Result.chart.mingge}

## Compatibility Data
- Overall Score: ${compatibility.overallScore}

### Day Master Match (${dayMasterRelation.score})
- Partner 1: ${dayMasterRelation.person1Stem}, Partner 2: ${dayMasterRelation.person2Stem}
- ${dayMasterRelation.combination || 'No heavenly stem combination'}
- Partner 1 to 2: ${dayMasterRelation.shiShenPerson1ToPerson2}, Partner 2 to 1: ${dayMasterRelation.shiShenPerson2ToPerson1}

### Five Element Balance (${wuxingBalance.score})
- Complementary: ${wuxingBalance.complementary.map(e => wuxingMap[e]).join(', ') || 'None'}
- Conflicting: ${wuxingBalance.conflicting.map(e => wuxingMap[e]).join(', ') || 'None'}

### Useful God Match (${yongShenMatch.score})
- Partner 1 Useful: ${wuxingMap[yongShenMatch.person1YongShen]}, Partner 2 Useful: ${wuxingMap[yongShenMatch.person2YongShen]}
- Partner 1 Favorable: ${wuxingMap[yongShenMatch.person1XiShen]}, Partner 2 Favorable: ${wuxingMap[yongShenMatch.person2XiShen]}

### Branch Relations (${branchRelations.score})
- Harmony: ${branchRelations.liuHe.join(', ') || 'None'}
- Clashes: ${branchRelations.liuChong.join(', ') || 'None'}

### NaYin Match (${nayinMatch.score})
- Partner 1: ${nayinMatch.person1NaYin}, Partner 2: ${nayinMatch.person2NaYin}
- Relation: ${nayinMatch.relation}

Analyze the business partnership compatibility:
### Overall Assessment
Overall compatibility and business cooperation outlook
### Day Master Analysis
Heavenly stem combination and ten god impact on business
### Five Element Balance
Complementarity and conflicts in business context
### Useful God Coordination
Impact on partnership dynamics
### Branch Relations
Harmony and clashes impact on cooperation
### NaYin Analysis
NaYin element relation in business context
### Partnership Advice
Role allocation, risk warnings, and practical cooperation guidance`;
}

export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'NO_API_KEY' }, { status: 503 });
  }

  const { person1Result, person2Result, compatibility, locale = 'zh' } = (await req.json()) as {
    person1Result: BaZiResult;
    person2Result: BaZiResult;
    compatibility: BusinessCompatibility;
    locale?: string;
  };

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  });

  const systemPrompt = locale === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;
  const userPrompt = buildPrompt(person1Result, person2Result, compatibility, locale);

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
