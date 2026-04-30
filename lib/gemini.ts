import { GoogleGenAI } from "@google/genai";

/**
 * Thử lại một hàm không đồng bộ với cơ chế Exponential Backoff.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 2000
): Promise<T> {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.message?.includes("429") || error?.status === 429 || error?.message?.includes("RESOURCE_EXHAUSTED");
      
      if (isRateLimit && retries < maxRetries) {
        const delay = initialDelay * Math.pow(2, retries);
        console.warn(`Gemini API Rate Limit (429). Đang thử lại lần ${retries + 1} sau ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
        continue;
      }
      throw error;
    }
  }
}

interface SafeGenerateOptions {
  apiKey: string;
  model: string;
  contents: string | any[];
  systemInstruction?: string;
  generationConfig?: any;
}

/**
 * Hàm gọi Gemini API an toàn với cơ chế tự động thử lại khi gặp lỗi quota.
 */
export async function safeGenerateContent(options: SafeGenerateOptions): Promise<any> {
  const { apiKey, model, contents, systemInstruction, generationConfig } = options;
  
  const ai = new GoogleGenAI({ apiKey });

  return retryWithBackoff(async () => {
    const response = await (ai as any).models.generateContent({
      model,
      contents: Array.isArray(contents) ? contents : [{ role: 'user', parts: [{ text: contents }] }],
      config: {
        ...generationConfig,
        systemInstruction,
      }
    });
    
    return {
      text: response.text,
      usageMetadata: response.usageMetadata,
    };
  });
}
