import React, { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { Button } from '../ui/Button';
import { Printer } from '../icons';
import { ExamHeader } from '../exam/ExamHeader';
import { ExamFooter } from '../exam/ExamFooter';
import { NguVanMatrix } from '../exam/NguVanMatrix';
import { NguVanSpec } from '../exam/NguVanSpec';
import { Cv7991Matrix } from '../exam/Cv7991Matrix';
import { Cv7991Spec } from '../exam/Cv7991Spec';
import { GeneratedExamData, MixedExam, QuestionDistribution, TopicDetails } from '../../types';
import { useSettings } from '../../hooks/useSettings';
import { useAdvancedSettings } from '../../hooks/useAdvancedSettings';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/Select';
import StructureReport from './StructureReport';
import { useExamCreation } from '../../hooks/useExamCreation';
import { useI18n } from '../../hooks/useI18n';


const DocumentPreview: React.FC<{
  examType: string;
  content: React.ReactNode;
  showCode?: string;
  docType: string;
  questionCount?: number;
}> = ({ examType, content, showCode, docType, questionCount: propQuestionCount }) => {
    const { settings } = useSettings();
    const { advSettings } = useAdvancedSettings();

    const questionCount = propQuestionCount;

    const previewStyle: React.CSSProperties = {
        fontFamily: {
            'times': '"Times New Roman", Times, serif',
            'arial': 'Arial, Helvetica, sans-serif',
            'calibri': 'Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif'
        }[advSettings.editorFontFamily] || '"Times New Roman", Times, serif',
        lineHeight: advSettings.editorLineSpacing
    };


    return (
        <div 
            className="border rounded-lg bg-white dark:bg-slate-950 shadow-sm h-[65vh] overflow-auto p-8 text-slate-900 dark:text-slate-100 text-[13pt]"
            style={previewStyle}
            data-doc-type={docType}
        >
            <div className="min-h-full flex flex-col justify-between">
                <div>
                    <ExamHeader
                        province={settings.province.toUpperCase()}
                        school={settings.school.toUpperCase()}
                        group={settings.profGroup.toUpperCase()}
                        year={settings.year}
                        subject={settings.subject.toUpperCase()}
                        grade={settings.grade}
                        duration={parseInt(settings.duration) || 0}
                        questionCount={questionCount}
                        examType={settings.examType.toUpperCase() || examType}
                    />
                    
                    {showCode && (
                        <div className="text-center font-bold text-lg my-4 p-1 w-full max-w-xs mx-auto" style={{ border: '1px solid black' }}>
                            MÃ ĐỀ THI: {showCode}
                        </div>
                    )}

                    <div className="mt-6">
                        {typeof content === 'string' ? (
                             <div className="whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-full" dangerouslySetInnerHTML={{ __html: content }} />
                        ) : (
                            content
                        )}
                    </div>
                </div>
                
                <div className="mt-auto pt-8">
                  <ExamFooter
                      place={settings.signPlace}
                      vicePrincipalName={settings.signer}
                      groupLeaderName={settings.groupLeader}
                      creatorName={settings.teacher}
                  />
                </div>
            </div>
        </div>
    );
};

const PlaceholderContent: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
    <div className="text-center p-10 text-slate-500 dark:text-slate-400 h-full flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p>{subtitle || 'Chưa có dữ liệu. Vui lòng tạo đề ở tab "Thiết lập cấu trúc đề thi" trước.'}</p>
    </div>
);


