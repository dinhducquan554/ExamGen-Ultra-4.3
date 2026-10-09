import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  KeySquare, 
  Sparkles, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Zap, 
  Brain, 
  Sliders, 
  Info,
  Shield,
  Bot
} from '../icons';
import { useAdvancedSettings } from '../../hooks/useAdvancedSettings';
import { useToast } from '../../hooks/useToast';
import { testGeminiConnection } from '../../lib/gemini';

const API_KEY_STORAGE_KEY = 'examgen_gemini_api_key';

interface AiModelOption {
  id: string;
  name: string;
  tag: string;
  tagVariant: 'default' | 'success' | 'warning' | 'info';
  description: string;
  recommendedFor: string;
  speed: string;
}

const AI_MODELS: AiModelOption[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    tag: 'Khuyên dùng • Nhanh nhất',
    tagVariant: 'success',
    description: 'Tốc độ phản hồi cực nhanh, tối ưu chi phí và hạn mức gọi (Quota). Phù hợp nhất cho việc tạo đề thi và ma trận hàng ngày.',
    recommendedFor: 'Tạo đề thi trắc nghiệm, ma trận, kiểm tra câu hỏi, Trò chuyện AI',
    speed: 'Siêu tốc (~1-3s)'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    tag: 'Tư duy chuyên sâu',
    tagVariant: 'info',
    description: 'Mô hình tư duy mạnh mẽ nhất, suy luận logic sâu sắc, giải chi tiết bài toán nâng cao và soạn đề Ngữ văn xuất sắc.',
    recommendedFor: 'Đề thi THPT, Học sinh giỏi, Câu hỏi vận dụng cao (VDC), Viết văn',
    speed: 'Tiêu chuẩn (~4-8s)'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    tag: 'Ổn định cao',
    tagVariant: 'default',
    description: 'Phiên bản Flash thế hệ 1.5 có độ ổn định cao, là lựa chọn tuyệt vời để dự phòng khi gặp sự cố mạng hoặc quá tải máy chủ.',
    recommendedFor: 'Dự phòng khi gặp lỗi 429/503 ở cụm mô hình mới',
    speed: 'Rất nhanh (~2-4s)'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    tag: 'Ngữ cảnh cực lớn',
    tagVariant: 'warning',
    description: 'Hỗ trợ cửa sổ ngữ cảnh khổng lồ, thích hợp khi phân tích sách giáo khoa, toàn bộ tài liệu chuyên môn dài nhiều trang.',
    recommendedFor: 'Trích xuất đề từ file tài liệu lớn, đề cương chi tiết dài',
    speed: 'Trung bình (~6-12s)'
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    tag: 'Thế hệ mới nhất',
    tagVariant: 'info',
    description: 'Mô hình thế hệ 3.8 mới nhất của Google, tối ưu hóa khả năng hiểu ngữ cảnh tiếng Việt và suy luận tức thời.',
    recommendedFor: 'Trải nghiệm công nghệ AI mới nhất từ Google',
    speed: 'Tối ưu (~2-3s)'
  }
];

interface AiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyChange?: (newKey: string) => void;
}

