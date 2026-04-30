import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { History, Info, BookOpen, BarChart2 } from '../icons';
import { 
    QuestionBankWidget, 
    MatrixAnalysisWidget, 
    RecentActivityWidget, 
    AiSuggestionsWidget,
    ExamsGeneratedWidget,
    AiUsageWidget
} from './DashboardWidgets';
import { useI18n } from '../../hooks/useI18n';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import RealtimeSettingsDashboard from './RealtimeSettingsDashboard';

// Mock data for the new chart
const monthlyActivityData = [
  { month: 'T1', exams: 4 },
  { month: 'T2', exams: 3 },
  { month: 'T3', exams: 8 },
  { month: 'T4', exams: 5 },
  { month: 'T5', exams: 9 },
  { month: 'T6', exams: 12 },
  { month: 'T7', exams: 15 },
  { month: 'T8', exams: 11 },
  { month: 'T9', exams: 13 },
  { month: 'T10', exams: 10 },
  { month: 'T11', exams: 14 },
  { month: 'T12', exams: 18 },
];

const MonthlyActivityChart = () => (
    <Card className="shadow-lg border-none bg-white dark:bg-slate-900">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart2 /> Hoạt động tạo đề hàng tháng</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyActivityData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} className="dark:stroke-slate-700" />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                        cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.75rem',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#334155' }}
                    />
                    <Bar dataKey="exams" name="Số đề" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
);

export default function Dashboard() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {t('dashboard.title', 'Bảng điều khiển')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
                Tổng quan nhanh về hoạt động và dữ liệu hệ thống của bạn.
            </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 flex-shrink-0 pt-1">
           <History className="w-4 h-4" />
           <span>{t('dashboard.lastUpdated', 'Cập nhật: Vài giây trước')}</span>
        </div>
      </div>

      {/* Developer Info Box - refined */}
      <div className="p-4 border-l-4 border-indigo-400 bg-indigo-50 dark:bg-slate-800/50 rounded-r-lg">
        <div className="text-sm text-slate-800 dark:text-slate-200">
          <p><strong>Nhà phát triển:</strong> Đinh Đức Quân. <strong>Zalo:</strong> 0905247585.</p>
          <p className="mt-1">
            <strong>Youtube:</strong> <a href="https://youtube.com/@dinhducquan64?si=KV_yMK2VYHTBOUR-" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600 dark:hover:text-indigo-400">youtube.com/@dinhducquan64</a>
            <span className="mx-2">|</span>
            <strong>Facebook:</strong> <a href="https://www.facebook.com/quan.inh.264470" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600 dark:hover:text-indigo-400">facebook.com/quan.inh.264470</a>
          </p>
        </div>
      </div>
      
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuestionBankWidget />
        <MatrixAnalysisWidget />
        <ExamsGeneratedWidget />
        <AiUsageWidget />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
            <MonthlyActivityChart />
        </div>

        {/* Side Widgets Column */}
        <div className="lg:col-span-1 space-y-6">
            <RealtimeSettingsDashboard />
            <AiSuggestionsWidget />
            <RecentActivityWidget />
        </div>
      </div>
    </div>
  );
}