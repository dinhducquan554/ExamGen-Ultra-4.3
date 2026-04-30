import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { BookOpen, FileText, Loader2, ChevronLeft, BarChart2, Plus, Link, FileLock2 } from '../icons';
import { useExamCreation } from '../../hooks/useExamCreation';
import { useToast } from '../../hooks/useToast';
import { GeneratedExamData, Page, User } from '../../types';
import { GoogleGenAI } from "@google/genai";
import { useSystemInstruction } from '../../hooks/useSystemInstruction';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { useI18n } from '../../hooks/useI18n';
import { useAdvancedSettings } from '../../hooks/useAdvancedSettings';

interface OutlineWorkspaceProps {
  examData: GeneratedExamData | null;
  setOutlineData: (data: string | null) => void;
  setCurrentPage: (page: Page) => void;
  updateTokenUsage: (count: number) => void;
  currentUser: User;
}

export default function OutlineWorkspace({ examData, setOutlineData, setCurrentPage, updateTokenUsage, currentUser }: OutlineWorkspaceProps) {
  const { examSettings, setExamSettings } = useExamCreation();
  const { addToast } = useToast();
  const { systemInstruction } = useSystemInstruction();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
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
              Chức năng "Tạo đề cương ôn tập" không khả dụng cho tài khoản dùng thử. Vui lòng nâng cấp tài khoản của bạn để sử dụng đầy đủ tính năng.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (field: 'outlineQuestionCountMultiplier' | 'outlineIntegrationPercentage', value: string) => {
    setExamSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSelectChange = (field: 'outlineDetailLevel', value: string) => {
    setExamSettings(prev => ({...prev, [field]: value as any}));
  };

  const handleGenerateOutline = async () => {
    if (!examData || !examData.topics) {
      addToast(t('outline.toast.error.noStructure'));
      return;
    }
    const apiKey = localStorage.getItem('examgen_gemini_api_key');
    if (!apiKey) {
        addToast("Không tìm thấy API Key. Vui lòng vào Cài đặt > Trí tuệ nhân tạo để thiết lập.");
        return;
    }
    setIsLoading(true);
    addToast(t('outline.toast.start'));
    
    try {
        const ai = new GoogleGenAI({ apiKey });
        const { outlineQuestionCountMultiplier, outlineIntegrationPercentage, outlineDetailLevel } = examSettings;

        const prompt = `Với vai trò là một giáo viên kinh nghiệm, hãy tạo một đề cương ôn tập chi tiết ở mức độ **${outlineDetailLevel === 'basic' ? 'Cơ bản' : outlineDetailLevel === 'standard' ? 'Chuẩn' : 'Nâng cao'}** dựa trên cấu trúc đề thi (ma trận) sau đây:
\`\`\`json
${JSON.stringify(examData.topics, null, 2)}
\`\`\`
Đề cương cần bao gồm các phần sau:
1.  **Phần I – Giới thiệu chung:** Tóm tắt thông tin về môn học, khối lớp, phạm vi ôn tập.
2.  **Phần II – Hệ thống kiến thức trọng tâm:** Liệt kê chi tiết các đơn vị kiến thức, lý thuyết, công thức quan trọng cần nắm vững cho từng chủ đề/chương có trong cấu trúc. Mức độ chi tiết của phần này phải tương ứng với mức độ ${outlineDetailLevel} đã chọn.
3.  **Phần III – Câu hỏi và bài tập ôn tập:**
    - Dựa vào cấu trúc, tạo ra một bộ câu hỏi ôn tập với số lượng câu hỏi gấp ${outlineQuestionCountMultiplier} lần đề chính.
    - Phân bổ câu hỏi theo đúng các chủ đề và mức độ nhận thức đã cho. ${outlineIntegrationPercentage}% câu hỏi trong đề chính nên được tích hợp vào đề cương này.
    - **QUAN TRỌNG:** Sắp xếp các câu hỏi theo đúng thứ tự sau: Trắc nghiệm nhiều lựa chọn, Trắc nghiệm Đúng/Sai, Trắc nghiệm trả lời ngắn, và cuối cùng là Tự luận.
4.  **Phần IV – ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM:**
    - Sau khi hoàn tất Phần III, hãy thêm mục này.
    - **Cấu trúc:** Phần đáp án phải được trình bày theo đúng cấu trúc của đề thi, bao gồm các phần lớn như "A. PHẦN TRẮC NGHIỆM" và "B. PHẦN TỰ LUẬN", kèm theo tổng số câu và tổng điểm cho mỗi phần.
    - **Phần trắc nghiệm:** Cung cấp một bảng đáp án rõ ràng cho toàn bộ các câu hỏi trắc nghiệm (Nhiều lựa chọn, Đúng/Sai, Trả lời ngắn).
    - **Phần tự luận:** Đối với mỗi câu hỏi tự luận, cung cấp **hướng dẫn chấm điểm chi tiết (đáp án và biểu điểm)**, phân chia thang điểm cho từng ý, từng luận điểm một cách rõ ràng để giáo viên có thể dễ dàng chấm bài. Ví dụ:
      - *Câu 1 (3.0 điểm):*
        - *Ý 1: Nêu đúng khái niệm... (1.0 điểm)*
        - *Ý 2: Phân tích được... (1.5 điểm)*
        - *Ý 3: Trình bày sạch đẹp, đúng chính tả... (0.5 điểm)*

Hãy trả về toàn bộ nội dung đề cương (từ Phần I đến Phần IV) dưới dạng một chuỗi HTML duy nhất, có định dạng đẹp, rõ ràng, sử dụng các thẻ \`<h4>\`, \`<ul>\`, \`<li>\`, \`<strong>\`, \`<p>\`, và \`<br/>\`.`;

        const response = await ai.models.generateContent({
            model: advSettings.aiModel,
            contents: prompt,
            config: {
              systemInstruction: systemInstruction.instruction,
            }
        });

        if (response.usageMetadata) {
            updateTokenUsage(response.usageMetadata.totalTokenCount);
        }

        const outlineHtml = response.text;
        setOutlineData(outlineHtml);
        addToast(t('outline.toast.success'));
        setCurrentPage('results');
    } catch (error) {
        console.error("Lỗi khi tạo đề cương bằng AI:", error);
        addToast(t('outline.toast.error.generic'));
    } finally {
        setIsLoading(false);
    }
  };

  if (!examData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-lg text-center p-8">
          <CardHeader>
            <div className="mx-auto bg-yellow-100 dark:bg-yellow-900/50 rounded-full p-3 w-fit">
               <FileText className="w-8 h-8 text-yellow-500" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
              {t('mixExam.placeholder.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('mixExam.placeholder.description')}
            </p>
            <Button onClick={() => setCurrentPage('exam-structure')} className="w-full">
              <ChevronLeft className="w-4 h-4 mr-2" />
              {t('mixExam.placeholder.button')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          {t('outline.title')}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
            <Card className="shadow-lg border-none bg-white dark:bg-gray-900">
                <CardHeader>
                    <CardTitle>{t('outline.configTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-2"><BarChart2 size={16} className="text-cyan-500"/>{t('outline.detailLevelLabel')}</Label>
                        <Select value={examSettings.outlineDetailLevel} onValueChange={(v) => handleSelectChange('outlineDetailLevel', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('outline.detailLevelLabel')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="basic">{t('outline.detailLevel.basic')}</SelectItem>
                                <SelectItem value="standard">{t('outline.detailLevel.standard')}</SelectItem>
                                <SelectItem value="advanced">{t('outline.detailLevel.advanced')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-2"><Plus size={16} className="text-green-500"/>{t('outline.questionMultiplierLabel')}</Label>
                        <Input placeholder={t('outline.questionMultiplierPlaceholder')} type="number" value={examSettings.outlineQuestionCountMultiplier} onChange={e => handleInputChange('outlineQuestionCountMultiplier', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-2"><Link size={16} className="text-blue-500"/>{t('outline.integrationLabel')}</Label>
                        <Input placeholder={t('outline.integrationPlaceholder')} type="number" value={examSettings.outlineIntegrationPercentage} onChange={e => handleInputChange('outlineIntegrationPercentage', e.target.value)} />
                    </div>
                    <Button className="w-full" onClick={handleGenerateOutline} disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />}
                        {isLoading ? t('outline.generatingButton') : t('outline.generateButton')}
                    </Button>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-none bg-white dark:bg-gray-900">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>{t('outline.previewTitle')}</CardTitle>
              <Button variant="outline"><FileText className="w-4 h-4 mr-2" />{t('outline.exportButton')}</Button>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-full bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg h-[60vh] overflow-auto">
              <h4>Phần I – Giới thiệu chung</h4>
              <ul>
                <li><strong>Môn học:</strong> Hóa học (Tự động cập nhật)</li>
                <li><strong>Khối lớp:</strong> 10 (Tự động cập nhật)</li>
                <li><strong>Bộ sách giáo khoa:</strong> Kết nối tri thức với cuộc sống (Tự động cập nhật)</li>
                <li><strong>Phạm vi ôn tập:</strong> Chương 1 (Ester – Lipid), Chương 2 (Carbohydrate). (Tự động cập nhật)</li>
              </ul>
              <h4>Phần II – Hệ thống kiến thức trọng tâm</h4>
              <p><strong>Chương 1: Ester – Lipid</strong></p>
              <p><strong>1. Ester</strong><br/>- Khái niệm: ...<br/>- CTPT chung: ...<br/><em>Yêu cầu cần đạt: Nêu được..., viết được…</em></p>
              <p><strong>2. Lipid</strong><br/>- Khái niệm: ...<br/><em>Yêu cầu cần đạt: Phân biệt được…</em></p>
              <h4>Phần III – Câu hỏi và bài tập ôn tập</h4>
              <p><strong>A. Trắc nghiệm nhiều lựa chọn</strong></p>
              <p><strong>Câu 1 (Nhận biết, Chương 1: Ester – Lipid).</strong><br/>Tên gọi của este có công thức CH₃COOC₂H₅ là<br/>A. methyl acetate<br/>B. propyl formate<br/>C. ethyl acetate<br/>D. methyl propionate</p>
              <p>...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}