export default function ResultsWorkspace({ examData, setExamData, outlineData, mixedExamData }: { examData: GeneratedExamData | null, setExamData: (data: GeneratedExamData | null) => void, outlineData: string | null, mixedExamData: MixedExam[] | null }) {
  const { settings } = useSettings();
  const { examSettings } = useExamCreation();
  const { t } = useI18n();
  const selectedSubject = settings.subject;
  const [selectedMixedCode, setSelectedMixedCode] = useState<string | null>(null);

  const totalQuestionsFromExamData = useMemo(() => {
    return examData?.questions?.length;
  }, [examData]);

  const totalQuestionsForOutline = useMemo(() => {
      if (!examData?.questions || !examSettings.outlineQuestionCountMultiplier) return undefined;
      const multiplier = parseFloat(examSettings.outlineQuestionCountMultiplier);
      if (isNaN(multiplier)) return undefined;
      return Math.round((examData.questions.length || 0) * multiplier);
  }, [examData?.questions, examSettings.outlineQuestionCountMultiplier]);

  const totalQuestionsFromSettings = useMemo(() => {
    const { creationMethod, auto, semiAuto, manual } = examSettings;

    if (settings.subject === 'Ngữ văn') {
        if (creationMethod === 'auto' || creationMethod === 'semiAuto') {
            const config = examSettings[creationMethod];
            return (parseInt(config.nguVanTuDongDocHieuPart.soCau, 10) || 0) + (parseInt(config.nguVanTuDongVietPart.soCau, 10) || 0);
        }
        if (creationMethod === 'manual') {
            return manual.nguVanDocHieuPart.questions.length + manual.nguVanVietPart.questions.length;
        }
    }

    if (examData?.topics && examData.topics.length > 0) {
        return examData.topics.reduce((total, topic) => {
            let topicTotal = 0;
            const qTypes: (keyof TopicDetails)[] = ['multipleChoice', 'trueFalse', 'shortAnswer', 'essay'];
            qTypes.forEach(qType => {
                const dist = topic[qType] as QuestionDistribution | undefined;
                if (dist) {
                    topicTotal += (dist.biet || 0) + (dist.hieu || 0) + (dist.vd || 0);
                }
            });
            return total + topicTotal;
        }, 0);
    }
    
    // Fallback to exam settings if topics are not available for generic subjects
    const config = (creationMethod === 'auto' || creationMethod === 'semiAuto') ? examSettings[creationMethod] : auto;
    const { cauHoiTracNghiem, cauHoiDungSai, cauHoiTraLoiNgan, cauHoiTuLuan } = config;
    return (parseInt(cauHoiTracNghiem.cau, 10) || 0) +
           (parseInt(cauHoiDungSai.cau, 10) || 0) +
           (parseInt(cauHoiTraLoiNgan.cau, 10) || 0) +
           (parseInt(cauHoiTuLuan.cau, 10) || 0);
  }, [examData?.topics, examSettings, settings.subject]);

  React.useEffect(() => {
    if (mixedExamData && mixedExamData.length > 0) {
      setSelectedMixedCode(mixedExamData[0].code);
    } else {
      setSelectedMixedCode(null);
    }
  }, [mixedExamData]);

  const selectedMixedExam = useMemo(() => {
    if (!mixedExamData || !selectedMixedCode) return null;
    return mixedExamData.find(e => e.code === selectedMixedCode) || null;
  }, [mixedExamData, selectedMixedCode]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
          {t('results.title')}
        </h2>
        <div className="flex items-center gap-2">
            {mixedExamData && (
                <div className="w-40">
                    <Select onValueChange={setSelectedMixedCode} value={selectedMixedCode || ''}>
                        <SelectTrigger><SelectValue placeholder={t('results.selectMixedCodePlaceholder')} /></SelectTrigger>
                        <SelectContent>
                            {mixedExamData.map(exam => (
                                <SelectItem key={exam.code} value={exam.code}>{t('results.mixedExamCode', 'Mã đề {code}', { code: exam.code })}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            <Button onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                {t('results.printAllButton')}
            </Button>
        </div>
      </div>

       <Tabs defaultValue="main-exam">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-4 lg:grid-cols-8 mb-4">
          <TabsTrigger value="matrix">{t('results.tabMatrix')}</TabsTrigger>
          <TabsTrigger value="spec">{t('results.tabSpec')}</TabsTrigger>
          <TabsTrigger value="structure-report">{t('results.tabStructureReport')}</TabsTrigger>
          <TabsTrigger value="main-exam">{t('results.tabMainExam')}</TabsTrigger>
          <TabsTrigger value="main-answers">{t('results.tabMainAnswers')}</TabsTrigger>
          <TabsTrigger value="mixed-exam">{t('results.tabMixedExam')}</TabsTrigger>
          <TabsTrigger value="mixed-answers">{t('results.tabMixedAnswers')}</TabsTrigger>
          <TabsTrigger value="outline">{t('results.tabOutline')}</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
            {selectedSubject === 'Ngữ văn' ? (
                <DocumentPreview docType="MaTrận" examType="MA TRẬN ĐỀ KIỂM TRA MÔN NGỮ VĂN" content={<NguVanMatrix examSettings={examSettings} />} questionCount={totalQuestionsFromSettings} />
            ) : (
                <DocumentPreview docType="MaTrận" examType="MA TRẬN ĐỀ KIỂM TRA ĐỊNH KÌ" content={<Cv7991Matrix data={examData} examSettings={examSettings} generalSettings={settings} />} questionCount={totalQuestionsFromSettings} />
            )}
        </TabsContent>
        <TabsContent value="spec">
            {selectedSubject === 'Ngữ văn' ? (
                 <DocumentPreview docType="BảngĐặcTả" examType="BẢN ĐẶC TẢ KĨ THUẬT ĐỀ KIỂM TRA NGỮ VĂN" content={<NguVanSpec examSettings={examSettings} />} questionCount={totalQuestionsFromSettings} />
            ) : (
                <DocumentPreview docType="BảngĐặcTả" examType="BẢNG ĐẶC TẢ ĐỀ KIỂM TRA ĐỊNH KÌ" content={<Cv7991Spec data={examData} examSettings={examSettings} generalSettings={settings} />} questionCount={totalQuestionsFromSettings} />
            )}
        </TabsContent>
        <TabsContent value="structure-report">
          <div 
            className="border rounded-lg bg-white dark:bg-slate-950 shadow-sm h-[65vh] overflow-auto"
            data-doc-type="BaoCaoDoiChieu"
          >
            <StructureReport 
              report={examData?.validationReport} 
              topics={examData?.topics}
              settings={settings}
            />
          </div>
        </TabsContent>
        <TabsContent value="main-exam">
           {examData?.examContent ? (
                <DocumentPreview docType="ĐềChính" examType={settings.examType.toUpperCase() || "ĐỀ KIỂM TRA"} content={examData.examContent} questionCount={totalQuestionsFromExamData} />
            ) : (
                <DocumentPreview docType="ĐềChính" examType={settings.examType.toUpperCase() || "ĐỀ KIỂM TRA"} content={<PlaceholderContent title={t('results.placeholderTitle')} subtitle={t('results.placeholderSubtitle')} />} />
            )}
        </TabsContent>
        <TabsContent value="main-answers">
            {examData?.answerContent ? (
                <DocumentPreview docType="ĐápÁn_ĐềChính" examType={`ĐÁP ÁN ${settings.examType.toUpperCase()}` || "ĐÁP ÁN ĐỀ KIỂM TRA"} content={examData.answerContent} questionCount={totalQuestionsFromExamData} />
            ) : (
                <DocumentPreview docType="ĐápÁn_ĐềChính" examType={`ĐÁP ÁN ${settings.examType.toUpperCase()}` || "ĐÁP ÁN ĐỀ KIỂM TRA"} content={<PlaceholderContent title={t('results.placeholderTitle')} subtitle={t('results.placeholderSubtitle')} />} />
            )}
        </TabsContent>
        <TabsContent value="mixed-exam">
            {selectedMixedExam ? (
                <DocumentPreview docType={`ĐềTrộn_Mã${selectedMixedExam.code}`} examType={settings.examType.toUpperCase() || "ĐỀ KIỂM TRA"} showCode={selectedMixedExam.code} content={selectedMixedExam.examContent} questionCount={totalQuestionsFromExamData} />
            ) : (
                <DocumentPreview docType="ĐềTrộn" examType="ĐỀ KIỂM TRA" content={<PlaceholderContent title={t('results.placeholderMixedTitle')} subtitle={t('results.placeholderMixedSubtitle')} />} />
            )}
        </TabsContent>
        <TabsContent value="mixed-answers">
            {selectedMixedExam ? (
                <DocumentPreview docType={`ĐápÁn_ĐềTrộn_Mã${selectedMixedExam.code}`} examType={`ĐÁP ÁN ${settings.examType.toUpperCase()}` || "ĐÁP ÁN ĐỀ KIỂM TRA"} showCode={selectedMixedExam.code} content={selectedMixedExam.answerContent} questionCount={totalQuestionsFromExamData} />
            ) : (
                <DocumentPreview docType="ĐápÁn_ĐềTrộn" examType="ĐÁP ÁN ĐỀ KIỂM TRA" content={<PlaceholderContent title={t('results.placeholderMixedTitle')} subtitle={t('results.placeholderMixedSubtitle')} />} />
            )}
        </TabsContent>
        <TabsContent value="outline">
            {outlineData ? (
                 <DocumentPreview docType="ĐềCươngÔnTập" examType="ĐỀ CƯƠNG ÔN TẬP" content={outlineData} questionCount={totalQuestionsForOutline} />
            ) : (
                 <DocumentPreview docType="ĐềCươngÔnTập" examType="ĐỀ CƯƠNG ÔN TẬP" content={<PlaceholderContent title={t('results.placeholderOutlineTitle')} subtitle={t('results.placeholderOutlineSubtitle')} />} />
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}