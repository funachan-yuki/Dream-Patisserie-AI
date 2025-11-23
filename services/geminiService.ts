import { GoogleGenAI, Type } from "@google/genai";
import { SweetsData } from "../types";

// Helper function to get the AI client only when needed
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your settings.");
  }
  return new GoogleGenAI({ apiKey });
};

interface GenerateOptions {
  refinementContext?: { 
    currentData: SweetsData; 
    instruction: string 
  };
  constraints?: {
    cost?: string;
    price?: string;
  };
}

export const generateSweetsIdea = async (
  keyword: string,
  options: GenerateOptions = {}
): Promise<SweetsData> => {
  let prompt = '';
  const { refinementContext, constraints } = options;

  // Build constraint string if provided
  let constraintPrompt = "";
  if (constraints?.cost) {
    constraintPrompt += `\n- 目標原価: ${constraints.cost}円前後を目指してください。材料費の合計がこの金額に近づくように調整してください。`;
  }
  if (constraints?.price) {
    constraintPrompt += `\n- 希望売価: ${constraints.price}円前後で設定してください。`;
  }

  if (refinementContext) {
    // Sanitize currentData to remove heavy image data (base64 strings) before sending to LLM
    const sanitizedData = {
      ...refinementContext.currentData,
      recipe: refinementContext.currentData.recipe.map((step) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { imageUrl, ...rest } = step;
        return rest;
      })
    };

    prompt = `
      あなたは世界的に有名なパティシエ兼経営コンサルタントです。
      以下の既存のスイーツのアイデアを、クライアントの要望に合わせて改良・修正してください。

      【現在のスイーツデータ】
      ${JSON.stringify(sanitizedData)}

      【クライアントの要望】
      「${refinementContext.instruction}」

      この要望を反映して、データを更新してください。
      名前や説明、材料、レシピ、原価、画像生成プロンプトなど、関連するすべての項目を整合性が取れるように修正してください。
      特にレシピ手順は、プロが教えるように具体的かつ詳細に記述してください。
      
      以下の条件に従ってJSON形式で出力してください。
      1. 商品名: 要望を反映した新しい名前（変更が必要な場合）。
      2. 説明: 変更点を踏まえた魅力的な説明（150文字程度）。
      3. 材料リスト: 変更に合わせて再計算した材料と概算原価。
      4. レシピ手順: 変更を反映した具体的な手順（6〜8ステップ）。各ステップに、説明文と、その工程を描写するシンプルな線画スケッチのための英語プロンプト（visualPrompt）を含めてください。
      5. 原価合計: 再計算した合計。
      6. 想定売価: 原価率30%〜40%を目安、もしくは指定がある場合はそれに従う。
      7. 利益率: 計算した利益率（%）。
      8. visualPrompt: 完成品の新しい見た目を指示する詳細な英語のプロンプト。
    `;
  } else {
    prompt = `
      あなたは世界的に有名なパティシエ兼経営コンサルタントです。
      キーワード「${keyword}」に基づいた、独創的で魅力的な新しいスイーツのアイデアを考案してください。
      
      【制約条件】${constraintPrompt ? constraintPrompt : "特になし"}

      以下の条件に従ってJSON形式で出力してください。

      1. 商品名: キャッチーで美味しそうな名前。
      2. 説明: 味、食感、見た目の魅力が伝わる150文字程度の説明。
      3. 材料リスト: およその分量と、日本円での概算原価（1個あたり）。制約条件の原価に近づけること。
      4. レシピ手順: プロのパティシエが教えるような、具体的で詳細な作り方の手順（6〜8ステップ）。各ステップに、説明文と、その工程を描写するシンプルな線画スケッチのための英語プロンプト（visualPrompt）を含めてください。
      5. 原価合計: 材料費の合計。
      6. 想定売価: 制約条件があればそれに従い、なければ原価率30%〜40%を目安に設定。
      7. 利益率: 計算した利益率（%）。
      8. visualPrompt: このスイーツの完成形の見た目を画像生成AIに指示するための詳細な英語のプロンプト。
    `;
  }

  // Initialize client here to prevent crash on load
  const ai = getAiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.STRING },
                cost: { type: Type.NUMBER },
              },
              required: ["name", "amount", "cost"],
            },
          },
          recipe: {
            type: Type.ARRAY,
            items: { 
              type: Type.OBJECT,
              properties: {
                step: { type: Type.INTEGER },
                description: { type: Type.STRING },
                visualPrompt: { type: Type.STRING },
              },
              required: ["step", "description", "visualPrompt"]
            },
          },
          totalCost: { type: Type.NUMBER },
          suggestedPrice: { type: Type.NUMBER },
          profitMargin: { type: Type.STRING },
          visualPrompt: { type: Type.STRING },
        },
        required: ["name", "description", "ingredients", "recipe", "totalCost", "suggestedPrice", "profitMargin", "visualPrompt"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No text generated from Gemini");
  }

  return JSON.parse(text) as SweetsData;
};

export const generateSweetsImage = async (visualPrompt: string, style: 'photo' | 'sketch' = 'photo'): Promise<string> => {
  // Initialize client here to prevent crash on load
  const ai = getAiClient();
  
  let stylePrompt = "";
  if (style === 'photo') {
    stylePrompt = ", high quality, professional food photography, 8k resolution, photorealistic, soft lighting, appetizing, patisserie style, elegant plating";
  } else {
    stylePrompt = ", simple black and white pencil sketch, hand drawn style, cookbook illustration, minimalist, white background, high contrast, line art only";
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: visualPrompt + stylePrompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1", 
      }
    }
  });

  // Find the image part in the response
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData && part.inlineData.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated");
};