import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Label } from '../ui/Label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/Select';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTheme } from '../../hooks/useTheme';
import { useAdvancedSettings } from '../../hooks/useAdvancedSettings';
import { useToast } from '../../hooks/useToast';
import { Switch } from '../ui/Switch';
import { Slider } from '../ui/Slider';
import { Sliders, Database, Shield, Sparkles, Printer, Link, Terminal, Info, Moon, Sun, Palette, Type, FileLock2, FolderCog, Cloud, KeySquare, History, Bot, Users as UsersIcon, Eye, EyeOff, Brain } from '../icons';
import { Page } from '../../types';
import LicenseGeneratorModal from '../auth/LicenseGeneratorModal';
import { useI18n } from '../../hooks/useI18n';

const settingsCategories = [
  { id: 'general', title: 'Cài đặt Chung', tKey: 'settings.categories.general', icon: <Sliders className="w-5 h-5" /> },
  { id: 'data', title: 'Dữ liệu & Lưu trữ', tKey: 'settings.categories.data', icon: <Database className="w-5 h-5" /> },
  { id: 'security', title: 'Bảo mật & Người dùng', tKey: 'settings.categories.security', icon: <Shield className="w-5 h-5" /> },
  { id: 'ai', title: 'Trí tuệ nhân tạo', tKey: 'settings.categories.ai', icon: <Sparkles className="w-5 h-5" /> },
  { id: 'publishing', title: 'Xuất bản & In ấn', tKey: 'settings.categories.publishing', icon: <Printer className="w-5 h-5" /> },
  { id: 'connections', title: 'Kết nối & Tích hợp', tKey: 'settings.categories.connections', icon: <Link className="w-5 h-5" /> },
  { id: 'advanced', title: 'Tùy chỉnh nâng cao', tKey: 'settings.categories.advanced', icon: <Terminal className="w-5 h-5" /> },
  { id: 'about', title: 'Hỗ trợ & Giới thiệu', tKey: 'settings.categories.about', icon: <Info className="w-5 h-5" /> },
];

// Helper component for consistent layout in panels
const SettingItem: React.FC<{ title: string; description: string; children: React.ReactNode; }> = ({ title, description, children }) => (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-4 border-b border-slate-200 dark:border-slate-800 last:border-b-0">
        <div>
            <h4 className="font-medium text-slate-800 dark:text-slate-100">{title}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="flex-shrink-0">{children}</div>
    </div>
);

// --- PANELS IMPLEMENTATION ---

const GeneralPanel: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const { advSettings, setAdvSettings } = useAdvancedSettings();
    const { t } = useI18n();

    return (
        <Card className="shadow-lg border-none bg-white dark:bg-slate-900">
            <CardHeader><CardTitle className="flex items-center gap-2"><Sliders/> {t('settings.general.title')}</CardTitle></CardHeader>
            <CardContent className="p-0">
                <SettingItem title={t('settings.general.theme')} description={t('settings.general.themeDescription')}>
                    <div className="flex gap-2">
                        <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')} className="flex items-center gap-2"><Sun className="w-4 h-4" /> {t('sidebar.lightMode')}</Button>
                        <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')} className="flex items-center gap-2"><Moon className="w-4 h-4" /> {t('sidebar.darkMode')}</Button>
                    </div>
                </SettingItem>
                <SettingItem title={t('settings.general.language')} description={t('settings.general.languageDescription')}>
                    <Select value={advSettings.language} onValueChange={(v) => setAdvSettings({ language: v as 'vi' | 'en' })}>
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vi">{t('settings.general.languageVi')}</SelectItem>
                          <SelectItem value="en">{t('settings.general.languageEn')}</SelectItem>
                        </SelectContent>
                    </Select>
                </SettingItem>
                <SettingItem title="Phông chữ & kích thước" description="Điều chỉnh cỡ chữ cho dễ đọc hơn.">
                    <div className="w-40">
                      <Slider min="80" max="120" value={advSettings.fontSize} onInput={(e) => setAdvSettings({ fontSize: parseInt((e.target as HTMLInputElement).value) })} />
                    </div>
                </SettingItem>
                <SettingItem title="Âm thanh & thông báo" description="Bật/tắt thông báo nổi trên màn hình.">
                    <Switch checked={advSettings.enableNotifications} onCheckedChange={(c) => setAdvSettings({ enableNotifications: c })} />
                </SettingItem>
            </CardContent>
        </Card>
    );
};