export const AiConfigModal: React.FC<AiConfigModalProps> = ({ isOpen, onClose, onApiKeyChange }) => {
  const { advSettings, setAdvSettings } = useAdvancedSettings();
  const { addToast } = useToast();

  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [customModel, setCustomModel] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load existing key and model when modal opens
  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY) || '';
      setApiKey(storedKey);
      setTestResult(null);

      const currentModel = advSettings.aiModel || 'gemini-2.5-flash';
      const existsInList = AI_MODELS.some(m => m.id === currentModel);

      if (existsInList) {
        setSelectedModel(currentModel);
        setIsCustom(false);
        setCustomModel('');
      } else {
        setIsCustom(true);
        setSelectedModel('custom');
        setCustomModel(currentModel);
      }
    }
  }, [isOpen, advSettings.aiModel]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập API Key trước khi kiểm tra kết nối.'
      });
      return;
    }

    const targetModel = isCustom ? (customModel.trim() || 'gemini-2.5-flash') : selectedModel;
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testGeminiConnection(apiKey.trim(), targetModel);
      setTestResult(res);
      if (res.success) {
        addToast("Kiểm tra kết nối thành công! Khóa API và mô hình hoạt động tốt.");
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Có lỗi xảy ra khi kiểm tra kết nối.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      addToast("Vui lòng nhập API Key để các tính năng AI hoạt động.");
      return;
    }

    const finalModel = isCustom ? (customModel.trim() || 'gemini-2.5-flash') : selectedModel;

    // Save to localStorage
    localStorage.setItem(API_KEY_STORAGE_KEY, trimmedKey);

    // Save to advanced settings
    setAdvSettings({
      aiModel: finalModel
    });

    // Notify listeners / callbacks
    if (onApiKeyChange) {
      onApiKeyChange(trimmedKey);
    }

    // Dispatch global event for instant reactivity across components
    window.dispatchEvent(new CustomEvent('examgen-api-key-updated', { detail: trimmedKey }));

    addToast(`Đã lưu thành công cấu hình: Mô hình ${finalModel}`);
    onClose();
  };

  const handleClearKey = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa API Key hiện tại không?")) {
      setApiKey('');
      setTestResult(null);
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      if (onApiKeyChange) onApiKeyChange('');
      window.dispatchEvent(new CustomEvent('examgen-api-key-updated', { detail: '' }));
      addToast("Đã xóa API Key khỏi thiết bị.");
    }
  };

  const isConfigured = Boolean(apiKey.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <KeySquare size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Cấu hình API Key & Mô hình AI
                <Badge variant={isConfigured ? 'success' : 'warning'}>
                  {isConfigured ? 'Đã thiết lập' : 'Chưa có Key'}
                </Badge>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lựa chọn Module AI và quản lý khóa truy cập Gemini API dành cho mọi người dùng
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Đóng"
          >
            <XCircle size={22} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* PHẦN 1: API KEY */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <Label htmlFor="gemini-key" className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Shield size={16} className="text-amber-500" />
                Google Gemini API Key
              </Label>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                Lấy Key miễn phí tại Google AI Studio ↗
              </a>
            </div>

            <div className="relative">
              <Input
                id="gemini-key"
                type={showKey ? 'text' : 'password'}
                placeholder="Nhập API Key của bạn (bắt đầu bằng AIzaSy...)"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestResult(null);
                }}
                className="pr-10 font-mono text-xs md:text-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={showKey ? 'Ẩn khóa' : 'Hiện khóa'}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={isTesting || !apiKey.trim()}
                  className="text-xs flex items-center gap-1.5 border-indigo-300 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300"
                >
                  {isTesting ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-indigo-600" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    <>
                      <Zap size={14} className="text-amber-500" />
                      Kiểm tra kết nối
                    </>
                  )}
                </Button>

                {apiKey && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearKey}
                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Xóa Key
                  </Button>
                )}
              </div>

              <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                * Khóa được lưu cục bộ an toàn trên trình duyệt của bạn
              </span>
            </div>

            {/* Test Connection Result Box */}
            {testResult && (
              <div 
                className={`p-3 rounded-lg text-xs flex items-start gap-2.5 transition-all ${
                  testResult.success 
                    ? 'bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 size={16} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                ) : (
                  <XCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                )}
                <div className="flex-1 leading-relaxed">
                  <p className="font-semibold mb-0.5">
                    {testResult.success ? 'Kết nối thành công!' : 'Kết nối thất bại:'}
                  </p>
                  <p>{testResult.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* PHẦN 2: LỰA CHỌN MODULE AI */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Brain size={16} className="text-indigo-500" />
                  Lựa chọn Module / Mô hình AI
                </Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Chọn mô hình sẽ xử lý sinh đề thi, ma trận, lời giải chi tiết và trò chuyện AI
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {AI_MODELS.map((model) => {
                const isSelected = !isCustom && selectedModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => {
                      setIsCustom(false);
                      setSelectedModel(model.id);
                      setTestResult(null);
                    }}
                    className={`cursor-pointer rounded-xl p-3 border transition-all text-left flex items-start gap-3 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50'
                    }`}
                  >
                    <div className="pt-0.5">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                            {model.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">({model.id})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-medium">{model.speed}</span>
                          <Badge variant={model.tagVariant}>{model.tag}</Badge>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-1 leading-relaxed">
                        {model.description}
                      </p>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Phù hợp:</span>
                        <span>{model.recommendedFor}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Tùy chỉnh mô hình khác */}
              <div
                onClick={() => {
                  setIsCustom(true);
                  setSelectedModel('custom');
                  setTestResult(null);
                }}
                className={`cursor-pointer rounded-xl p-3 border transition-all text-left flex items-start gap-3 ${
                  isCustom
                    ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50'
                }`}
              >
                <div className="pt-0.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    isCustom ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {isCustom && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                      Mô hình tùy chỉnh khác (Custom Model)
                    </span>
                    <Badge variant="default">Tùy biến</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Nhập tên định danh mô hình nếu bạn muốn sử dụng model thử nghiệm mới hoặc tinh chỉnh riêng từ Google AI Studio.
                  </p>

                  {isCustom && (
                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        placeholder="Ví dụ: gemini-2.5-flash hoặc gemini-3.1-pro-preview"
                        value={customModel}
                        onChange={(e) => setCustomModel(e.target.value)}
                        className="text-xs font-mono bg-white dark:bg-slate-900"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* HƯỚNG DẪN XỬ LÝ SỰ CỐ & QUOTA */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
              <Info size={15} />
              Mẹo xử lý khi gặp lỗi hạn mức (429) hoặc quá tải (503):
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1 leading-relaxed">
              <li>
                <strong>Lỗi 429 (Resource Exhausted):</strong> Do gói miễn phí thường giới hạn 15 yêu cầu/phút. Hãy chọn <strong>Gemini 2.5 Flash</strong> (nhẹ và ít tốn quota hơn) hoặc thay bằng một API Key tạo từ tài khoản Google khác.
              </li>
              <li>
                <strong>Lỗi 503 (Unavailable):</strong> Máy chủ Google đang tải cao tạm thời. Hệ thống đã tích hợp cơ chế tự động thử lại sau vài giây. Bạn cũng có thể đổi mô hình sang <strong>Gemini 1.5 Flash</strong> để duy trì ổn định.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Mô hình đang chọn: <strong className="text-indigo-600 dark:text-indigo-400">{isCustom ? (customModel || 'Chưa nhập') : selectedModel}</strong>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs md:text-sm"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="text-xs md:text-sm bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white shadow-md font-medium"
            >
              Lưu cấu hình
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiConfigModal;
