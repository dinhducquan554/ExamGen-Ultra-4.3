import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Shuffle, Upload, Sparkles, Loader2, FileText, ChevronLeft, KeyRound, FileUp, XCircle, FileLock2 } from '../icons';
import { useExamCreation } from '../../hooks/useExamCreation';
import { useToast } from '../../hooks/useToast';
import { GeneratedExamData, MixedExam, Page, User } from '../../types';
import { GoogleGenAI, Type } from "@google/genai";
import { useSystemInstruction } from '../../hooks/useSystemInstruction';
import { useI18n } from '../../hooks/useI18n';
import { useAdvancedSettings } from '../../hooks/useAdvancedSettings';

interface MixExamWorkspaceProps {
  examData: GeneratedExamData | null;
  setMixedExamData: (data: MixedExam[] | null) => void;
  setCurrentPage: (page: Page) => void;
  updateTokenUsage: (count: number) => void;
  currentUser: User;
}

const parseGeminiJson = (jsonString: string): any => {
    let cleanedString = jsonString.trim();

    // Remove markdown backticks if they exist
    const match = cleanedString.match(/```(json)?\s*([\s\S]*?)\s*```/);
    if (match) {
        cleanedString = match[2];
    }
    
    try {
        return JSON.parse(cleanedString);
    } catch (e1) {
        console.warn("Direct JSON parsing failed, attempting to fix common escape issues.", e1);
        try {
            // This is a simplified attempt to fix unescaped characters inside strings.
            // It might not cover all cases but handles common ones like newlines.
            const repairedString = cleanedString.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\');
            return JSON.parse(repairedString);
        } catch (e2) {
            console.error("Failed to parse JSON even after attempting to fix escapes.", e2);
            throw e1; // Re-throw the original error as it's more likely to be informative.
        }
    }
};

const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});


const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 my-2">
    <div 
      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

const Placeholder: React.FC<{ setCurrentPage: (page: Page) => void }> = ({ setCurrentPage }) => {
    const { t } = useI18n();
    return (
    <div className="flex items-center justify-center h-full py-10">
        <div className="text-center">
            <div className="mx-auto bg-yellow-100 dark:bg-yellow-900/50 rounded-full p-3 w-fit">
                <FileText className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-slate-800 dark:text-slate-100">
              {t('mixExam.placeholder.title')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 my-4 max-w-md">
              {t('mixExam.placeholder.description')}
            </p>
            <Button onClick={() => setCurrentPage('exam-structure')}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t('mixExam.placeholder.button')}
            </Button>
        </div>
    </div>
)};


