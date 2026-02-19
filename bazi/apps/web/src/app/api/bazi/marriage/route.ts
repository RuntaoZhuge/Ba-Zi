import OpenAI from 'openai';
import type { BaZiResult, MarriageCompatibility, WuXing } from '@bazi/domain';

export const runtime = 'nodejs';

const SYSTEM_PROMPT_ZH = `你是一位精通八字命理的合婚大师，擅长分析男女八字配对。

分析要求：
- 基于双方八字命盘和各维度匹配分数，给出专业合婚分析
- 语言亲切自然，客观中立
- 每个维度 2-3 段，重点突出实用建议
- 仅用 ### 作为各维度的大标题
- 可用 **加粗** 强调关键词，用 - 列表罗列要点`;

const SYSTEM_PROMPT_EN = `You are a BaZi master specialized in marriage compatibility analysis.

Requirements:
- Analyze based on both charts and dimension scores
- Use clear, objective, and approachable language
- 2-3 paragraphs per dimension with practical advice
- Use ### ONLY for dimension headings
- Use **bold** for key terms and - lists for bullet points`;

const WUXING_ZH: Record<WuXing, string> = {
  '木': '木', '火': '火', '土': '土', '金': '金', '水': '水',
};

const WUXING_EN: Record<WuXing, string> = {
  '木': 'Wood', '火': 'Fire', '土': 'Earth', '金': 'Metal', '水': 'Water',
};

function buildPrompt(
  maleResult: BaZiResult,
  femaleResult: BaZiResult,
  compatibility: MarriageCompatibility,
  locale: string,
): string {
  const mfp = maleResult.chart.fourPillars;
  const ffp = femaleResult.chart.fourPillars;
  const wuxingMap = locale === 'zh' ? WUXING_ZH : WUXING_EN;

  const malePillars = `${mfp.year.stemBranch.ganZhi} ${mfp.month.stemBranch.ganZhi} ${mfp.day.stemBranch.ganZhi} ${mfp.hour?.stemBranch.ganZhi ?? '??'}`;
  const femalePillars = `${ffp.year.stemBranch.ganZhi} ${ffp.month.stemBranch.ganZhi} ${ffp.day.stemBranch.ganZhi} ${ffp.hour?.stemBranch.ganZhi ?? '??'}`;

  const { dayMasterRelation, wuxingBalance, yongShenMatch, branchRelations, nayinMatch } = compatibility;

  if (locale === 'zh') {
    return `## 男方命盘
- 四柱：${malePillars}
- 日主：${maleResult.chart.dayMaster}
- ${maleResult.chart.mingge}

## 女方命盘
- 四柱：${femalePillars}
- 日主：${femaleResult.chart.dayMaster}
- ${femaleResult.chart.mingge}

## 合婚分析数据
- 综合匹配度：${compatibility.overallScore}分

### 日干合化（${dayMasterRelation.score}分）
- 男方日主${dayMasterRelation.maleStem}，女方日主${dayMasterRelation.femaleStem}
- ${dayMasterRelation.combination || '无天干五合'}
- 男对女十神：${dayMasterRelation.shiShenMaleToFemale}，女对男十神：${dayMasterRelation.shiShenFemaleToMale}

### 五行互补（${wuxingBalance.score}分）
- 互补五行：${wuxingBalance.complementary.map(e => wuxingMap[e]).join('、') || '无'}
- 冲突五行：${wuxingBalance.conflicting.map(e => wuxingMap[e]).join('、') || '无'}

### 用神配合（${yongShenMatch.score}分）
- 男方用神${wuxingMap[yongShenMatch.maleYongShen]}，女方用神${wuxingMap[yongShenMatch.femaleYongShen]}
- 男方喜神${wuxingMap[yongShenMatch.maleXiShen]}，女方喜神${wuxingMap[yongShenMatch.femaleXiShen]}

### 地支关系（${branchRelations.score}分）
- 六合：${branchRelations.liuHe.join('、') || '无'}
- 六冲：${branchRelations.liuChong.join('、') || '无'}

### 纳音配对（${nayinMatch.score}分）
- 男方日柱纳音${nayinMatch.maleNaYin}，女方日柱纳音${nayinMatch.femaleNaYin}
- 关系：${nayinMatch.relation}

请按以下结构分析：
### 综合评价
整体匹配度与婚姻展望
### 日干合化分析
天干相合与十神配对的详细解读
### 五行互补分析
双方五行分布的互补与冲突
### 用神喜忌分析
双方用神配合对婚姻的影响
### 地支关系分析
六合六冲对感情的影响
### 纳音配对分析
纳音五行关系解读
### 婚姻建议
经营婚姻的具体建议和注意事项`;
  }

  return `## Male Chart
- Four Pillars: ${malePillars}
- Day Master: ${maleResult.chart.dayMaster}
- ${maleResult.chart.mingge}

## Female Chart
- Four Pillars: ${femalePillars}
- Day Master: ${femaleResult.chart.dayMaster}
- ${femaleResult.chart.mingge}

## Compatibility Data
- Overall Score: ${compatibility.overallScore}

### Day Master Match (${dayMasterRelation.score})
- Male: ${dayMasterRelation.maleStem}, Female: ${dayMasterRelation.femaleStem}
- ${dayMasterRelation.combination || 'No heavenly stem combination'}
- Male to Female: ${dayMasterRelation.shiShenMaleToFemale}, Female to Male: ${dayMasterRelation.shiShenFemaleToMale}

### Five Element Balance (${wuxingBalance.score})
- Complementary: ${wuxingBalance.complementary.map(e => wuxingMap[e]).join(', ') || 'None'}
- Conflicting: ${wuxingBalance.conflicting.map(e => wuxingMap[e]).join(', ') || 'None'}

### Useful God Match (${yongShenMatch.score})
- Male Useful: ${wuxingMap[yongShenMatch.maleYongShen]}, Female Useful: ${wuxingMap[yongShenMatch.femaleYongShen]}
- Male Favorable: ${wuxingMap[yongShenMatch.maleXiShen]}, Female Favorable: ${wuxingMap[yongShenMatch.femaleXiShen]}

### Branch Relations (${branchRelations.score})
- Harmony: ${branchRelations.liuHe.join(', ') || 'None'}
- Clashes: ${branchRelations.liuChong.join(', ') || 'None'}

### NaYin Match (${nayinMatch.score})
- Male: ${nayinMatch.maleNaYin}, Female: ${nayinMatch.femaleNaYin}
- Relation: ${nayinMatch.relation}

Analyze the marriage compatibility:
### Overall Assessment
Overall compatibility and marriage outlook
### Day Master Analysis
Heavenly stem combination and ten god interpretation
### Five Element Balance
Complementarity and conflicts
### Useful God Coordination
Impact on marriage
### Branch Relations
Harmony and clashes impact
### NaYin Analysis
NaYin element relation
### Marriage Advice
Practical relationship guidance`;
}

export async function POST(req: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'NO_API_KEY' }, { status: 503 });
  }

  const { maleResult, femaleResult, compatibility, locale = 'zh' } = (await req.json()) as {
    maleResult: BaZiResult;
    femaleResult: BaZiResult;
    compatibility: MarriageCompatibility;
    locale?: string;
  };

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  });

  const systemPrompt = locale === 'zh' ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT_EN;
  const userPrompt = buildPrompt(maleResult, femaleResult, compatibility, locale);

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