const DataPanel: React.FC = () => {
    const { advSettings, setAdvSettings } = useAdvancedSettings();
    const { addToast } = useToast();
    const [autoSaveError, setAutoSaveError] = useState<string | null>(null);

    const handleAutoSaveIntervalChange = (value: string) => {
        if (value === '' || /^\d+$/.test(value)) {
            const numValue = Number(value);
            if (value !== '' && (numValue < 1 || numValue > 60)) {
                setAutoSaveError("Hợp lệ: 1-60 phút.");
            } else {
                setAutoSaveError(null);
            }
            setAdvSettings({ autoSaveInterval: Number(value) || 5 }); // Default to 5 if empty/0
        }
    };

    return (
        <Card className="shadow-lg border-none bg-white dark:bg-slate-900">
            <CardHeader><CardTitle className="flex items-center gap-2"><Database/> Dữ liệu & Lưu trữ</CardTitle></CardHeader>
            <CardContent className="p-0">
                <SettingItem title="Đường dẫn lưu trữ mặc định" description="Nơi lưu các file được xuất ra (DOCX, PDF, ...).">
                    <Input className="w-64" value={advSettings.defaultSavePath} onChange={(e) => setAdvSettings({ defaultSavePath: e.target.value })}/>
                </SettingItem>
                <SettingItem title="Tự động lưu" description={advSettings.autoSave ? `Lưu sau mỗi ${advSettings.autoSaveInterval} phút.` : "Tính năng tự động lưu đang tắt."}>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                          <Input 
                              type="text" 
                              inputMode="numeric"
                              className="w-20 text-center"
                              value={advSettings.autoSaveInterval} 
                              onChange={(e) => handleAutoSaveIntervalChange(e.target.value)}
                              disabled={!advSettings.autoSave}
                          />
                          <span className="text-sm text-slate-600 dark:text-slate-400">phút</span>
                          <Switch checked={advSettings.autoSave} onCheckedChange={(c) => setAdvSettings({ autoSave: c })} />
                      </div>
                      {autoSaveError && advSettings.autoSave && <p className="text-xs text-red-500 mt-1 text-right w-full">{autoSaveError}</p>}
                    </div>
                </SettingItem>
                <SettingItem title="Khôi phục dữ liệu" description="Sao lưu toàn bộ dữ liệu hoặc phục hồi từ một bản sao lưu.">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => addToast('Đã bắt đầu sao lưu dữ liệu.')}>Sao lưu</Button>
                        <Button variant="outline" onClick={() => addToast('Chức năng đang phát triển.')}>Phục hồi</Button>
                    </div>
                </SettingItem>
                 <SettingItem title="Dọn dẹp hệ thống" description="Xóa cache và các file tạm để giải phóng dung lượng.">
                    <Button variant="outline" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50" onClick={() => addToast('Đã dọn dẹp cache hệ thống.')}>Dọn dẹp ngay</Button>
                </SettingItem>
            </CardContent>
        </Card>
    );
};