export default function MixExamWorkspace({ examData, setMixedExamData, setCurrentPage, updateTokenUsage, currentUser }: MixExamWorkspaceProps) {
  const { examSettings, setExamSettings } = useExamCreation();
  const { addToast } = useToast();
  const { systemInstruction } = useSystemInstruction();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStatusText, setLoadingStatusText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { advSettings } = useAdvancedSettings();

  const isTrialUser = currentUser.role === 'Giáo viên' && currentUser.usageLimit !== undefined;

  if (isTrialUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-lg text-center p-8">
          <CardHeader>
            <div className="mx-auto bg-yellow-100 dark:bg-yellow-900/50 rounded-full p-3 w-fit">
               <FileLock2 className="w-8 h-8 text-yellow-500" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-100">
              Tính năng bị hạn chế
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Chức năng "Trộn đề" không khả dụng cho tài khoản dùng thử. Vui lòng nâng cấp tài khoản của bạn để sử dụng đầy đủ tính năng.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isLoading) {
      setProgress(prev => (prev < 10 ? 10 : prev)); // Start at 10
      const totalDuration = 15000; // Slower progress for file processing
      const interval = totalDuration / 100;
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            return 90; // Hold at 90
          }
          return prev + 0.5;
        });
      }, interval);
    } else {
        setProgress(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const handleInputChange = (field: 'mixVersions' | 'mixStartCode', value: string) => {
    setExamSettings(prev => ({ ...prev, [field]: value }));
  };

  const startMixingProcess = async (sourceExam: string, sourceAnswers?: string) => {
    const apiKey = localStorage.getItem('examgen_gemini_api_key');
    if (!apiKey) {
        addToast("Không tìm thấy API Key. Vui lòng vào Cài đặt > Trí tuệ nhân tạo để thiết lập.");
        setIsLoading(false);
        return;
    }
    
    // Ensure loading state is set if called directly, but usually set by caller
    if (!isLoading) setIsLoading(true);
    setLoadingStatusText(t('mixExam.toast.start'));

    try {
        const ai = new GoogleGenAI({ apiKey });
        const { mixVersions, mixStartCode } = examSettings;

        const answerPart = sourceAnswers
            ? `Và đây là đáp án tương ứng (định dạng HTML): \`\`\`html\n${sourceAnswers}\n\`\`\``
            : `Lưu ý: Đề gốc không có đáp án riêng. BẠN PHẢI tự xác định đáp án từ đề gốc trước khi trộn.`;
        
        const prompt = `Đây là một đề thi gốc (định dạng HTML hoặc văn bản thô): \`\`\`\n${sourceExam}\n\`\`\`
${answerPart}

Dựa vào đề thi và đáp án gốc này, BẠN PHẢI tạo ra chính xác ${mixVersions} phiên bản đề thi đã được trộn. Mỗi phiên bản phải tuân thủ các quy tắc sau:
1.  **Giữ nguyên cấu trúc tổng thể:** Các phần chính (ví dụ: A. TRẮC NGHIỆM, B. TỰ LUẬN) và các tiểu mục (Phần I, Phần II, ...) phải được giữ nguyên.
2.  **Giữ nguyên câu hỏi tự luận:** Giữ nguyên thứ tự và nội dung của các câu hỏi tự luận (nếu có).
3.  **Xáo trộn câu hỏi trắc nghiệm:** Xáo trộn hoàn toàn thứ tự của các câu hỏi trắc nghiệm TRONG PHẠM VI từng tiểu mục của chúng. **QUAN TRỌNG: KHÔNG được thêm, bớt, hay thay đổi nội dung của bất kỳ câu hỏi nào.** Tổng số câu hỏi trong mỗi phần phải được giữ nguyên tuyệt đối.
4.  **Xáo trộn phương án:** Trong mỗi câu hỏi trắc nghiệm, hãy xáo trộn thứ tự của các phương án trả lời (A, B, C, D).
5.  **Tạo đáp án chính xác:** Tạo ra một bảng đáp án chính xác tương ứng cho MỖI đề đã được trộn.
6.  **Gán mã đề:** Gán mã đề tuần tự, bắt đầu từ ${mixStartCode}.
7.  **Định dạng câu hỏi:** Khi tạo nội dung câu hỏi cho đề trộn, BẮT BUỘC LOẠI BỎ hoàn toàn các thông tin về mức độ nhận thức, chương/bài hoặc metadata nằm trong ngoặc đơn ngay sau số thứ tự câu. 
    - Ví dụ: Nếu đề gốc là "Câu 1 (NB, Chương 1...). Nội dung...", thì đề trộn phải chuyển thành "Câu [số mới]. Nội dung...".
    - Giữ lại nội dung câu hỏi nguyên vẹn, chỉ xóa phần metadata trong ngoặc đơn ở đầu câu.

Hãy trả về kết quả dưới dạng một MẢNG JSON. Mảng này PHẢI chứa ĐÚNG ${mixVersions} đối tượng JSON, không hơn không kém. Mỗi đối tượng phải chứa 'code', 'examContent' (HTML), và 'answerContent' (HTML). Đảm bảo JSON trả về là hợp lệ và các chuỗi HTML được escape đúng cách.`;

        const responseSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    code: { type: Type.STRING, description: "Mã đề thi, ví dụ '101'" },
                    examContent: { type: Type.STRING, description: "Nội dung HTML của đề thi đã trộn." },
                    answerContent: { type: Type.STRING, description: "Nội dung HTML của đáp án tương ứng với đề đã trộn." },
                },
                required: ['code', 'examContent', 'answerContent'],
            }
        };
        
        const response = await ai.models.generateContent({
            model: advSettings.aiModel,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                systemInstruction: systemInstruction.instruction,
            },
        });
        
        if (response.usageMetadata) {
            updateTokenUsage(response.usageMetadata.totalTokenCount);
        }

        setProgress(100);
        const mixedExams = parseGeminiJson(response.text) as MixedExam[];
        
        if (mixedExams.length !== parseInt(mixVersions, 10)) {
            addToast(t('mixExam.toast.partialSuccess', 'AI chỉ tạo được {actual}/{expected} phiên bản. Vui lòng kiểm tra lại.', { actual: mixedExams.length, expected: mixVersions }), 'warning' as any);
        } else {
            addToast(t('mixExam.toast.success', 'Đã trộn thành công {count} phiên bản đề!', { count: mixedExams.length }));
        }

        setMixedExamData(mixedExams);
        setCurrentPage('results');

    } catch (error) {
        console.error("Lỗi khi trộn đề bằng AI:", error);
        addToast(t('mixExam.toast.error.generic'));
    } finally {
        setIsLoading(false);
        setProgress(0);
        setLoadingStatusText('');
    }
  };

  const handleMixFromSettings = () => {
    if (!examData || !examData.examContent) {
        addToast(t('mixExam.toast.error.noSource'));
        return;
    }
    setIsLoading(true);
    startMixingProcess(examData.examContent, examData.answerContent);
  };

  const handleMixFromFile = async () => {
      if (!uploadedFile) {
          addToast(t('mixExam.toast.error.noFile'));
          return;
      }

      setIsLoading(true);
      
      // Case 1: Simple text files
      if (['text/plain', 'text/html', 'text/markdown'].includes(uploadedFile.type) || uploadedFile.name.endsWith('.md') || uploadedFile.name.endsWith('.txt')) {
          try {
              setLoadingStatusText("Đang đọc nội dung file...");
              const fileContent = await uploadedFile.text();
              await startMixingProcess(fileContent); // No separate answer sheet needed from file usually
          } catch (e) {
              addToast(t('mixExam.toast.error.fileRead'));
              console.error("Error reading file:", e);
              setIsLoading(false);
          }
          return;
      }

      // Case 2: Binary files (PDF, Docx, Image) -> Extract with AI first
      try {
          const apiKey = localStorage.getItem('examgen_gemini_api_key');
          if (!apiKey) {
              addToast("Cần có API Key để xử lý file PDF/Word/Ảnh.");
              setIsLoading(false);
              return;
          }

          setLoadingStatusText("AI đang đọc và trích xuất nội dung đề thi từ file...");
          const ai = new GoogleGenAI({ apiKey });
          const base64Data = await fileToBase64(uploadedFile);
          
          const extractPrompt = `Đây là file chứa nội dung đề thi. Hãy trích xuất toàn bộ nội dung đề thi (bao gồm các câu hỏi, phương án lựa chọn và đáp án nếu có) và trả về dưới dạng văn bản thuần hoặc HTML giữ nguyên cấu trúc. KHÔNG được thay đổi nội dung, chỉ trích xuất lại chính xác những gì có trong file.`;

          const response = await ai.models.generateContent({
              model: advSettings.aiModel,
              contents: {
                  parts: [
                      { inlineData: { mimeType: uploadedFile.type, data: base64Data } },
                      { text: extractPrompt }
                  ]
              },
              config: {
                  systemInstruction: systemInstruction.instruction
              }
          });

          if (response.usageMetadata) {
              updateTokenUsage(response.usageMetadata.totalTokenCount);
          }

          const extractedContent = response.text;
          
          if (!extractedContent) {
              throw new Error("Không thể trích xuất nội dung từ file.");
          }

          setLoadingStatusText("Đã trích xuất xong. Bắt đầu trộn đề...");
          await startMixingProcess(extractedContent);

      } catch (error) {
          console.error("Lỗi xử lý file phức tạp:", error);
          addToast("Không thể xử lý file này. Vui lòng thử lại hoặc dùng file text.");
          setIsLoading(false);
      }
  };

  const handleFileSelection = (file: File | null) => {
    if (!file) return;
    setUploadedFile(file);
    addToast(t('mixExam.toast.info.fileSelected', 'Đã chọn file: {fileName}', { fileName: file.name }));
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
        e.dataTransfer.clearData();
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          {t('mixExam.title')}
        </h2>
      </div>

      <Card className="shadow-lg border-none bg-white dark:bg-slate-900">
        <CardContent className="p-6">
          <Tabs defaultValue="from-settings">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="from-settings">{t('mixExam.tabFromSettings')}</TabsTrigger>
              <TabsTrigger value="from-file">{t('mixExam.tabFromFile')}</TabsTrigger>
            </TabsList>

            <TabsContent value="from-settings">
                {examData && examData.examContent ? (
                  <div className="space-y-4 max-w-md mx-auto text-center">
                    <CardTitle className="text-lg">{t('mixExam.fromSettings.title')}</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('mixExam.fromSettings.description')}
                    </p>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="versions" className="flex items-center gap-2"><Shuffle size={16} className="text-pink-500"/>{t('mixExam.versionsLabel')}</Label>
                      <Input id="versions" type="number" placeholder={t('mixExam.versionsPlaceholder')} value={examSettings.mixVersions} onChange={e => handleInputChange('mixVersions', e.target.value)} />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label htmlFor="start-code" className="flex items-center gap-2"><KeyRound size={16} className="text-indigo-500"/>{t('mixExam.startCodeLabel')}</Label>
                      <Input id="start-code" type="number" placeholder={t('mixExam.startCodePlaceholder')} value={examSettings.mixStartCode} onChange={e => handleInputChange('mixStartCode', e.target.value)} />
                    </div>
                    {isLoading && (
                      <div className="pt-2">
                        <ProgressBar progress={progress} />
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">{loadingStatusText || t('mixExam.progressText', 'AI đang xử lý, vui lòng chờ... ({progress}%)', { progress: Math.round(progress) })}</p>
                      </div>
                    )}
                    <Button className="w-full mt-4" onClick={handleMixFromSettings} disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shuffle className="w-4 h-4 mr-2" />}
                      {isLoading ? t('mixExam.mixingButton') : t('mixExam.startButton')}
                    </Button>
                  </div>
                ) : (
                    <Placeholder setCurrentPage={setCurrentPage} />
                )}
            </TabsContent>

            <TabsContent value="from-file">
              <div className="space-y-4 max-w-lg mx-auto">
                <CardTitle className="text-lg text-center">{t('mixExam.fromFile.title')}</CardTitle>
                 <div className="space-y-2 text-left">
                    <Label htmlFor="versions-file" className="flex items-center gap-2"><Shuffle size={16} className="text-pink-500"/>{t('mixExam.versionsLabel')}</Label>
                    <Input id="versions-file" type="number" placeholder={t('mixExam.versionsPlaceholder')} value={examSettings.mixVersions} onChange={e => handleInputChange('mixVersions', e.target.value)} />
                </div>
                <div className="space-y-2 text-left">
                    <Label htmlFor="start-code-file" className="flex items-center gap-2"><KeyRound size={16} className="text-indigo-500"/>{t('mixExam.startCodeLabel')}</Label>
                    <Input id="start-code-file" type="number" placeholder={t('mixExam.startCodePlaceholder')} value={examSettings.mixStartCode} onChange={e => handleInputChange('mixStartCode', e.target.value)} />
                </div>
                <div 
                    className="space-y-4 border-2 border-dashed rounded-lg p-6 bg-slate-50 dark:bg-slate-800/50 text-center cursor-pointer hover:border-indigo-500 transition-colors" 
                    onDragOver={(e) => e.preventDefault()} 
                    onDrop={handleFileDrop}
                    onClick={() => document.getElementById('file-upload-mix')?.click()}
                >
                  <Upload className="w-10 h-10 mx-auto text-slate-400" />
                  <Label className="font-semibold text-slate-800 dark:text-slate-300 cursor-pointer">{t('mixExam.fromFile.uploadLabel')}</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('mixExam.fromFile.description')} <br/> (Hỗ trợ PDF, Word, Ảnh, Text, HTML)</p>
                  {uploadedFile && (
                    <div className="mt-2 text-sm font-medium text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900/50 p-2 rounded-md inline-flex items-center gap-2 max-w-full">
                        <FileText size={16} />
                        <span className="truncate">{uploadedFile.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }} className="text-red-500 hover:text-red-700 flex-shrink-0">
                            <XCircle size={16} />
                        </button>
                    </div>
                  )}
                  <input type="file" id="file-upload-mix" className="hidden" accept=".txt,.html,.md,.pdf,.docx,.doc,.jpg,.png,.jpeg" onChange={(e) => handleFileSelection(e.target.files ? e.target.files[0] : null)} disabled={isLoading}/>
                </div>
                {isLoading && (
                    <div className="pt-2 text-center">
                        <ProgressBar progress={progress} />
                        <p className="text-sm text-indigo-600 dark:text-indigo-400">{loadingStatusText || t('mixExam.progressFileText', 'AI đang xử lý file, vui lòng chờ... ({progress}%)', { progress: Math.round(progress) })}</p>
                    </div>
                )}
                <Button className="w-full mt-4" onClick={handleMixFromFile} disabled={isLoading || !uploadedFile}>
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {isLoading ? t('examStructure.semiAuto.processingButton') : t('mixExam.fromFile.generateButton')}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}