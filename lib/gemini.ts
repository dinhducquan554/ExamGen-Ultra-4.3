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

/**
 * Kiểm tra kết nối Gemini API với API Key và Model đã chọn
 */
export async function testGeminiConnection(
  apiKey: string,
  model: string = 'gemini-2.5-flash'
): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'Vui lòng nhập API Key.' };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const response = await (ai as any).models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: 'Kiểm tra kết nối. Hãy phản hồi ngắn gọn: OK' }] }],
      config: {
        maxOutputTokens: 20,
      }
    });

    if (response && response.text) {
      return {
        success: true,
        message: `Kết nối thành công tới mô hình ${model}! AI đã phản hồi sẵn sàng.`
      };
    }
    return {
      success: true,
      message: `Kết nối thành công tới mô hình ${model}!`
    };
  } catch (error: any) {
    const errStr = error?.message || error?.toString() || '';
    if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED')) {
      return {
        success: false,
        message: 'Lỗi 429 (Resource Exhausted): API Key này đã hết hạn mức Quota trong phút/ngày. Bạn hãy thử đổi sang model "Gemini 2.5 Flash" hoặc thay API Key từ tài khoản Google khác.'
      };
    }
    if (errStr.includes('API_KEY_INVALID') || errStr.includes('400') || errStr.includes('403')) {
      return {
        success: false,
        message: 'Lỗi xác thực (API Key không hợp lệ): Vui lòng kiểm tra lại mã API Key đã sao chép từ Google AI Studio.'
      };
    }
    if (errStr.includes('503') || errStr.includes('UNAVAILABLE')) {
      return {
        success: false,
        message: 'Lỗi 503 (Máy chủ quá tải): Máy chủ Gemini của Google đang tạm thời quá tải. Vui lòng thử lại sau giây lát.'
      };
    }
    if (errStr.includes('404') || errStr.includes('NOT_FOUND')) {
      return {
        success: false,
        message: `Mô hình "${model}" không tìm thấy hoặc chưa khả dụng với khóa API này. Vui lòng chọn mô hình khác (ví dụ: gemini-2.5-flash).`
      };
    }
    return {
      success: false,
      message: `Lỗi kết nối: ${errStr}`
    };
  }
}
