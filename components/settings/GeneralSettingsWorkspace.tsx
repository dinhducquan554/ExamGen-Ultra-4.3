import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";
import { Input } from "../ui/Input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../ui/Select";
import { Label } from "../ui/Label";
import { PROVINCES, SCHOOLS_BY_PROVINCE, PROFESSIONAL_GROUPS, SCHOOL_LEVELS_CONFIG, TEXTBOOKS, EXAM_TYPES } from "../../constants";
import { CheckCircle2, XCircle, History, BookOpen, Users, BarChart2, FileText, Type as TypeIcon, User as UserIcon } from "../icons";
import { useSettings } from "../../hooks/useSettings";
import { AppSettings } from "../../contexts/SettingsContext";
import { SelectWithOther } from "../ui/SelectWithOther";
import { Button } from "../ui/Button";
import { useToast } from "../../hooks/useToast";
import { useExamCreation } from "../../hooks/useExamCreation";
import { ExamCreationState } from "../../contexts/ExamCreationContext";
import { useI18n } from "../../hooks/useI18n";

const GeneralSettingsWorkspace: React.FC = () => {
  const { settings, saveSettings, resetSettings } = useSettings();
  const { examSettings, setExamSettings } = useExamCreation();
  const { addToast } = useToast();
  const { t } = useI18n();
  const [durationError, setDurationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('unitInfo');

  useEffect(() => {
    if (settings.subject === 'Ngữ văn') {
        setExamSettings(prev => {
            const autoNeedsUpdate = (prev.auto.matrixType !== 'm3' || 
                                prev.auto.distTn !== '0' ||
                                prev.auto.distTl !== '100' ||
                                prev.auto.cauHoiTracNghiem?.cau !== "0" ||
                                prev.auto.cauHoiDungSai?.cau !== "0" ||
                                prev.auto.cauHoiTraLoiNgan?.cau !== "0");
            
            if (autoNeedsUpdate) { // Only check one, apply to both auto and semi-auto
                addToast("Đã tự động áp dụng các thiết lập phù hợp cho môn Ngữ văn.");
                
                const updateForNguVan = (config: any) => ({
                    ...config,
                    matrixType: 'm3' as const,
                    distTn: '0',
                    distTl: '100',
                    cauHoiTracNghiem: { ...(config.cauHoiTracNghiem || {}), cau: "0" },
                    cauHoiDungSai: { ...(config.cauHoiDungSai || {}), cau: "0" },
                    cauHoiTraLoiNgan: { ...(config.cauHoiTraLoiNgan || {}), cau: "0" },
                    cauHoiTuLuan: { ...(config.cauHoiTuLuan || {}), cau: "1", diem: "10.0" }
                });

                return { 
                    ...prev, 
                    auto: updateForNguVan(prev.auto),
                    semiAuto: updateForNguVan(prev.semiAuto)
                };
            }
            return prev;
        });
    } else {
        setExamSettings(prev => {
            if (prev.auto.matrixType === 'm3') { // This implies it was Ngữ Văn before, check one is enough
                addToast("Môn học thay đổi, đã chuyển về thiết lập mặc định.");
                
                const updateForGeneric = (config: any) => ({
                    ...config,
                    matrixType: 'm2' as const,
                    distTn: '70',
                    distTl: '30',
                    cauHoiTracNghiem: { cau: "12", diem: "0.25" },
                    cauHoiDungSai: { cau: "2", diem: "1.00" },
                    cauHoiTraLoiNgan: { cau: "4", diem: "0.5" },
                    cauHoiTuLuan: { cau: "3", diem: "3.0 (Tổng điểm)" },
                });

                return { 
                    ...prev, 
                    auto: updateForGeneric(prev.auto),
                    semiAuto: updateForGeneric(prev.semiAuto)
                };
            }
            return prev;
        });
    }
  }, [settings.subject, setExamSettings, addToast]);


  const allProfessionalGroups = useMemo(() => {
    const allGroups = Object.values(PROFESSIONAL_GROUPS).flat();
    return [...new Set(allGroups)].sort((a, b) => a.localeCompare(b, 'vi'));
  }, []);

  const handleTabChange = (newTab: string) => {
    // Prevent moving from unitInfo to examInfo if unitInfo is incomplete
    if (activeTab === 'unitInfo' && newTab === 'examInfo') {
        const requiredFields: { key: keyof AppSettings, name: string, id: string }[] = [
            { key: 'year', name: t('generalSettings.year'), id: 'year' },
            { key: 'province', name: t('generalSettings.province'), id: 'province' },
            { key: 'school', name: t('generalSettings.school'), id: 'school' },
            { key: 'profGroup', name: t('generalSettings.profGroup'), id: 'prof-group' },
            { key: 'signer', name: t('generalSettings.signer'), id: 'signer' },
            { key: 'signPlace', name: t('generalSettings.signPlace'), id: 'sign-place' },
            { key: 'groupLeader', name: t('generalSettings.groupLeader'), id: 'group-leader' },
            { key: 'teacher', name: t('generalSettings.teacher'), id: 'teacher' },
        ];

        for (const field of requiredFields) {
            if (!settings[field.key] || String(settings[field.key]).trim() === '') {
                addToast(t('generalSettings.toast.fillAllInfo', 'Vui lòng điền đầy đủ thông tin: {fieldName}.', { fieldName: field.name }));
                const el = document.getElementById(field.id);
                if (el) {
                    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                        (el as HTMLInputElement).focus();
                    } else {
                        // For custom components like SelectWithOther, find the first focusable child
                        const focusable = el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                        if (focusable) (focusable as HTMLElement).focus();
                    }
                }
                return; // Block the tab change
            }
        }
    }
    setActiveTab(newTab);
  };

  const handleInputChange = (field: keyof AppSettings, value: string) => {
    if (field === 'duration') {
      if (value === '' || /^\d+$/.test(value)) {
        const numValue = Number(value);
        if (value !== '' && (numValue < 1 || numValue > 180)) {
          setDurationError('Thời gian hợp lệ là từ 1 đến 180 phút.');
        } else {
          setDurationError(null);
        }
        saveSettings({ ...settings, [field]: value });
      }
    } else if (field === 'scale') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        saveSettings({ ...settings, [field]: value });
      }
    } else {
      saveSettings({ ...settings, [field]: value });
    }
  };
  
  const handlePositiveNumberBlur = (field: 'scale') => {
    const value = settings[field];
    if (value && Number(value) <= 0) {
      saveSettings({ ...settings, [field]: '' });
    }
  };
  
  const handleSuggestionClick = (field: keyof AppSettings, value: string) => {
    handleInputChange(field, value);
  };

  const handleProvinceChange = (value: string) => {
    saveSettings({ ...settings, province: value, school: '', signPlace: value });
  };
  
  const handleSchoolChange = (value: string) => {
    const match = value.match(/(Sa Thầy|Kon Tum|Bình Sơn|Mộ Đức|Đức Phổ|Ba Tơ|Trà Bồng|Nghĩa Hành|Tư Nghĩa|Lý Sơn|Minh Long|Tây Trà|Quảng Ngãi|Đăk Hà|Đăk Tô|Đăk Glei|Kon Rẫy|Kon Plông)/i);
    const newSignPlace = match ? match[0] : (settings.province || "");
    saveSettings({ ...settings, school: value, signPlace: newSignPlace });
  };

  const handleSchoolLevelChange = (value: keyof typeof SCHOOL_LEVELS_CONFIG | "") => {
    saveSettings({ ...settings, schoolLevel: value, grade: '', subject: '', textbook: '' });
  };

  const handleGradeChange = (value: string) => {
    saveSettings({ ...settings, grade: value, subject: '', textbook: '' });
  };

  const handleSubjectChange = (value: string) => {
     saveSettings({ ...settings, subject: value, textbook: '' });
  };

  const schools = SCHOOLS_BY_PROVINCE[settings.province] || [];
  const grades = settings.schoolLevel ? SCHOOL_LEVELS_CONFIG[settings.schoolLevel as keyof typeof SCHOOL_LEVELS_CONFIG].grades : [];
  const subjects = settings.schoolLevel ? SCHOOL_LEVELS_CONFIG[settings.schoolLevel as keyof typeof SCHOOL_LEVELS_CONFIG].subjects : [];
  const textbooks = settings.subject === "Tiếng Anh" ? TEXTBOOKS["Tiếng Anh"] : TEXTBOOKS["Default"];

  return (
    <Card className="w-full shadow-lg border-none bg-white dark:bg-slate-900">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('generalSettings.title')}</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 opacity-0 animate-fade-in-delayed">
                  <style>{`
                  @keyframes fade-in-delayed {
                      0% { opacity: 0; }
                      50% { opacity: 0; }
                      100% { opacity: 1; }
                  }
                  .animate-fade-in-delayed { animation: fade-in-delayed 1.5s ease-out forwards; }
                  `}</style>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t('generalSettings.autoSaveNotification')}</span>
              </div>
               <Button variant="ghost" size="sm" onClick={resetSettings} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50" title={t('generalSettings.deleteButton')}>
                <XCircle className="w-4 h-4 mr-1" />
                {t('generalSettings.deleteButton')}
              </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="unitInfo">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-6">
            <TabsTrigger value="unitInfo">{t('generalSettings.tabUnitInfo')}</TabsTrigger>
            <TabsTrigger value="examInfo">{t('generalSettings.tabExamInfo')}</TabsTrigger>
          </TabsList>

          <TabsContent value="unitInfo" className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label htmlFor="year" className="flex items-center gap-2"><History size={16} className="text-purple-500"/>{t('generalSettings.year')}</Label><Input id="year" value={settings.year} onChange={(e) => handleInputChange('year', e.target.value)} placeholder={t('generalSettings.yearPlaceholder')} /></div>
                <div className="space-y-1.5"><Label htmlFor="province" className="flex items-center gap-2"><FileText size={16} className="text-indigo-500"/>{t('generalSettings.province')}</Label>
                  <SelectWithOther
                    id="province"
                    value={settings.province}
                    onValueChange={handleProvinceChange}
                    options={PROVINCES}
                    placeholder={t('generalSettings.provincePlaceholder')}
                  />
                </div>
                <div className="space-y-1.5"><Label htmlFor="school" className="flex items-center gap-2"><BookOpen size={16} className="text-blue-500"/>{t('generalSettings.school')}</Label>
                   <SelectWithOther
                    id="school"
                    value={settings.school}
                    onValueChange={handleSchoolChange}
                    options={schools}
                    placeholder={t('generalSettings.schoolPlaceholder')}
                    disabled={!settings.province}
                  />
                </div>
                <div className="space-y-1.5"><Label htmlFor="prof-group" className="flex items-center gap-2"><Users size={16} className="text-green-500"/>{t('generalSettings.profGroup')}</Label>
                   <SelectWithOther
                    id="prof-group"
                    value={settings.profGroup}
                    onValueChange={(v) => handleInputChange('profGroup', v)}
                    options={allProfessionalGroups}
                    placeholder={t('generalSettings.profGroupPlaceholder')}
                  />
                </div>
                <div className="space-y-1.5"><Label htmlFor="signer" className="flex items-center gap-2"><UserIcon size={16} className="text-teal-500"/>{t('generalSettings.signer')}</Label><Input id="signer" value={settings.signer} onChange={(e) => handleInputChange('signer', e.target.value)} placeholder={t('generalSettings.signerPlaceholder')} /></div>
                <div className="space-y-1.5"><Label htmlFor="sign-place" className="flex items-center gap-2"><FileText size={16} className="text-orange-500"/>{t('generalSettings.signPlace')}</Label><Input id="sign-place" value={settings.signPlace} onChange={(e) => handleInputChange('signPlace', e.target.value)} placeholder={t('generalSettings.signPlacePlaceholder')} /></div>
                <div className="space-y-1.5"><Label htmlFor="group-leader" className="flex items-center gap-2"><UserIcon size={16} className="text-pink-500"/>{t('generalSettings.groupLeader')}</Label><Input id="group-leader" value={settings.groupLeader} onChange={(e) => handleInputChange('groupLeader', e.target.value)} placeholder={t('generalSettings.groupLeaderPlaceholder')} /></div>
                <div className="space-y-1.5"><Label htmlFor="teacher" className="flex items-center gap-2"><UserIcon size={16} className="text-rose-500"/>{t('generalSettings.teacher')}</Label><Input id="teacher" value={settings.teacher} onChange={(e) => handleInputChange('teacher', e.target.value)} placeholder={t('generalSettings.teacherPlaceholder')} /></div>
             </div>
          </TabsContent>

          <TabsContent value="examInfo" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label htmlFor="level" className="flex items-center gap-2"><BarChart2 size={16} className="text-cyan-500"/>{t('generalSettings.schoolLevel')}</Label>
                <Select onValueChange={(v) => handleSchoolLevelChange(v as keyof typeof SCHOOL_LEVELS_CONFIG)} value={settings.schoolLevel}>
                  <SelectTrigger id="level"><SelectValue placeholder={t('generalSettings.schoolLevelPlaceholder')} /></SelectTrigger>
                  <SelectContent>{Object.keys(SCHOOL_LEVELS_CONFIG).map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label htmlFor="grade" className="flex items-center gap-2"><FileText size={16} className="text-blue-500"/>{t('generalSettings.grade')}</Label>
                <Select onValueChange={handleGradeChange} value={settings.grade} disabled={!settings.schoolLevel}>
                  <SelectTrigger id="grade"><SelectValue placeholder={t('generalSettings.gradePlaceholder')} /></SelectTrigger>
                  <SelectContent>{grades.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label htmlFor="subject" className="flex items-center gap-2"><BookOpen size={16} className="text-green-500"/>{t('generalSettings.subject')}</Label>
                <SelectWithOther
                  id="subject"
                  value={settings.subject}
                  onValueChange={handleSubjectChange}
                  options={subjects}
                  placeholder={t('generalSettings.subjectPlaceholder')}
                  disabled={!settings.grade}
                />
              </div>
              <div className="space-y-1.5"><Label htmlFor="textbook" className="flex items-center gap-2"><BookOpen size={16} className="text-indigo-500"/>{t('generalSettings.textbook')}</Label>
                 <SelectWithOther
                    id="textbook"
                    value={settings.textbook}
                    onValueChange={(v) => handleInputChange('textbook', v)}
                    options={textbooks}
                    placeholder={t('generalSettings.textbookPlaceholder')}
                    disabled={!settings.subject}
                  />
              </div>
              <div className="space-y-1.5"><Label htmlFor="exam-type" className="flex items-center gap-2"><TypeIcon size={16} className="text-purple-500"/>{t('generalSettings.examType')}</Label>
                 <SelectWithOther
                    id="exam-type"
                    value={settings.examType}
                    onValueChange={(v) => handleInputChange('examType', v)}
                    options={EXAM_TYPES}
                    placeholder={t('generalSettings.examTypePlaceholder')}
                  />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="duration" className="flex items-center gap-2"><History size={16} className="text-orange-500"/>{t('generalSettings.duration')}</Label>
                <Input id="duration" value={settings.duration} onChange={(e) => handleInputChange('duration', e.target.value)} placeholder={t('generalSettings.durationPlaceholder')} type="text" inputMode="numeric" />
                {durationError ? (
                  <p className="text-xs text-red-500 pt-1">{durationError}</p>
                ) : (
                  <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>{t('generalSettings.durationSuggestion')}</span>
                    {[15, 45, 60, 90, 120].map(time => (
                      <button
                          key={time}
                          type="button"
                          onClick={() => handleSuggestionClick('duration', String(time))}
                          className="ml-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                          {time} {t('generalSettings.durationMinutes')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1.5"><Label htmlFor="scale" className="flex items-center gap-2"><BarChart2 size={16} className="text-pink-500"/>{t('generalSettings.scale')}</Label><Input id="scale" value={settings.scale} onChange={(e) => handleInputChange('scale', e.target.value)} onBlur={() => handlePositiveNumberBlur('scale')} placeholder={t('generalSettings.scalePlaceholder')} type="number" min="0.1" step="0.1" /></div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GeneralSettingsWorkspace;