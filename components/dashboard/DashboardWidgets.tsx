import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Sparkles, BarChart2, Database, History, ChevronRight, FileText, Brain } from '../icons';
import AISuggestionModal from '../ai/AISuggestionModal';
import { useI18n } from '../../hooks/useI18n';

// A reusable container for dashboard widgets to ensure consistent styling
const Widget: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; tKey: string }> = ({ icon, title, children, tKey }) => {
  const { t } = useI18n();
  return (
    <Card className="shadow-lg border-none bg-white dark:bg-slate-900 flex flex-col transform hover:-translate-y-1 transition-transform duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{t(tKey as any, title)}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="flex-grow">
        {children}
      </CardContent>
    </Card>
  );
};


export const QuestionBankWidget: React.FC = () => (
  <Widget icon={<Database className="h-4 w-4 text-gray-500 dark:text-gray-400" />} title="Ngân hàng câu hỏi" tKey="dashboard.questionBank">
    <div className="text-2xl font-bold">1,250</div>
    <p className="text-xs text-green-600 dark:text-green-400">+20 câu mới trong tuần này</p>
  </Widget>
);

export const MatrixAnalysisWidget: React.FC = () => (
  <Widget icon={<BarChart2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />} title="Phân tích ma trận" tKey="dashboard.matrixAnalysis">
    <div className="text-2xl font-bold">32</div>
    <p className="text-xs text-gray-500 dark:text-gray-400">Ma trận đã được tạo</p>
  </Widget>
);

export const RecentActivityWidget: React.FC = () => {
    const { t } = useI18n();
    return (
        <Card className="shadow-lg border-none bg-white dark:bg-slate-900 transform hover:-translate-y-1 transition-transform duration-300">
            <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
                <History className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                {t('dashboard.recentActivity', 'Đề gần đây')}
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="text-sm font-medium">Đề GK I - Hóa 10</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Trộn 4 mã đề - 5 phút trước</p>
            </CardContent>
        </Card>
    );
};

export const ExamsGeneratedWidget: React.FC = () => (
  <Widget icon={<FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />} title="Đề đã tạo" tKey="dashboard.examsGenerated">
    <div className="text-2xl font-bold">78</div>
    <p className="text-xs text-gray-500 dark:text-gray-400">+5 trong tháng này</p>
  </Widget>
);

export const AiUsageWidget: React.FC = () => (
  <Widget icon={<Brain className="h-4 w-4 text-gray-500 dark:text-gray-400" />} title="AI Token đã dùng" tKey="dashboard.aiUsage">
    <div className="text-2xl font-bold">123,456</div>
    <p className="text-xs text-gray-500 dark:text-gray-400">Trong 30 ngày qua</p>
  </Widget>
);

export const AiSuggestionsWidget: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useI18n();
  return (
    <>
      <AISuggestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Card className="shadow-lg border-none bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles /> {t('dashboard.aiSuggestions', 'Gợi ý từ AI')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">AI đã phân tích và có một vài đề xuất để tối ưu hóa công việc của bạn.</p>
        </CardContent>
        <div className="p-4 pt-0">
          <Button onClick={() => setIsModalOpen(true)} className="w-full bg-white/20 hover:bg-white/30 text-white flex items-center gap-2 justify-center">
            {t('dashboard.viewSuggestions', 'Xem gợi ý')} <ChevronRight className="w-4 h-4"/>
          </Button>
        </div>
      </Card>
    </>
  );
};