import type { AIResult, Plant } from '../types';

const API_ENDPOINT =
  'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

const API_KEY = import.meta.env.VITE_QWEN_API_KEY || '';
const MODEL = import.meta.env.VITE_QWEN_MODEL || 'qwen-vl-max';

const SYSTEM_PROMPT = `你是 PlantOS 植物健康评估专家。你的任务是根据用户提供的植物照片，
进行结构化的健康评估，并以可爱有趣的方式生成结果。

## 评估步骤（请严格按顺序执行）

第一步：识别植物种类，给出置信度（0-1）
第二步：逐项视觉评估以下维度（每项 0-100 分）：
  - 水分：观察【土壤颜色深浅】【叶片是否下垂/卷曲】【叶尖是否干枯】
  - 光照：观察【叶片是否偏黄/偏白=过度】【是否徒长/茎节拉长=不足】
  - 营养：观察【叶片是否有斑点】【新叶是否偏小/畸形】【边缘是否焦枯】
  - 病虫害：观察【叶面白斑/黑斑】【蛛丝/虫卵】【粉状物/蜡质分泌物】
第三步：计算 HP = water*0.3 + light*0.25 + nutrition*0.2 + pest*0.25
第四步：确定最紧急的一个行动建议
第五步：生成趣味昵称（3-6字，可爱拟人风格，如"小绿同学""胖嘟嘟多肉"）
第六步：生成性格签名（一句话描述，如"好养活的入门级植物"）

## 重要约束
- 如果某维度从照片中无法可靠判断，给 65 分，标注 confidence: "low"
- HP 变化幅度应合理反映实际状态，不要大幅跳动
- 严格按 JSON 格式输出，不要附加任何额外文字`;

function buildFirstScanPrompt(): string {
  return `请评估这张植物照片的健康状态。这是一棵新植物，我刚开始养它。

重要：你必须根据照片中植物的实际状态独立判断每项分数，不同植物、不同状态的分数应有明显差异。

请严格按以下 JSON 格式输出（所有数值字段必须根据照片实际情况填写）：
{
  "species": "识别出的植物种类中文名",
  "species_confidence": <0到1之间的置信度>,
  "fun_name": "根据植物特征起的趣味昵称",
  "personality": "根据植物状态写的性格签名",
  "hp": <根据公式计算的0-100整数>,
  "metrics": {
    "water": { "value": <0-100整数>, "confidence": "high/medium/low" },
    "light": { "value": <0-100整数>, "confidence": "high/medium/low" },
    "nutrition": { "value": <0-100整数>, "confidence": "high/medium/low" },
    "pest": { "value": <0-100整数>, "confidence": "high/medium/low" }
  },
  "primary_action": {
    "type": "water/light/nutrition/pest",
    "label": "具体的行动建议",
    "urgency": "high/medium/low"
  },
  "diagnosis_summary": "基于照片观察到的具体症状描述"
}`;
}

function buildUpdatePrompt(plant: Plant): string {
  return `请评估这张植物照片的健康状态。

这是我已有的植物，上次评估信息如下：
- 植物：${plant.fun_name}（${plant.species}）
- 上次 HP：${plant.current_hp}
- 上次水分：${plant.current_metrics.water}
- 上次光照：${plant.current_metrics.light}
- 上次营养：${plant.current_metrics.nutrition}
- 上次病虫害：${plant.current_metrics.pest}
- 上次检测时间：${new Date(plant.last_scanned_at).toLocaleDateString('zh-CN')}

请基于与上次的对比给出本次评估。变化幅度应合理反映实际状态变化。

重要：你必须根据照片中植物的实际状态独立判断每项分数，与上次对比给出合理变化。

请严格按以下 JSON 格式输出（不需要 fun_name 和 personality 字段，所有数值必须根据照片实际情况填写）：
{
  "species": "识别出的植物种类中文名",
  "species_confidence": <0到1之间的置信度>,
  "hp": <根据公式计算的0-100整数>,
  "metrics": {
    "water": { "value": <0-100整数>, "confidence": "high/medium/low" },
    "light": { "value": <0-100整数>, "confidence": "high/medium/low" },
    "nutrition": { "value": <0-100整数>, "confidence": "high/medium/low" },
    "pest": { "value": <0-100整数>, "confidence": "high/medium/low" }
  },
  "primary_action": {
    "type": "water/light/nutrition/pest",
    "label": "具体的行动建议",
    "urgency": "high/medium/low"
  },
  "diagnosis_summary": "与上次对比的具体变化描述"
}`;
}

function parseAIResponse(text: string): AIResult {
  // Try to extract JSON from response (may be wrapped in markdown code block)
  let jsonStr = text.trim();

  // Strip markdown code block if present
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  // Try to find JSON object
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  return JSON.parse(jsonStr) as AIResult;
}

export async function analyzePlant(
  photoBase64: string,
  existingPlant?: Plant
): Promise<AIResult> {
  const userPrompt = existingPlant
    ? buildUpdatePrompt(existingPlant)
    : buildFirstScanPrompt();

  // Ensure proper base64 format for the API
  let imageData = photoBase64;
  if (!imageData.startsWith('data:')) {
    imageData = 'data:image/jpeg;base64,' + imageData;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageData },
              },
              { type: 'text', text: userPrompt },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('AI returned empty response');
    }

    return parseAIResponse(content);
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('AI 分析超时，请重试');
    }
    throw error;
  }
}
