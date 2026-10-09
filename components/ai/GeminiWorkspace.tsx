import React, { useEffect, useRef, useState } from "react";
import { safeGenerateContent } from "../../lib/gemini";
import { Send, Loader2, Terminal, Zap, Download, Sparkles } from "../icons";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Preset, Message } from "../../types";
import { useToast } from "../../hooks/useToast";
import { useSystemInstruction } from "../../hooks/useSystemInstruction";
import { useAdvancedSettings } from "../../hooks/useAdvancedSettings";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/Select";

const PRESETS: Preset[] = [
  { id: "gen_exam_40q_hh", title: "Tạo đề 40 câu trắc nghiệm (Hóa học 10 - Chương 2)", prompt: "Tạo 3 đề trắc nghiệm 40 câu cho Hóa học 10 Chương 2, phân bố theo ma trận (Nhận biết:30%, Thông hiểu:40%, Vận dụng:30%), kèm đáp án và chỉ rõ mức độ từng câu." },
  { id: "refine_balance", title: "Tinh chỉnh tỉ lệ vận dụng", prompt: "Phân tích ngân hàng câu hỏi hiện có và đề xuất thêm câu để đạt tỉ lệ vận dụng 20% trong mỗi đề 40 câu." },
  { id: "scan_metadata", title: "Kiểm tra metadata ngân hàng câu hỏi", prompt: "Kiểm tra danh sách câu hỏi và note các câu thiếu metadata: chương, bài, mức độ." },
];

const CHAT_STORAGE_KEY = 'form_gemini_workspace';

interface GeminiWorkspaceProps {
  updateTokenUsage: (count: number) => void;
}

const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => {
  const isUser = msg.role === "user";
  const isLoading = msg.text === "Đang xử lý...";
  return (
    <div className={`flex items-end ${isUser ? "justify-end" : "justify-start"} py-2`}>
      <div className={`max-w-[78%] px-4 py-2 rounded-2xl break-words shadow-sm ${ isUser ? "bg-indigo-600 text-white rounded-br-lg" : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-lg" }`}>
        <div className="text-sm whitespace-pre-wrap flex items-center gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{msg.text}</span>
        </div>
      </div>
    </div>
  );
}

export default function GeminiWorkspace({ updateTokenUsage }: GeminiWorkspaceProps) {
  const { addToast } = useToast();
  const { systemInstruction } = useSystemInstruction();
  const { advSettings, setAdvSettings } = useAdvancedSettings();

  const [chatState, setChatState] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) { console.error(e); }
    return {
      input: "",
      messages: [
        { id: "system-welcome", role: "assistant", text: `Chào bạn — đây là AI Tool (Gemini). Bạn có thể hỏi để tạo đề, tinh chỉnh, hoặc phân tích ngân hàng câu hỏi.`, meta: "System" },
      ],
      selectedPreset: null,
    };
  });

  const { input, messages, selectedPreset } = chatState;
  
  const updateChatState = (newState: Partial<typeof chatState>) => {
    setChatState((prev: typeof chatState) => ({ ...prev, ...newState }));
  };
  
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    // Only show toast if there's more than the initial welcome message
    if (saved && JSON.parse(saved).messages.length > 1) {
      addToast("Đã khôi phục phiên chat AI.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatState));
  }, [chatState]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const callAI = async (promptText: string) => {
    if (loading) return;
    setLoading(true);
    
    const userMsg: Message = { id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, role: "user", text: promptText, meta: "Bạn" };
    const loadingMsg: Message = { id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, role: "assistant", text: "Đang xử lý...", meta: "Gemini" };

    updateChatState({
        input: "",
        selectedPreset: null,
        messages: [...messages, userMsg, loadingMsg],
    });

    try {
      const userApiKey = localStorage.getItem('examgen_gemini_api_key');
      if (!userApiKey) {
        throw new Error("API Key not found.");
      }

      const response = await safeGenerateContent({
        apiKey: userApiKey,
        model: advSettings.aiModel,
        contents: promptText,
        systemInstruction: systemInstruction.instruction,
      });

      if (response.usageMetadata) {
        updateTokenUsage(response.usageMetadata.totalTokenCount);
      }

      const aiText = response.text;
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === loadingMsg.id ? { ...m, text: aiText } : m
        ),
      }));
    } catch (error: any) {
      console.error("Lỗi khi gọi Gemini API:", error);
      let errorText = "Xin lỗi, đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.";
      
      if (error.message?.includes("API Key not found")) {
        errorText = "Không tìm thấy API Key. Vui lòng vào Cài đặt > Trí tuệ nhân tạo để thiết lập.";
      } else if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
        errorText = "Cảnh báo: Bạn đã vượt quá giới hạn lượt gọi (Quota) của Gemini API. Vui lòng chờ 1-2 phút rồi thử lại. Nếu dùng gói miễn phí, giới hạn thường là 15 yêu cầu mỗi phút.";
      }
      
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.map((m) =>
          m.id === loadingMsg.id ? { ...m, text: errorText } : m
        ),
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    callAI(input.trim());
  };

  const handlePreset = (preset: Preset) => {
    updateChatState({ selectedPreset: preset.id, input: preset.prompt });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex gap-4 overflow-hidden">
        <aside className="w-72 hidden lg:block flex-shrink-0">
          <div className="sticky top-0 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2"><Sparkles className="text-indigo-500"/>AI Co-pilot</CardTitle>
                </CardHeader>
                <CardContent>
                     <Select value={advSettings.aiModel} onValueChange={(v) => setAdvSettings({ aiModel: v as any })}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (Khuyên dùng)</SelectItem>
                            <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                            <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                            <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                            <SelectItem value="gemini-3.8-flash">Gemini 3.8 Flash</SelectItem>
                            <SelectItem value="gpt-5" disabled>GPT-5 (Sắp có)</SelectItem>
                            <SelectItem value="claude-3" disabled>Claude 3 (Sắp có)</SelectItem>
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>
             <Card>
              <CardHeader><CardTitle className="text-base font-semibold">Mẫu câu lệnh</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {PRESETS.map((p) => (
                  <button key={p.id} onClick={() => handlePreset(p)} className={`w-full text-left px-3 py-2 rounded-lg transition ${selectedPreset === p.id ? "bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-300" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <div className="font-medium text-sm">{p.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{p.prompt}</div>
                  </button>
                ))}
              </CardContent>
            </Card>
             <Card>
              <CardHeader><CardTitle className="text-base font-semibold">Mẹo nhanh</CardTitle></CardHeader>
              <CardContent className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <p>- Gõ rõ ràng: môn, chương, số câu, tỉ lệ mức độ.</p>
                <p>- Thêm yêu cầu: "có đáp án", "có lời giải tóm tắt".</p>
              </CardContent>
            </Card>
          </div>
        </aside>

        <section className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 flex flex-col border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {messages.map((m) => <MessageBubble key={m.id} msg={m} />)}
            <div ref={messagesEndRef} />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Input
                value={input}
                onChange={(e) => updateChatState({ input: e.target.value })}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="Nhập câu lệnh của bạn ở đây... (Shift + Enter để xuống dòng)"
                className="w-full pr-12 rounded-full"
                disabled={loading}
              />
              <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 h-auto rounded-full"
                  size="sm"
                  variant="ghost"
              >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 text-indigo-500" />}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}