const SecurityPanel: React.FC<{ 
    setCurrentPage: (page: Page) => void;
    onGenerateLicenseClick: () => void;
}> = ({ setCurrentPage, onGenerateLicenseClick }) => {
    const { advSettings, setAdvSettings } = useAdvancedSettings();
    const { addToast } = useToast();
    return (
        <Card className="shadow-lg border-none bg-white dark:bg-slate-900">
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield/> Bảo mật & Người dùng</CardTitle></CardHeader>
            <CardContent className="p-0">
                <SettingItem title="Quản lý người dùng" description="Thêm, sửa, xóa, và phân quyền cho người dùng.">
                    <Button variant="outline" onClick={() => setCurrentPage('users')}><UsersIcon className="w-4 h-4 mr-2"/>Đi đến trang quản lý</Button>
                </SettingItem>
                <SettingItem title="Quản lý giấy phép" description="Tạo và quản lý key bản quyền cho người dùng.">
                    <Button variant="outline" onClick={onGenerateLicenseClick}>
                        <KeySquare className="w-4 h-4 mr-2"/>Tạo Key
                    </Button>
                </SettingItem>
                <SettingItem title="Đổi mật khẩu" description="Thay đổi mật khẩu đăng nhập hiện tại của bạn.">
                    <Input type="password" placeholder="Mật khẩu mới" className="w-48"/>
                </SettingItem>
                <SettingItem title="Xác thực hai lớp (2FA)" description="Tăng cường bảo mật bằng mã xác thực qua email.">
                    <Switch checked={advSettings.enable2FA} onCheckedChange={(c) => setAdvSettings({ enable2FA: c })} />
                </SettingItem>
                <SettingItem title="Nhật ký hoạt động" description="Xem lại lịch sử các thao tác quan trọng trong hệ thống.">
                     <Button variant="outline" onClick={() => addToast('Chức năng đang phát triển.')}><History className="w-4 h-4 mr-2"/>Xem nhật ký</Button>
                </SettingItem>
            </CardContent>
        </Card>
    );
};

const AiPanel: React.FC = () => {
    const { advSettings, setAdvSettings } = useAdvancedSettings();
    const { addToast } = useToast();
    const API_KEY_STORAGE_KEY = 'examgen_gemini_api_key';
    const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE_KEY) || '');
    const [showKey, setShowKey] = useState(false);

    const handleSaveKey = () => {
        if (!apiKey.trim()) {
            addToast("API Key không được để trống.");
            return;
        }
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
        addToast("Đã cập nhật Gemini API Key.");
    };

    return (
        <Card className="shadow-lg border-none bg-white dark:bg-slate-900">
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles/> Trí tuệ nhân tạo</CardTitle></CardHeader>
            <CardContent className="p-0">
                <SettingItem title="Gemini API Key" description="Cung cấp khóa API của bạn để sử dụng các tính năng AI.">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Input
                                type={showKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="w-64"
                                placeholder="Nhập API Key của bạn"
                            />
                            <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-auto" onClick={() => setShowKey(!showKey)}>
                                {showKey ? <EyeOff size={18}/> : <Eye size={18}/>}
                            </Button>
                        </div>
                        <Button onClick={handleSaveKey}>Lưu</Button>
                    </div>
                </SettingItem>
                 <SettingItem title="Chế độ AI hỗ trợ" description="Bật/tắt các tính năng gợi ý và tự động hóa của AI.">
                    <Switch checked={advSettings.aiAssistant} onCheckedChange={(c) => setAdvSettings({ aiAssistant: c })} />
                </SettingItem>
                <SettingItem title="Mức độ tự động" description="Chọn mức độ can thiệp của AI trong quá trình làm việc.">
                    <Select value={advSettings.automationLevel} onValueChange={(v) => setAdvSettings({ automationLevel: v as 'manual' | 'suggested' | 'full' })}>
                        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="manual">Thủ công</SelectItem>
                            <SelectItem value="suggested">Gợi ý</SelectItem>
                            <SelectItem value="full">Tự động hoàn toàn</SelectItem>
                        </SelectContent>
                    </Select>
                </SettingItem>
                <SettingItem title="Cấu hình mô hình AI" description="Chọn mô hình ngôn ngữ sẽ được sử dụng.">
                    <Select value={advSettings.aiModel} onValueChange={(v) => setAdvSettings({ aiModel: v as any })}>
                        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                            <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                            <SelectItem value="gpt-4">GPT-4 (Coming soon)</SelectItem>
                            <SelectItem value="claude-3">Claude 3 (Coming soon)</SelectItem>
                        </SelectContent>
                    </Select>
                </SettingItem>
                 <SettingItem title="Nhật ký AI" description="Xem lịch sử các nội dung đã được tạo bởi AI.">
                     <Button variant="outline" onClick={() => {}}><Bot className="w-4 h-4 mr-2"/>Xem lịch sử AI</Button>
                </SettingItem>
            </CardContent>
        </Card>
    );
};

