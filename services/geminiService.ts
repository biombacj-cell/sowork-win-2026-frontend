
import { GoogleGenAI, Type } from "@google/genai";
import { BrandDNA, PartyBriefing } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiPro = 'gemini-3-pro-preview';
export const geminiFlash = 'gemini-3-flash-preview';

/* 生成結構化社群文案 */
export async function generateSocialContent(topic: string, dna: BrandDNA) {
  const response = await ai.models.generateContent({
    model: geminiPro,
    contents: `戰略主題：${topic}，候選人：${dna.candidateName}，選區：${dna.district}`,
    config: {
      systemInstruction: `
        你是一位頂尖的台灣政治社群操盤手。
        任務：針對以下平台生成四種完全不同語氣的文宣文案。
        
        格式要求：
        1. Facebook: 溫暖有感、強調政績事實，適合長文閱讀。
        2. LINE: 短促、資訊導向、福利優先、多用 Emoji。
        3. Instagram: 強調視覺張力，文字要具備「設計感」短標題，需包含 Tag。
        4. Threads: 直白、碎碎念、幕後感、不帶 Hashtags。
        
        性格對位：請融入候選人 DNA：${dna.personality}，並帶入標語：${dna.slogan}。
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          facebook: { type: Type.STRING },
          line: { type: Type.STRING },
          instagram: { type: Type.STRING },
          threads: { type: Type.STRING }
        },
        required: ["facebook", "line", "instagram", "threads"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
}

/* 影像指令自動橋接 - 台灣選舉美學專用 */
export async function translateToCampaignPrompt(topic: string, dna: BrandDNA) {
  const response = await ai.models.generateContent({
    model: geminiFlash,
    contents: `主題：${topic}，候選人：${dna.candidateName}，政黨：${dna.party}`,
    config: {
      systemInstruction: `
        你是一位專業的台灣選戰攝影指導。
        請將中文主題轉化為詳細的英文影像 Prompt。
        
        必須包含的視覺元素：
        - Candidate wearing a formal Taiwanese "election campaign vest" with clear text or logo.
        - Asian Taiwanese facial features, friendly and determined expression.
        - Authentic Taiwanese backgrounds: Traditional markets, local temples, or modern urban flyovers.
        - Color palette: ${dna.party.includes('國民黨') ? 'Campaign blue and white' : 'Progressive green and white'}.
        - Photography style: High-end campaign photography, cinematic lighting, 4k resolution.
        
        輸出格式：僅輸出英文 Prompt。
      `
    }
  });
  return response.text;
}

/* AI 自動偵察候選人公開政績 */
export async function scoutCandidateAchievements(dna: BrandDNA) {
  const response = await ai.models.generateContent({
    model: geminiFlash,
    contents: `請搜尋並彙整 ${dna.district} 候選人 ${dna.candidateName} (${dna.party}) 過去三年的主要政績。`,
    config: {
      systemInstruction: `
        你是一位精準的選戰情資員。
        任務：搜尋該候選人在該選區的真實建設與政績。
        輸出格式：JSON 陣列。
      `,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "政績標題（10字內）" },
            fact: { type: Type.STRING, description: "政績具體事實（30字內）" }
          },
          required: ["title", "fact"]
        }
      }
    }
  });
  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
}

/* 戰略融合分析：將政績/政見與實時情緒對位 */
export async function analyzePolicyFusion(originalPolicy: string, dna: BrandDNA) {
  const response = await ai.models.generateContent({
    model: geminiFlash,
    contents: `
      原始政策/政績內容：${originalPolicy}
      選區：${dna.district}
      候選人性格：${dna.personality}
    `,
    config: {
      systemInstruction: `
        你是一位資深選戰策略師。
        任務：
        1. 使用 Google Search 搜尋該「選區」最近一週的新聞、民怨與討論焦點。
        2. 將「原始政策內容」與這些「選民痛點」進行對位。
        3. 產出結構化 JSON。
      `,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          currentVibe: { type: Type.STRING, description: "目前該區選民最在意的點或集體情緒" },
          trustAnchor: { type: Type.STRING, description: "此政績如何解決上述痛點並建立信任" },
          strategicRefinement: { type: Type.STRING, description: "升級後的戰鬥金句" },
          campaignAngle: { type: Type.STRING, description: "建議的文宣切入受眾" }
        },
        required: ["currentVibe", "trustAnchor", "strategicRefinement", "campaignAngle"]
      }
    }
  });
  
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("JSON 解析失敗", e);
    return {
      currentVibe: "數據解析異常",
      trustAnchor: "請重新嘗試演算",
      strategicRefinement: "系統暫時無法產出建議",
      campaignAngle: "請檢查網路連線"
    };
  }
}

export async function getPartyAlignmentBriefing(dna: BrandDNA): Promise<PartyBriefing | null> {
  const response = await ai.models.generateContent({
    model: geminiPro,
    contents: `候選人：${dna.candidateName}`,
    config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
  });
  try { return JSON.parse(response.text || '{}'); } catch { return null; }
}

export async function generateSpeech(dna: BrandDNA, title: string, loc: string, desc: string) { 
  const res = await ai.models.generateContent({ model: geminiPro, contents: `主題：${title}` }); 
  return { text: res.text }; 
}

export async function generateCounterStrategy(attack: string, dna: BrandDNA) {
  const response = await ai.models.generateContent({ model: geminiPro, contents: `攻擊：${attack}` });
  return response.text;
}

export async function auditCompliance(content: string) {
  const response = await ai.models.generateContent({ model: geminiFlash, contents: `文案：${content}`, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || '{}');
}

export async function computeStrategicPositioning(params: any) {
  const response = await ai.models.generateContent({ model: geminiPro, contents: `數據：${JSON.stringify(params)}`, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || '{}');
}

export async function autoDiscoverStrategicTriangle(params: any) {
  const response = await ai.models.generateContent({ model: geminiPro, contents: `選區：${params.district}`, config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" } });
  return JSON.parse(response.text || '{}');
}

export async function getTieredPollingData(dna: BrandDNA) {
  const response = await ai.models.generateContent({ model: geminiPro, contents: `地區：台中市`, config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" } });
  return JSON.parse(response.text || '{}');
}

export async function analyzeSpecificPollForDistrict(source: string, dna: BrandDNA) {
  const response = await ai.models.generateContent({ model: geminiPro, contents: `民調：${source}`, config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" } });
  return JSON.parse(response.text || '{}');
}

export async function getCompetitorIntelligence(dna: BrandDNA) {
  const response = await ai.models.generateContent({ model: geminiPro, contents: `台中市情報`, config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" } });
  return JSON.parse(response.text || '{}');
}
