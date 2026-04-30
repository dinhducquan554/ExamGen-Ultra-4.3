import React from 'react';
import { ValidationReport, TopicDetails, QuestionDistribution, ValidationReportTopic } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { AppSettings } from '../../contexts/SettingsContext';
import { ExamHeader } from '../exam/ExamHeader';

interface StructureReportProps {
    report?: ValidationReport;
    topics?: TopicDetails[];
    settings: AppSettings;
}

const ReportCell: React.FC<{ expected: number; actual: number }> = ({ expected, actual }) => {
    const isMatch = expected === actual;
    return (
        <TableCell className={`text-center tabular-nums font-medium ${isMatch ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
             {actual} / {expected}
        </TableCell>
    );
};

const StructureReport: React.FC<StructureReportProps> = ({ report, topics, settings }) => {
    if (!report || !topics || !settings) {
        return <div className="p-4 text-center">Chưa có báo cáo cấu trúc. Vui lòng tạo đề trước.</div>;
    }
    
    const topicDetailsMap: Map<string, TopicDetails> = new Map(topics.map(t => [t.id, t]));

    // Helper function to aggregate stats for a single topic across all question types
    const getAggregatedTopicStats = (topicReport: ValidationReportTopic) => {
        const stats = {
            biet: { expected: 0, actual: 0 },
            hieu: { expected: 0, actual: 0 },
            vd: { expected: 0, actual: 0 },
            vdc: { expected: 0, actual: 0 } // VDC hiện tại chưa được hỗ trợ trong cấu trúc dữ liệu chính, để 0/0
        };

        const questionTypes: (keyof Omit<ValidationReportTopic, 'topicName'>)[] = ['multipleChoice', 'trueFalse', 'shortAnswer', 'essay'];
        
        questionTypes.forEach(qType => {
            const typeStats = topicReport[qType];
            if (typeStats) {
                stats.biet.expected += typeStats.biet?.expected || 0;
                stats.biet.actual += typeStats.biet?.actual || 0;
                
                stats.hieu.expected += typeStats.hieu?.expected || 0;
                stats.hieu.actual += typeStats.hieu?.actual || 0;
                
                stats.vd.expected += typeStats.vd?.expected || 0;
                stats.vd.actual += typeStats.vd?.actual || 0;
                
                // Lưu ý: Cấu trúc dữ liệu hiện tại (ValidationStats) chưa có trường 'vdc' riêng biệt
                // nên tạm thời VDC sẽ luôn là 0/0 trừ khi cập nhật type definition.
            }
        });

        return stats;
    };

    // Calculate Grand Totals
    const grandTotal = {
        biet: { expected: 0, actual: 0 },
        hieu: { expected: 0, actual: 0 },
        vd: { expected: 0, actual: 0 },
        vdc: { expected: 0, actual: 0 }
    };

    const aggregatedRows = (Object.entries(report) as [string, ValidationReportTopic][]).map(([topicId, topicReport]) => {
        const stats = getAggregatedTopicStats(topicReport);
        
        grandTotal.biet.expected += stats.biet.expected;
        grandTotal.biet.actual += stats.biet.actual;
        grandTotal.hieu.expected += stats.hieu.expected;
        grandTotal.hieu.actual += stats.hieu.actual;
        grandTotal.vd.expected += stats.vd.expected;
        grandTotal.vd.actual += stats.vd.actual;
        grandTotal.vdc.expected += stats.vdc.expected;
        grandTotal.vdc.actual += stats.vdc.actual;

        return {
            topicId,
            topicName: topicReport.topicName,
            unit: topicDetailsMap.get(topicId)?.unit || '',
            stats
        };
    });

    const today = new Date();
    const dateString = `ngày ${String(today.getDate()).padStart(2, '0')} tháng ${String(today.getMonth() + 1).padStart(2, '0')} năm ${today.getFullYear()}`;

    return (
        <div className="p-8 text-slate-900 dark:text-slate-100" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
             <ExamHeader 
                province={settings.province.toUpperCase()}
                school={settings.school.toUpperCase()}
                group={settings.profGroup.toUpperCase()}
                year={settings.year}
                subject={settings.subject.toUpperCase()}
                grade={settings.grade}
                duration={parseInt(settings.duration) || 0}
                examType={settings.examType.toUpperCase() || "KIỂM TRA"}
            />
            
            <h3 className="text-center font-bold text-lg my-6 uppercase">Báo cáo đối chiếu cấu trúc đề thi</h3>
            
            <Table className="border border-black dark:border-slate-700 w-full text-center">
                <TableHeader>
                    <TableRow className="[&>th]:border [&>th]:border-black [&>th]:p-2 [&>th]:bg-slate-100 [&>th]:dark:bg-slate-800">
                        <TableHead rowSpan={2} className="align-middle text-center w-[20%] font-bold text-black dark:text-white">Chủ đề</TableHead>
                        <TableHead rowSpan={2} className="align-middle text-center w-[30%] font-bold text-black dark:text-white">Nội dung/Bài</TableHead>
                        <TableHead colSpan={4} className="text-center font-bold text-black dark:text-white">Số câu (Thực tế / Yêu cầu)</TableHead>
                    </TableRow>
                    <TableRow className="[&>th]:border [&>th]:border-black [&>th]:p-2 [&>th]:bg-slate-50 [&>th]:dark:bg-slate-800/50">
                        <TableHead className="text-center font-semibold text-black dark:text-white">NB – Nhận biết</TableHead>
                        <TableHead className="text-center font-semibold text-black dark:text-white">TH – Thông hiểu</TableHead>
                        <TableHead className="text-center font-semibold text-black dark:text-white">VD – Vận dụng</TableHead>
                        <TableHead className="text-center font-semibold text-black dark:text-white">VDC – Vận dụng cao</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {aggregatedRows.map((row) => (
                        <TableRow key={row.topicId} className="[&>td]:border [&>td]:border-black [&>td]:p-2">
                            <TableCell className="text-left font-semibold">{row.topicName}</TableCell>
                            <TableCell className="text-left">{row.unit}</TableCell>
                            <ReportCell expected={row.stats.biet.expected} actual={row.stats.biet.actual} />
                            <ReportCell expected={row.stats.hieu.expected} actual={row.stats.hieu.actual} />
                            <ReportCell expected={row.stats.vd.expected} actual={row.stats.vd.actual} />
                            <ReportCell expected={row.stats.vdc.expected} actual={row.stats.vdc.actual} />
                        </TableRow>
                    ))}
                    <TableRow className="font-bold bg-slate-100 dark:bg-slate-800 [&>td]:border [&>td]:border-black [&>td]:p-2">
                        <TableCell colSpan={2} className="text-center uppercase">Tổng</TableCell>
                        <ReportCell expected={grandTotal.biet.expected} actual={grandTotal.biet.actual} />
                        <ReportCell expected={grandTotal.hieu.expected} actual={grandTotal.hieu.actual} />
                        <ReportCell expected={grandTotal.vd.expected} actual={grandTotal.vd.actual} />
                        <ReportCell expected={grandTotal.vdc.expected} actual={grandTotal.vdc.actual} />
                    </TableRow>
                </TableBody>
            </Table>
            
            <div className="flex justify-end italic mt-8">
                <p>{settings.signPlace}, {dateString}</p>
            </div>
            
            <div className="mt-8 grid grid-cols-2 text-center font-bold">
                <div>
                    <p className="uppercase">Người lập bảng</p>
                    <div className="h-24"></div>
                    <p>{settings.teacher}</p>
                </div>
                <div>
                    <p className="uppercase">Tổ trưởng chuyên môn</p>
                    <div className="h-24"></div>
                    <p>{settings.groupLeader}</p>
                </div>
            </div>
        </div>
    );
};

export default StructureReport;