const PublishingPanel: React.FC = () => {
    const { advSettings, setAdvSettings } = useAdvancedSettings();
    return (
        <Card className="shadow-lg border-none bg-white dark:bg-slate-900">
            <CardHeader><CardTitle className="flex items-center gap-2"><Printer/> Xuất bản & In ấn</CardTitle></CardHeader>
            <CardContent className="p-0">
                <SettingItem title="Mẫu định dạng xuất" description="Chọn mẫu mặc định cho đề thi, ma trận, kế hoạch..."><Input className="w-60" value={advSettings.defaultTemplate} onChange={(e) => setAdvSettings({ defaultTemplate: e.target.value })}/></SettingItem>
                <SettingItem title="Logo & tiêu đề" description="Gắn logo trường và tiêu đề cố định vào file xuất.">
                    <div className="flex items-center gap-2">
                        <Switch checked={advSettings.enableLogo} onCheckedChange={(c) => setAdvSettings({ enableLogo: c })} />
                        <Input type="file" className="text-xs w-56" />
                    </div>
                </SettingItem>
                <SettingItem title="Watermark bảo mật" description="Thêm hình mờ (chữ ký chìm) vào văn bản.">
                     <div className="flex items-center gap-2">
                        <Switch checked={advSettings.enableWatermark} onCheckedChange={(c) => setAdvSettings({ enableWatermark: c })} />
                        <Input className="w-40" placeholder="VD: Bản nháp" value={advSettings.watermarkText} onChange={e => setAdvSettings({ watermarkText: e.target.value })}/>
                    </div>
                </SettingItem>
                <SettingItem title="Quy tắc đặt tên file" description="Cấu trúc tên file khi xuất ra.">
                    <Input className="w-64" value={advSettings.fileNameConvention} onChange={e => setAdvSettings({ fileNameConvention: e.target.value })}/>
                </SettingItem>
            </CardContent>
        </Card>
    );
};

const ConnectionsPanel: React.FC = () => {
    const { advSettings, setAdvSettings } = useAdvancedSettings();
    return (
        <Card className="shadow-lg border-none bg-white dark:bg-slate-900">
            <CardHeader><CardTitle className="flex items-center gap-2"><Link/> Kết nối & Tích hợp</CardTitle></CardHeader>
            <CardContent className="p-0">
                <SettingItem title="Tích hợp Google Drive / OneDrive" description="Lưu trữ và đồng bộ tự động lên đám mây.">
                    <Button variant="outline"><Cloud className="w-4 h-4 mr-2"/>Kết nối</Button>
                </SettingItem>
                <SettingItem title="Đồng bộ tài khoản" description="Liên kết với tài khoản Google hoặc Microsoft.">
                    <Button variant="outline">Liên kết</Button>
                </SettingItem>
                <SettingItem title="Tự động cập nhật" description="Tự kiểm tra và cài đặt phiên bản mới.">
                    <Switch checked={advSettings.autoUpdate} onCheckedChange={(c) => setAdvSettings({ autoUpdate: c })} />
                </SettingItem>
            </CardContent>
        </Card>
    );
};

const AdvancedPanel: React.FC = () => {
    const { advSettings, setAdvSettings } = useAdvancedSettings();
     return (
        <Card className="shadow-lg border-none bg-white dark:bg-slate-900">
            <CardHeader><CardTitle className="flex items-center gap-2"><Terminal/> Tùy chỉnh nâng cao</CardTitle></CardHeader>
            <CardContent className="p-0">
                 <SettingItem title="Cấu hình Ma trận mặc định" description="Chọn kiểu hiển thị ma trận mặc định khi tạo đề.">
                    <Select value={advSettings.defaultMatrix} onValueChange={(v) => setAdvSettings({ defaultMatrix: v as any })}>
                        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cv7991">CV 7991</SelectItem>
                            <SelectItem value="nguvan">Môn Ngữ văn</SelectItem>
                        </SelectContent>
                    </Select>
                </SettingItem>
                <SettingItem title="Hỗ trợ công thức toán học" description="Bật/tắt hiển thị công thức (MathJax/LaTeX).">
                    <Switch checked={advSettings.enableMathJax} onCheckedChange={(c) => setAdvSettings({ enableMathJax: c })} />
                </SettingItem>
                <SettingItem title="Phông chữ trình soạn thảo" description="Chọn phông chữ mặc định cho nội dung đề thi.">
                    <Select value={advSettings.editorFontFamily} onValueChange={(v) => setAdvSettings({ editorFontFamily: v as any })}>
                        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="times">Times New Roman</SelectItem>
                            <SelectItem value="arial">Arial</SelectItem>
                            <SelectItem value="calibri">Calibri</SelectItem>
                        </SelectContent>
                    </Select>
                </SettingItem>
                <SettingItem title="Giãn dòng" description="Điều chỉnh khoảng cách giữa các dòng văn bản.">
                    <Select value={String(advSettings.editorLineSpacing)} onValueChange={(v) => setAdvSettings({ editorLineSpacing: parseFloat(v) })}>
                        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Single</SelectItem>
                            <SelectItem value="1.15">1.15</SelectItem>
                            <SelectItem value="1.5">1.5</SelectItem>
                            <SelectItem value="2">Double</SelectItem>
                        </SelectContent>
                    </Select>
                </SettingItem>
            </CardContent>
        </Card>
    );
};

const AboutPanel: React.FC = () => (
    <Card className="shadow-lg border-none bg-white dark:bg-slate-900">
        <CardHeader><CardTitle className="flex items-center gap-2"><Info/> Hỗ trợ & Giới thiệu</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center">
                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mb-4">
                     <Brain size={32} />
                 </div>
                 <h3 className="text-xl font-bold">ExamGen Ultra 4.3</h3>
                 <p className="text-sm text-slate-500">Phiên bản 4.3.0</p>
                 <p className="text-sm mt-2">© 2025 ExamGen. Đã đăng ký bản quyền.</p>
                 <div className="flex gap-4 mt-4">
                     <Button variant="outline">Tài liệu hướng dẫn</Button>
                     <Button variant="outline">Báo cáo lỗi</Button>
                 </div>
            </div>
        </CardContent>
    </Card>
);

interface SettingsWorkspaceProps {
  setCurrentPage: (page: Page) => void;
}

export default function SettingsWorkspace({ setCurrentPage }: SettingsWorkspaceProps) {
  const [activeCategory, setActiveCategory] = useState('general');
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const { t } = useI18n();

  const renderPanel = () => {
    switch (activeCategory) {
      case 'general':
        return <GeneralPanel />;
      case 'data':
        return <DataPanel />;
      case 'security':
        return <SecurityPanel setCurrentPage={setCurrentPage} onGenerateLicenseClick={() => setIsLicenseModalOpen(true)} />;
      case 'ai':
        return <AiPanel />;
      case 'publishing':
        return <PublishingPanel />;
      case 'connections':
        return <ConnectionsPanel />;
      case 'advanced':
        return <AdvancedPanel />;
      case 'about':
        return <AboutPanel />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          Cài đặt hệ thống
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <nav className="flex flex-col space-y-1">
              {settingsCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium w-full text-left transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {React.cloneElement(cat.icon, { className: `w-5 h-5 ${activeCategory === cat.id ? '' : 'text-slate-500 dark:text-slate-400'}` })}
                  <span>{t(cat.tKey as any, cat.title)}</span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="lg:col-span-3">
            {renderPanel()}
          </main>
        </div>
      </div>
      <LicenseGeneratorModal isOpen={isLicenseModalOpen} onClose={() => setIsLicenseModalOpen(false)} />
    </>
  );
}