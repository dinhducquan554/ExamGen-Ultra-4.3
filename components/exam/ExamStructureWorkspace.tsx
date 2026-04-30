import React, { useMemo, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import {
    Upload, Plus, Trash2, Settings, Sparkles, FileUp, Edit, FileText, BarChart2,
    Sliders, Brain, Settings2, BookOpen, Info, FolderCog, Type as TypeIcon, CheckCircle2, Loader2, XCircle
} from '../icons';
import { useExamCreation } from '../../hooks/useExamCreation';
import { AutoSemiAutoConfig } from '../../contexts/ExamCreationContext';
import { useSettings } from '../../hooks/useSettings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Input } from '../ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { CauHoi, GeneratedExamData, ManualQuestionConfig, NguVanDocHieuQuestion, NguVanVietQuestion, Page, TopicDetails, ValidationReport } from '../../types';
import { Checkbox } from '../ui/Checkbox';
import { useI18n } from '../../hooks/useI18n';
import { GoogleGenAI, Type } from "@google/genai";
import { useToast } from '../../hooks/useToast';
import { useSystemInstruction } from '../../hooks/useSystemInstruction';

interface ExamStructureWorkspaceProps {
    setExamData: (data: any) => void;
    setCurrentPage: (page: Page) => void;
    updateTokenUsage: (count: number) => void;
}

const parseGeminiJson = (jsonString: string): any => {
    let cleanedString = jsonString.trim();

    // 1. Remove markdown backticks if they exist
    const match = cleanedString.match(/```(json)?\s*([\s\S]*?)\s*```/);
    if (match) {
        cleanedString = match[2].trim();
    }
    
    try {
        // First, try to parse as is
        return JSON.parse(cleanedString);
    } catch (e1) {
        console.warn("Direct JSON parsing failed, attempting to fix common issues.", e1);
        try {
            // Attempt to fix common issues like trailing commas, which are not valid in standard JSON
            const repairedString = cleanedString
                // Remove trailing commas from objects: { "a": 1, } -> { "a": 1 }
                .replace(/,\s*}/g, '}')
                // Remove trailing commas from arrays: [ 1, 2, ] -> [ 1, 2 ]
                .replace(/,\s*]/g, ']');
            
            return JSON.parse(repairedString);
        } catch (e2) {
            console.error("Failed to parse JSON even after attempting to fix common issues.", e2);
            // The original error is often more informative about the root cause (like an unterminated string)
            throw e1; 
        }
    }
};

const StructureConfig: React.FC<{ mode: 'auto' | 'semiAuto' }> = ({ mode }) => {
    const { examSettings, setExamSettings } = useExamCreation();
    const { settings } = useSettings();
    const { t } = useI18n();
    const isNguVan = settings.subject === 'Ngữ văn';
    const scale = parseFloat(settings.scale) || 10.0;
    const config = examSettings[mode];

    const handleMatrixChange = (value: 'm1' | 'm2' | 'm3' | 'm4') => {
        setExamSettings(prev => ({ ...prev, [mode]: { ...prev[mode], matrixType: value } }));
    };

    const handleInputChange = (field: keyof typeof config, value: string) => {
        setExamSettings(prev => ({ ...prev, [mode]: { ...prev[mode], [field]: value } }));
    };

    const handleQuestionStructureChange = (
        type: 'cauHoiTracNghiem' | 'cauHoiDungSai' | 'cauHoiTraLoiNgan' | 'cauHoiTuLuan',
        field: 'cau' | 'diem',
        value: string
    ) => {
        setExamSettings(prev => ({
            ...prev,
            [mode]: { ...prev[mode], [type]: { ...prev[mode][type], [field]: value } }
        }));
    };
    
    const handleNguVanPartChange = (
        part: 'nguVanTuDongDocHieuPart' | 'nguVanTuDongVietPart',
        field: 'soCau' | 'tongDiem',
        value: string
    ) => {
        setExamSettings(prev => ({
            ...prev,
            [mode]: {
                ...prev[mode],
                [part]: {
                    ...prev[mode][part],
                    [field]: value
                }
            }
        }));
    };

    const totalScore = useMemo(() => {
        const { cauHoiTracNghiem, cauHoiDungSai, cauHoiTraLoiNgan, cauHoiTuLuan } = config;
        const mc = (parseInt(cauHoiTracNghiem.cau) || 0) * (parseFloat(cauHoiTracNghiem.diem) || 0);
        const tf = (parseInt(cauHoiDungSai.cau) || 0) * (parseFloat(cauHoiDungSai.diem) || 0);
        const sa = (parseInt(cauHoiTraLoiNgan.cau) || 0) * (parseFloat(cauHoiTraLoiNgan.diem) || 0);
        const essayText = cauHoiTuLuan.diem || '0';
        const essay = parseFloat(essayText.match(/(\d+(\.\d+)?)/)?.[0] || '0');
        return (mc + tf + sa + essay).toFixed(2);
    }, [config]);

    const calculateTotal = (q: CauHoi) => ((parseInt(q.cau) || 0) * (parseFloat(q.diem) || 0)).toFixed(2);
    
    const nguVanTotalScore = useMemo(() => {
        const docHieu = parseFloat(config.nguVanTuDongDocHieuPart.tongDiem) || 0;
        const viet = parseFloat(config.nguVanTuDongVietPart.tongDiem) || 0;
        return (docHieu + viet).toFixed(2);
    }, [config.nguVanTuDongDocHieuPart, config.nguVanTuDongVietPart]);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><FileText size={20} className="text-indigo-500"/>Kiểu Ma trận & Đặc tả</CardTitle></CardHeader>
                <CardContent>
                    <Select value={config.matrixType} onValueChange={handleMatrixChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="m1">Ma trận & Bảng đặc tả Tiểu học</SelectItem>
                            <SelectItem value="m2">Ma trận & Bảng đặc tả theo CV 7991</SelectItem>
                            <SelectItem value="m3">Ma trận & Bảng đặc tả cho môn Ngữ văn</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="mt-2" size="sm">Thêm kiểu ma trận khác</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 size={20} className="text-purple-500"/>Phân bổ nhận thức</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="flex items-center gap-2"><Sliders size={16} className="text-indigo-500"/>Tỉ lệ % điểm cho Trắc nghiệm (TN)/Tự luận (TL)</Label>
                        <Input value={config.distTrinhLuan} onChange={e => handleInputChange('distTrinhLuan', e.target.value)} placeholder="Gợi ý: 70 : 30" />
                    </div>
                    <div>
                        <Label className="flex items-center gap-2 mb-2"><Brain size={16} className="text-teal-500"/>Tỉ lệ % điểm cho Mức độ nhận thức</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="distNhanBiet">Nhận biết (NB)</Label>
                                <Input id="distNhanBiet" value={config.distNhanBiet} onChange={e => handleInputChange('distNhanBiet', e.target.value)} placeholder="30" />
                            </div>
                            <div>
                                <Label htmlFor="distThongHieu">Thông hiểu (TH)</Label>
                                <Input id="distThongHieu" value={config.distThongHieu} onChange={e => handleInputChange('distThongHieu', e.target.value)} placeholder="40" />
                            </div>
                            <div>
                                <Label htmlFor="distVanDung">Vận dụng (VD)</Label>
                                <Input id="distVanDung" value={config.distVanDung} onChange={e => handleInputChange('distVanDung', e.target.value)} placeholder="30" />
                            </div>
                             <div>
                                <Label htmlFor="distVdCao">Vận dụng cao (VDC)</Label>
                                <Input id="distVdCao" value={config.distVdCao} onChange={e => handleInputChange('distVdCao', e.target.value)} placeholder="0" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Settings2 size={20} className="text-green-500"/>Cấu trúc câu hỏi</CardTitle></CardHeader>
                <CardContent>
                    {isNguVan ? (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">I. Phần đọc hiểu</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Số lượng câu hỏi</Label>
                                        <Input value={config.nguVanTuDongDocHieuPart.soCau} onChange={e => handleNguVanPartChange('nguVanTuDongDocHieuPart', 'soCau', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Tổng số điểm</Label>
                                        <Input value={config.nguVanTuDongDocHieuPart.tongDiem} onChange={e => handleNguVanPartChange('nguVanTuDongDocHieuPart', 'tongDiem', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                             <div>
                                <h4 className="font-semibold mb-2">II. Phần viết</h4>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <Label>Số lượng câu hỏi</Label>
                                        <Input value={config.nguVanTuDongVietPart.soCau} onChange={e => handleNguVanPartChange('nguVanTuDongVietPart', 'soCau', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Tổng số điểm</Label>
                                        <Input value={config.nguVanTuDongVietPart.tongDiem} onChange={e => handleNguVanPartChange('nguVanTuDongVietPart', 'tongDiem', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <div className="font-bold text-right mt-4">Tổng điểm toàn cấu trúc: {nguVanTotalScore}</div>
                            {parseFloat(nguVanTotalScore) !== scale && parseFloat(nguVanTotalScore) > 0 && (
                                <div className="text-right mt-1 text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-md flex items-center justify-end gap-2">
                                    <Info size={16} />
                                    <span>{t('examStructure.scoreMismatchWarning', 'Tổng điểm ({totalScore}) chưa khớp với thang điểm ({scale}).', { totalScore: nguVanTotalScore, scale: scale.toFixed(1) })}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader><TableRow><TableHead>Loại câu hỏi</TableHead><TableHead>Số câu</TableHead><TableHead>Điểm/câu</TableHead><TableHead>Tổng điểm</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Trắc nghiệm nhiều lựa chọn</TableCell>
                                        <TableCell><Input value={config.cauHoiTracNghiem.cau} onChange={e => handleQuestionStructureChange('cauHoiTracNghiem', 'cau', e.target.value)} /></TableCell>
                                        <TableCell><Input value={config.cauHoiTracNghiem.diem} onChange={e => handleQuestionStructureChange('cauHoiTracNghiem', 'diem', e.target.value)} /></TableCell>
                                        <TableCell>{calculateTotal(config.cauHoiTracNghiem)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Trắc nghiệm Đúng/Sai</TableCell>
                                        <TableCell><Input value={config.cauHoiDungSai.cau} onChange={e => handleQuestionStructureChange('cauHoiDungSai', 'cau', e.target.value)} /></TableCell>
                                        <TableCell><Input value={config.cauHoiDungSai.diem} onChange={e => handleQuestionStructureChange('cauHoiDungSai', 'diem', e.target.value)} /></TableCell>
                                        <TableCell>{calculateTotal(config.cauHoiDungSai)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Trắc nghiệm trả lời ngắn</TableCell>
                                        <TableCell><Input value={config.cauHoiTraLoiNgan.cau} onChange={e => handleQuestionStructureChange('cauHoiTraLoiNgan', 'cau', e.target.value)} /></TableCell>
                                        <TableCell><Input value={config.cauHoiTraLoiNgan.diem} onChange={e => handleQuestionStructureChange('cauHoiTraLoiNgan', 'diem', e.target.value)} /></TableCell>
                                        <TableCell>{calculateTotal(config.cauHoiTraLoiNgan)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Tự luận</TableCell>
                                        <TableCell><Input value={config.cauHoiTuLuan.cau} onChange={e => handleQuestionStructureChange('cauHoiTuLuan', 'cau', e.target.value)} /></TableCell>
                                        <TableCell colSpan={2}><Input value={config.cauHoiTuLuan.diem} onChange={e => handleQuestionStructureChange('cauHoiTuLuan', 'diem', e.target.value)} placeholder="Nhập tổng điểm phần tự luận"/></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                            <div className="font-bold text-right mt-2">Tổng điểm toàn cấu trúc: {totalScore}</div>
                             {parseFloat(totalScore) !== scale && parseFloat(totalScore) > 0 && (
                                 <div className="text-right mt-1 text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-md flex items-center justify-end gap-2">
                                    <Info size={16} />
                                    <span>{t('examStructure.scoreMismatchWarning', 'Tổng điểm ({totalScore}) chưa khớp với thang điểm ({scale}).', { totalScore: totalScore, scale: scale.toFixed(1) })}</span>
                                </div>
                            )}
                            <Button variant="outline" size="sm" className="mt-2">Thêm loại câu hỏi khác</Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const CognitiveSummaryTable: React.FC<{ stats: any; totalPoints: number }> = ({ stats, totalPoints }) => {
    const levels = [
        { key: 'biet', label: 'Nhận biết' },
        { key: 'hieu', label: 'Thông hiểu' },
        { key: 'vd', label: 'Vận dụng' },
        { key: 'vdc', label: 'Vận dụng cao' },
    ];
    return (
        <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Brain size={18} />Phân bổ nhận thức</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Mức độ</TableHead><TableHead>Số câu</TableHead><TableHead>Tổng điểm</TableHead><TableHead>Tỉ lệ %</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {levels.map(level => (
                            <TableRow key={level.key}>
                                <TableCell>{level.label}</TableCell>
                                <TableCell>{stats[level.key].count}</TableCell>
                                <TableCell>{stats[level.key].points.toFixed(2)}</TableCell>
                                <TableCell>{totalPoints > 0 ? `${((stats[level.key].points / totalPoints) * 100).toFixed(1)}%` : '0.0%'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

const StructureSummaryTable: React.FC<{ stats: any, isNguVan: boolean }> = ({ stats, isNguVan }) => {
    const rows = isNguVan
        ? [{ key: 'docHieu', label: 'Đọc hiểu' }, { key: 'viet', label: 'Viết' }]
        : [
            { key: 'multipleChoice', label: 'Trắc nghiệm' },
            { key: 'trueFalse', label: 'Đúng/Sai' },
            { key: 'shortAnswer', label: 'Trả lời ngắn' },
            { key: 'essay', label: 'Tự luận' },
        ];
    return (
        <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings2 size={18} />Cấu trúc câu hỏi</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>{isNguVan ? 'Phần' : 'Loại câu hỏi'}</TableHead><TableHead>Số câu</TableHead><TableHead>Tổng điểm</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {rows.map(row => (stats[row.key] && stats[row.key].count > 0) ? (
                            <TableRow key={row.key}>
                                <TableCell>{row.label}</TableCell>
                                <TableCell>{stats[row.key].count}</TableCell>
                                <TableCell>{stats[row.key].points.toFixed(2)}</TableCell>
                            </TableRow>
                        ) : null)}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

const TnTlDistributionTable: React.FC<{ stats: any; totalPoints: number; isNguVan: boolean }> = ({ stats, totalPoints, isNguVan }) => {
    const tnLabel = isNguVan ? 'Đọc hiểu' : 'Trắc nghiệm (TN)';
    const tlLabel = isNguVan ? 'Viết' : 'Tự luận (TL)';
    
    return (
        <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sliders size={18} />Phân bổ điểm TN/TL</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Hình thức</TableHead><TableHead>Tổng điểm</TableHead><TableHead>Tỉ lệ %</TableHead></TableRow></TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>{tnLabel}</TableCell>
                            <TableCell>{stats.tnPoints.toFixed(2)}</TableCell>
                            <TableCell>{totalPoints > 0 ? `${((stats.tnPoints / totalPoints) * 100).toFixed(1)}%` : '0.0%'}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{tlLabel}</TableCell>
                            <TableCell>{stats.tlPoints.toFixed(2)}</TableCell>
                            <TableCell>{totalPoints > 0 ? `${((stats.tlPoints / totalPoints) * 100).toFixed(1)}%` : '0.0%'}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};


export default function ExamStructureWorkspace({ setExamData, setCurrentPage, updateTokenUsage }: ExamStructureWorkspaceProps) {
    const { examSettings, setExamSettings } = useExamCreation();
    const { settings } = useSettings();
    const { t } = useI18n();
    const isNguVan = settings.subject === 'Ngữ văn';
    const scale = parseFloat(settings.scale) || 10.0;
    const [activeMethod, setActiveMethod] = useState<'auto' | 'semiAuto' | 'manual'>(examSettings.creationMethod);
    
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();
    const { systemInstruction } = useSystemInstruction();

    const handleMethodChange = (method: 'auto' | 'semiAuto' | 'manual') => {
        setActiveMethod(method);
        setExamSettings(prev => ({ ...prev, creationMethod: method }));
    };

    // #region Handlers for Manual Mode (Generic)
    const handleAddTopic = () => {
        setExamSettings(prev => ({
            ...prev,
            manual: {
                ...prev.manual,
                manualTopics: [
                    ...prev.manual.manualTopics,
                    {
                        id: `topic-${Date.now()}`,
                        topicName: `Chủ đề ${prev.manual.manualTopics.length + 1}`,
                        requirements: '',
                        questions: []
                    }
                ]
            }
        }));
    };
    
    const handleRemoveTopic = (topicId: string) => {
        setExamSettings(prev => ({
            ...prev,
            manual: { ...prev.manual, manualTopics: prev.manual.manualTopics.filter(t => t.id !== topicId) }
        }));
    };
    
    const handleTopicChange = (topicId: string, field: 'topicName' | 'requirements', value: string) => {
        setExamSettings(prev => ({
            ...prev,
            manual: {
                ...prev.manual,
                manualTopics: prev.manual.manualTopics.map(t => 
                    t.id === topicId ? { ...t, [field]: value } : t
                )
            }
        }));
    };

    const handleAddQuestionConfig = (topicId: string) => {
        setExamSettings(prev => ({
            ...prev,
            manual: {
                ...prev.manual,
                manualTopics: prev.manual.manualTopics.map(t =>
                    t.id === topicId ? {
                        ...t,
                        questions: [
                            ...t.questions,
                            {
                                id: `q-${Date.now()}`,
                                questionType: 'multipleChoice',
                                count: '0',
                                points: '0.25',
                                distBiet: '0',
                                distHieu: '0',
                                distVd: '0',
                                distVdCao: '0'
                            }
                        ]
                    } : t
                )
            }
        }));
    };

    const handleRemoveQuestionConfig = (topicId: string, questionId: string) => {
        setExamSettings(prev => ({
            ...prev,
            manual: {
                ...prev.manual,
                manualTopics: prev.manual.manualTopics.map(t =>
                    t.id === topicId ? { ...t, questions: t.questions.filter(q => q.id !== questionId) } : t
                )
            }
        }));
    };

    const handleQuestionConfigChange = (topicId: string, questionId: string, field: keyof ManualQuestionConfig, value: string) => {
        setExamSettings(prev => ({
            ...prev,
            manual: {
                ...prev.manual,
                manualTopics: prev.manual.manualTopics.map(t =>
                    t.id === topicId ? {
                        ...t,
                        questions: t.questions.map(q =>
                            q.id === questionId ? { ...q, [field]: value } : q
                        )
                    } : t
                )
            }
        }));
    };
    
    const manualGenericTotalScore = useMemo(() => {
        return examSettings.manual.manualTopics.reduce((total, topic) => {
            const topicTotal = topic.questions.reduce((acc, q) => {
                return acc + (parseInt(q.count) || 0) * (parseFloat(q.points) || 0);
            }, 0);
            return total + topicTotal;
        }, 0).toFixed(2);
    }, [examSettings.manual.manualTopics]);

    // #endregion

    // #region Handlers for Manual Mode (Ngữ Văn)
    const handleNguVanDHPassageChange = (value: string) => {
        setExamSettings(prev => ({ ...prev, manual: { ...prev.manual, nguVanDocHieuPart: { ...prev.manual.nguVanDocHieuPart, passage: value }}}));
    };
    
    const handleAddNguVanDHQuestion = () => {
        setExamSettings(prev => ({
            ...prev,
            manual: { ...prev.manual, nguVanDocHieuPart: {
                ...prev.manual.nguVanDocHieuPart,
                questions: [
                    ...prev.manual.nguVanDocHieuPart.questions,
                    { id: `nv-dh-${Date.now()}`, cognitiveLevel: 'Nhận biết', points: '0.5', requirements: '' }
                ]
            }}
        }));
    };
    
    const handleRemoveNguVanDHQuestion = (id: string) => {
         setExamSettings(prev => ({
            ...prev,
            manual: { ...prev.manual, nguVanDocHieuPart: { ...prev.manual.nguVanDocHieuPart, questions: prev.manual.nguVanDocHieuPart.questions.filter(q => q.id !== id) } }
        }));
    };
    
    const handleNguVanDHQuestionChange = (id: string, field: keyof NguVanDocHieuQuestion, value: string) => {
        setExamSettings(prev => ({
            ...prev,
            manual: { ...prev.manual, nguVanDocHieuPart: {
                ...prev.manual.nguVanDocHieuPart,
                questions: prev.manual.nguVanDocHieuPart.questions.map(q => q.id === id ? { ...q, [field]: value } : q)
            }}
        }));
    };

    const handleNguVanVietPromptChange = (value: string) => {
         setExamSettings(prev => ({ ...prev, manual: { ...prev.manual, nguVanVietPart: { ...prev.manual.nguVanVietPart, promptDescription: value }}}));
    };

    const handleNguVanVietUsePassageToggle = (checked: boolean) => {
         setExamSettings(prev => ({ ...prev, manual: { ...prev.manual, nguVanVietPart: { ...prev.manual.nguVanVietPart, usePart1Passage: checked }}}));
    };

    const handleAddNguVanVietQuestion = () => {
        setExamSettings(prev => ({
            ...prev,
            manual: { ...prev.manual, nguVanVietPart: {
                ...prev.manual.nguVanVietPart,
                questions: [
                    ...prev.manual.nguVanVietPart.questions,
                    { id: `nv-v-${Date.now()}`, prompt: '', pointsBiet: '0.5', pointsHieu: '1.0', pointsVd: '0.5', pointsVdCao: '0' }
                ]
            }}
        }));
    };

    const handleRemoveNguVanVietQuestion = (id: string) => {
        setExamSettings(prev => ({
            ...prev,
            manual: { ...prev.manual, nguVanVietPart: { ...prev.manual.nguVanVietPart, questions: prev.manual.nguVanVietPart.questions.filter(q => q.id !== id) } }
        }));
    };
    
    const handleNguVanVietQuestionChange = (id: string, field: keyof NguVanVietQuestion, value: string) => {
        setExamSettings(prev => ({
            ...prev,
            manual: { ...prev.manual, nguVanVietPart: {
                ...prev.manual.nguVanVietPart,
                questions: prev.manual.nguVanVietPart.questions.map(q => q.id === id ? { ...q, [field]: value } : q)
            }}
        }));
    };

    const nguVanManualTotalScore = useMemo(() => {
        const { nguVanDocHieuPart, nguVanVietPart } = examSettings.manual;
        const docHieu = nguVanDocHieuPart.questions.reduce((sum, q) => sum + (parseFloat(q.points) || 0), 0);
        const viet = nguVanVietPart.questions.reduce((sum, q) => sum + (parseFloat(q.pointsBiet) || 0) + (parseFloat(q.pointsHieu) || 0) + (parseFloat(q.pointsVd) || 0) + (parseFloat(q.pointsVdCao) || 0), 0);
        return (docHieu + viet).toFixed(2);
    }, [examSettings.manual.nguVanDocHieuPart, examSettings.manual.nguVanVietPart]);

    // #endregion

     const manualStats = useMemo(() => {
        const { manual } = examSettings;
        let totalPoints = 0;
        const cognitive = {
            biet: { count: 0, points: 0 }, hieu: { count: 0, points: 0 },
            vd: { count: 0, points: 0 }, vdc: { count: 0, points: 0 }
        };
        const structure = isNguVan
            ? { docHieu: { count: 0, points: 0 }, viet: { count: 0, points: 0 } }
            : { multipleChoice: { count: 0, points: 0 }, trueFalse: { count: 0, points: 0 }, shortAnswer: { count: 0, points: 0 }, essay: { count: 0, points: 0 } };

        if (isNguVan) {
            manual.nguVanDocHieuPart.questions.forEach(q => {
                const points = parseFloat(q.points) || 0;
                structure.docHieu.count++;
                structure.docHieu.points += points;
                totalPoints += points;
                if (q.cognitiveLevel === 'Nhận biết') { cognitive.biet.count++; cognitive.biet.points += points; }
                else if (q.cognitiveLevel === 'Thông hiểu') { cognitive.hieu.count++; cognitive.hieu.points += points; }
                else if (q.cognitiveLevel === 'Vận dụng') { cognitive.vd.count++; cognitive.vd.points += points; }
                else if (q.cognitiveLevel === 'Vận dụng cao') { cognitive.vdc.count++; cognitive.vdc.points += points; }
            });
            manual.nguVanVietPart.questions.forEach(q => {
                const pointsBiet = parseFloat(q.pointsBiet) || 0;
                const pointsHieu = parseFloat(q.pointsHieu) || 0;
                const pointsVd = parseFloat(q.pointsVd) || 0;
                const pointsVdCao = parseFloat(q.pointsVdCao) || 0;
                const questionPoints = pointsBiet + pointsHieu + pointsVd + pointsVdCao;
                structure.viet.count++;
                structure.viet.points += questionPoints;
                totalPoints += questionPoints;
                cognitive.biet.points += pointsBiet;
                cognitive.hieu.points += pointsHieu;
                cognitive.vd.points += pointsVd;
                cognitive.vdc.points += pointsVdCao;
            });
        } else {
            manual.manualTopics.forEach(topic => {
                topic.questions.forEach(q => {
                    const count = parseInt(q.count) || 0;
                    const points = parseFloat(q.points) || 0;
                    const totalQPoints = count * points;
                    
                    (structure as any)[q.questionType].count += count;
                    (structure as any)[q.questionType].points += totalQPoints;
                    totalPoints += totalQPoints;

                    const cBiet = parseInt(q.distBiet) || 0; cognitive.biet.count += cBiet; cognitive.biet.points += cBiet * points;
                    const cHieu = parseInt(q.distHieu) || 0; cognitive.hieu.count += cHieu; cognitive.hieu.points += cHieu * points;
                    const cVd = parseInt(q.distVd) || 0; cognitive.vd.count += cVd; cognitive.vd.points += cVd * points;
                    const cVdCao = parseInt(q.distVdCao) || 0; cognitive.vdc.count += cVdCao; cognitive.vdc.points += cVdCao * points;
                });
            });
        }
        
        const tnTl = { tnPoints: 0, tlPoints: 0 };
        if (isNguVan) {
            tnTl.tnPoints = (structure as any).docHieu.points;
            tnTl.tlPoints = (structure as any).viet.points;
        } else {
            const s = structure as any;
            tnTl.tnPoints = s.multipleChoice.points + s.trueFalse.points + s.shortAnswer.points;
            tnTl.tlPoints = s.essay.points;
        }
        
        return { cognitive, structure, totalPoints, tnTl };
    }, [examSettings.manual, isNguVan]);
    
    // #region AI Generation Logic
    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });

    const formatExamToHtml = (questions: any[], topics: TopicDetails[]): string => {
        const activeConfig = (examSettings.creationMethod === 'auto' || examSettings.creationMethod === 'semiAuto')
          ? examSettings[examSettings.creationMethod]
          : examSettings.auto;

        const pointsConfig = {
            multipleChoice: parseFloat(activeConfig.cauHoiTracNghiem.diem) || 0,
            trueFalse: parseFloat(activeConfig.cauHoiDungSai.diem) || 0,
            shortAnswer: parseFloat(activeConfig.cauHoiTraLoiNgan.diem) || 0,
            essay: activeConfig.cauHoiTuLuan.diem || '0',
        };
        
        const questionsByType = {
            multipleChoice: questions.filter(q => q.questionType === 'multipleChoice'),
            trueFalse: questions.filter(q => q.questionType === 'trueFalse'),
            shortAnswer: questions.filter(q => q.questionType === 'shortAnswer'),
            essay: questions.filter(q => q.questionType === 'essay'),
        };

        const topicMap = new Map(topics.map(t => [t.id, t]));
        let questionCounter = 1;

        const renderQuestions = (qs: any[]) => {
            let sectionHtml = '';
            qs.forEach((q) => {
                const topic = topicMap.get(q.topicId);
                const cognitiveLevel = (q.cognitiveLevel || '').toLowerCase();
                const cognitiveAbbr = cognitiveLevel === 'biet' ? 'NB' 
                    : cognitiveLevel === 'hieu' ? 'TH' 
                    : cognitiveLevel === 'vd' ? 'VD' 
                    : cognitiveLevel === 'vdc' ? 'VDC' 
                    : cognitiveLevel.toUpperCase();
                
                const metadata = `(${cognitiveAbbr}, ${topic?.topicName || 'N/A'})`;
                
                sectionHtml += `<p style="margin-bottom: 4px;"><strong>Câu ${questionCounter++}.</strong> ${q.content}</p>`;
                if (q.questionType === 'multipleChoice' && q.options) {
                    sectionHtml += '<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0 1.5em; margin-bottom: 1em;">';
                    q.options.forEach((opt: string, i: number) => {
                        sectionHtml += `<div style="padding-bottom: 2px;"><strong>${String.fromCharCode(65 + i)}.</strong> ${opt}</div>`;
                    });
                    sectionHtml += '</div>';
                } else {
                    sectionHtml += '<br/>';
                }
            });
            return sectionHtml;
        };
        
        let html = '';

        const mcCount = questionsByType.multipleChoice.length;
        const tfCount = questionsByType.trueFalse.length;
        const saCount = questionsByType.shortAnswer.length;
        const essayCount = questionsByType.essay.length;

        const mcPoints = mcCount * pointsConfig.multipleChoice;
        const tfPoints = tfCount * pointsConfig.trueFalse;
        const saPoints = saCount * pointsConfig.shortAnswer;
        const essayPoints = parseFloat(pointsConfig.essay.match(/(\d+(\.\d+)?)/)?.[0] || '0');
        
        const totalMcqCount = mcCount + tfCount + saCount;
        const totalMcqPoints = mcPoints + tfPoints + saPoints;

        if (totalMcqCount > 0) {
            html += `<h4><strong>A. PHẦN TRẮC NGHIỆM (Tổng số câu: ${totalMcqCount}, Điểm: ${totalMcqPoints.toFixed(2)})</strong></h4>`;
        }

        if (mcCount > 0) {
            html += `<p><strong>I. Trắc nghiệm nhiều lựa chọn (Tổng số câu: ${mcCount}, Điểm: ${mcPoints.toFixed(2)})</strong></p>`;
            html += renderQuestions(questionsByType.multipleChoice);
        }
        
        if (tfCount > 0) {
            html += `<p><strong>II. Trắc nghiệm Đúng/Sai (Tổng số câu: ${tfCount}, Điểm: ${tfPoints.toFixed(2)})</strong></p>`;
            html += renderQuestions(questionsByType.trueFalse);
        }
        
        if (saCount > 0) {
            html += `<p><strong>III. Trắc nghiệm trả lời ngắn (Tổng số câu: ${saCount}, Điểm: ${saPoints.toFixed(2)})</strong></p>`;
            html += renderQuestions(questionsByType.shortAnswer);
        }

        if (essayCount > 0) {
            html += `<h4><strong>B. TỰ LUẬN (Tổng số câu: ${essayCount}, Điểm: ${essayPoints.toFixed(2)})</strong></h4>`;
            html += renderQuestions(questionsByType.essay);
        }

        return html;
    };


    const formatAnswersToHtml = (questions: any[], activeConfig: AutoSemiAutoConfig): string => {
        const pointsConfig = {
            multipleChoice: parseFloat(activeConfig.cauHoiTracNghiem.diem) || 0,
            trueFalse: parseFloat(activeConfig.cauHoiDungSai.diem) || 0,
            shortAnswer: parseFloat(activeConfig.cauHoiTraLoiNgan.diem) || 0,
            essay: activeConfig.cauHoiTuLuan.diem || '0',
        };
        
        const questionsByType = {
            multipleChoice: questions.filter(q => q.questionType === 'multipleChoice'),
            trueFalse: questions.filter(q => q.questionType === 'trueFalse'),
            shortAnswer: questions.filter(q => q.questionType === 'shortAnswer'),
            essay: questions.filter(q => q.questionType === 'essay'),
        };

        let html = '<h4><strong>ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM</strong></h4>';
        let questionCounter = 1;

        const mcCount = questionsByType.multipleChoice.length;
        const tfCount = questionsByType.trueFalse.length;
        const saCount = questionsByType.shortAnswer.length;
        const essayCount = questionsByType.essay.length;

        const mcPoints = mcCount * pointsConfig.multipleChoice;
        const tfPoints = tfCount * pointsConfig.trueFalse;
        const saPoints = saCount * pointsConfig.shortAnswer;
        const essayPoints = parseFloat(pointsConfig.essay.match(/(\d+(\.\d+)?)/)?.[0] || '0');
        
        const totalMcqCount = mcCount + tfCount + saCount;
        const totalMcqPoints = mcPoints + tfPoints + saPoints;
        
        const allMcqs = [
            ...questionsByType.multipleChoice,
            ...questionsByType.trueFalse,
            ...questionsByType.shortAnswer,
        ];

        if (totalMcqCount > 0) {
            html += `<h4><strong>A. PHẦN TRẮC NGHIỆM (Tổng số câu: ${totalMcqCount}, Điểm: ${totalMcqPoints.toFixed(2)})</strong></h4>`;
            
            if (mcCount > 0) {
                html += `<p><strong>I. Trắc nghiệm nhiều lựa chọn (Tổng số câu: ${mcCount}, Điểm: ${mcPoints.toFixed(2)})</strong></p>`;
            }
            if (tfCount > 0) {
                html += `<p><strong>II. Trắc nghiệm Đúng/Sai (Tổng số câu: ${tfCount}, Điểm: ${tfPoints.toFixed(2)})</strong></p>`;
            }
            if (saCount > 0) {
                html += `<p><strong>III. Trắc nghiệm trả lời ngắn (Tổng số câu: ${saCount}, Điểm: ${saPoints.toFixed(2)})</strong></p>`;
            }
            
            html += '<table border="1" style="border-collapse: collapse; width: 100%; text-align: center;"><tbody><tr>';
            allMcqs.forEach((q, i) => {
                if (i > 0 && i % 10 === 0) html += '</tr><tr>';
                html += `<td><strong>${i + 1}.</strong> ${q.answer}</td>`;
            });
            html += '</tr></tbody></table><br/>';
            
            questionCounter += allMcqs.length;
        }

        if (essayCount > 0) {
            html += `<h4><strong>B. TỰ LUẬN (Tổng số câu: ${essayCount}, Điểm: ${essayPoints.toFixed(2)})</strong></h4>`;
            questionsByType.essay.forEach(q => {
                html += `<p><strong>Câu ${questionCounter++}:</strong></p>`;
                html += q.detailedAnswer || '<em>Không có hướng dẫn chấm chi tiết.</em>';
                html += '<br/>';
            });
        }

        return html;
    };

    const createValidationReport = (topics: TopicDetails[], questions: any[]): ValidationReport => {
        const report: ValidationReport = {};
        topics.forEach(topic => {
            report[topic.id] = {
                topicName: topic.topicName,
                multipleChoice: {
                    biet: { expected: topic.multipleChoice?.biet || 0, actual: 0 },
                    hieu: { expected: topic.multipleChoice?.hieu || 0, actual: 0 },
                    vd: { expected: topic.multipleChoice?.vd || 0, actual: 0 },
                },
                 trueFalse: {
                    biet: { expected: topic.trueFalse?.biet || 0, actual: 0 },
                    hieu: { expected: topic.trueFalse?.hieu || 0, actual: 0 },
                    vd: { expected: topic.trueFalse?.vd || 0, actual: 0 },
                },
                 shortAnswer: {
                    biet: { expected: topic.shortAnswer?.biet || 0, actual: 0 },
                    hieu: { expected: topic.shortAnswer?.hieu || 0, actual: 0 },
                    vd: { expected: topic.shortAnswer?.vd || 0, actual: 0 },
                },
                 essay: {
                    biet: { expected: topic.essay?.biet || 0, actual: 0 },
                    hieu: { expected: topic.essay?.hieu || 0, actual: 0 },
                    vd: { expected: topic.essay?.vd || 0, actual: 0 },
                }
            };
        });

        questions.forEach(q => {
            if (report[q.topicId] && report[q.topicId][q.questionType]) {
                const qTypeReport = report[q.topicId][q.questionType] as any;
                if(qTypeReport[q.cognitiveLevel]) {
                    qTypeReport[q.cognitiveLevel].actual++;
                }
            }
        });

        return report;
    };


    const handleCreateExam = async (method: 'auto' | 'semiAuto' | 'manual') => {
        const apiKey = localStorage.getItem('examgen_gemini_api_key');
        if (!apiKey) {
            addToast("Không tìm thấy API Key. Vui lòng vào Cài đặt > Trí tuệ nhân tạo để thiết lập.");
            return;
        }

        setIsLoading(true);
        setStatusMessage('Bắt đầu quá trình tạo đề...');
        const ai = new GoogleGenAI({ apiKey });
        let totalTokens = 0;
        
        try {
            if (isNguVan) {
                let prompt = '';
                if (method === 'auto') {
                     if (!examSettings.auto.aiPrompt.trim()) {
                        addToast(t('examStructure.toast.error.knowledgeScopeNguVan'));
                        setIsLoading(false);
                        return;
                    }
                    setStatusMessage(t('examStructure.status.analyzingNguVan'));
                    prompt = `Tạo một đề thi Ngữ văn hoàn chỉnh theo các yêu cầu sau:
                    - Phạm vi kiến thức: ${examSettings.auto.aiPrompt}.
                    - Phần I (Đọc hiểu): ${examSettings.auto.nguVanTuDongDocHieuPart.soCau} câu, tổng điểm ${examSettings.auto.nguVanTuDongDocHieuPart.tongDiem}. AI phải tự tìm một ngữ liệu đọc hiểu phù hợp (văn bản nghị luận hoặc thông tin) và tuyệt đối không được lấy từ Sách giáo khoa.
                    - Phần II (Viết): ${examSettings.auto.nguVanTuDongVietPart.soCau} câu, tổng điểm ${examSettings.auto.nguVanTuDongVietPart.tongDiem}. 
                    - Trả về kết quả dưới dạng JSON object có 2 key: "examContent" (HTML đề thi) và "answerContent" (HTML đáp án và hướng dẫn chấm). Đảm bảo JSON trả về là hợp lệ và các chuỗi HTML được escape đúng cách.`;
                } else if (method === 'manual') {
                    setStatusMessage(t('examStructure.status.generatingNguVanManual'));
                    prompt = `Với vai trò là một giáo viên Ngữ văn kinh nghiệm, hãy tạo nội dung chi tiết cho một đề thi dựa trên cấu trúc chính xác sau đây. TUYỆT ĐỐI không thay đổi cấu trúc, chỉ tạo nội dung.
                    - Cấu trúc: \`\`\`json\n${JSON.stringify({docHieu: examSettings.manual.nguVanDocHieuPart, viet: examSettings.manual.nguVanVietPart}, null, 2)}\n\`\`\`
                    - Trả về kết quả dưới dạng JSON object có 2 key: "examContent" (HTML đề thi) và "answerContent" (HTML đáp án và hướng dẫn chấm chi tiết, có biểu điểm rõ ràng cho từng ý). Đảm bảo JSON trả về là hợp lệ và các chuỗi HTML được escape đúng cách.`;
                }
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-pro',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        systemInstruction: systemInstruction.instruction,
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                examContent: { 
                                    type: Type.STRING,
                                    description: "Nội dung HTML của toàn bộ đề thi Ngữ văn."
                                },
                                answerContent: { 
                                    type: Type.STRING,
                                    description: "Nội dung HTML của đáp án và hướng dẫn chấm điểm chi tiết. Phần đáp án PHẢI có cấu trúc rõ ràng (A. PHẦN ĐỌC HIỂU, B. PHẦN VIẾT) và phần Viết PHẢI có biểu điểm chấm chi tiết cho từng yêu cầu."
                                },
                            },
                            required: ['examContent', 'answerContent']
                        }
                    }
                });
                
                if (response.usageMetadata) {
                    updateTokenUsage(response.usageMetadata.totalTokenCount);
                }

                const result = parseGeminiJson(response.text);
                setExamData(result);
                addToast(method === 'auto' ? t('examStructure.toast.success.generateNguVanAuto') : t('examStructure.toast.success.generateNguVanManual'));
                setCurrentPage('results');
            } else { // Generic subjects
                 if (method === 'auto') {
                    if (!examSettings.auto.aiPrompt.trim()) {
                        addToast(t('examStructure.toast.error.knowledgeScopeGeneric'));
                        setIsLoading(false);
                        return;
                    }
                    setStatusMessage(t('examStructure.status.generatingFullExamAuto'));

                    const fullExamPrompt = `Bạn là một chuyên gia thiết kế đề thi. Dựa trên phạm vi kiến thức "${examSettings.auto.aiPrompt}" và các thiết lập cấu trúc sau: ${JSON.stringify(examSettings.auto, null, 2)}, hãy tạo ra một đề thi hoàn chỉnh. Quá trình này bao gồm:
1.  **Tự tạo Ma trận:** Phân tích yêu cầu để tạo ra một ma trận đề thi chi tiết, phân bổ số câu hỏi theo từng chủ đề, dạng bài, và mức độ nhận thức, đảm bảo tuân thủ tuyệt đối các tổng số câu đã cho.
2.  **Tạo Câu hỏi:** Dựa trên ma trận vừa tạo, viết nội dung cho TẤT CẢ các câu hỏi. Đối với các câu tự luận (essay), BẮT BUỘC phải cung cấp hướng dẫn chấm điểm và biểu điểm chi tiết trong trường 'detailedAnswer'.

YÊU CẦU ĐẦU RA: Kết quả trả về PHẢI là một đối tượng JSON duy nhất có hai khóa: "topics" (chứa mảng ma trận bạn đã tạo) và "questions" (chứa mảng tất cả các câu hỏi).`;

                    const questionDistributionSchema = {
                        type: Type.OBJECT,
                        properties: {
                            biet: { type: Type.NUMBER, description: "Số câu hỏi mức độ Nhận biết." },
                            hieu: { type: Type.NUMBER, description: "Số câu hỏi mức độ Thông hiểu." },
                            vd: { type: Type.NUMBER, description: "Số câu hỏi mức độ Vận dụng." }
                        },
                        required: ['biet', 'hieu', 'vd']
                    };

                    const topicsSchema = {
                        type: Type.ARRAY,
                        description: "Mảng chứa các đối tượng ma trận chi tiết cho từng chủ đề.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING, description: "Một ID duy nhất cho chủ đề, ví dụ 'chuong_1'." },
                                topicName: { type: Type.STRING, description: "Tên của chủ đề hoặc chương." },
                                unit: { type: Type.STRING, description: "Tên của bài hoặc đơn vị kiến thức cụ thể trong chủ đề." },
                                requirements: { type: Type.STRING, description: "Mô tả các yêu cầu cần đạt cho chủ đề này." },
                                multipleChoice: questionDistributionSchema,
                                trueFalse: questionDistributionSchema,
                                shortAnswer: questionDistributionSchema,
                                essay: questionDistributionSchema,
                            },
                            required: ['id', 'topicName', 'unit', 'requirements', 'multipleChoice', 'trueFalse', 'shortAnswer', 'essay']
                        }
                    };
                    
                    const questionsSchema = {
                        type: Type.ARRAY,
                        description: "Mảng chứa tất cả các đối tượng câu hỏi được tạo ra từ ma trận.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING, description: "Một ID duy nhất cho câu hỏi, ví dụ 'q_123'." },
                                topicId: { type: Type.STRING, description: "ID của chủ đề mà câu hỏi này thuộc về." },
                                cognitiveLevel: { type: Type.STRING, description: "Mức độ nhận thức: 'biet', 'hieu', 'vd', hoặc 'vdc'." },
                                questionType: { type: Type.STRING, description: "Loại câu hỏi: 'multipleChoice', 'trueFalse', 'shortAnswer', hoặc 'essay'." },
                                content: { type: Type.STRING, description: "Nội dung câu hỏi, không bao gồm tiền tố 'Câu 1.' và các phương án A, B, C, D." },
                                options: { 
                                    type: Type.ARRAY, 
                                    description: "Một mảng chứa 4 chuỗi phương án trả lời cho câu hỏi trắc nghiệm.",
                                    items: { type: Type.STRING, description: "Nội dung của một phương án, không bao gồm tiền tố 'A.'" } 
                                },
                                answer: { type: Type.STRING, description: "Đáp án của câu hỏi. Ví dụ: 'A' cho trắc nghiệm, 'S-Đ-S-Đ' cho Đúng/Sai." },
                                detailedAnswer: { type: Type.STRING, description: "HTML cho lời giải chi tiết hoặc hướng dẫn chấm điểm. BẮT BUỘC đối với câu tự luận (essay). Bao gồm biểu điểm." },
                            },
                            required: ['id', 'topicId', 'cognitiveLevel', 'questionType', 'content', 'answer']
                        }
                    };

                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-pro',
                        contents: fullExamPrompt,
                        config: {
                            responseMimeType: "application/json",
                            systemInstruction: systemInstruction.instruction,
                            responseSchema: {
                                type: Type.OBJECT,
                                properties: {
                                    topics: topicsSchema,
                                    questions: questionsSchema,
                                },
                                required: ['topics', 'questions']
                            }
                        }
                    });
                    
                    if (response.usageMetadata) totalTokens += response.usageMetadata.totalTokenCount;
                    updateTokenUsage(totalTokens);

                    const result = parseGeminiJson(response.text);
                    const topics = result.topics;
                    const questions = result.questions;
                    
                    const examContent = formatExamToHtml(questions, topics);
                    const answerContent = formatAnswersToHtml(questions, examSettings.auto);
                    const validationReport = createValidationReport(topics, questions);

                    setExamData({ topics, questions, validationReport, examContent, answerContent });
                    addToast(t('examStructure.toast.success.generateAuto'));
                    setCurrentPage('results');
                 } else { // Handle manual and semi-auto
                    let topics: TopicDetails[] = [];
                    if (method === 'manual') {
                        // Convert manual structure to TopicDetails structure for consistency
                        topics = examSettings.manual.manualTopics.map(t => ({
                            id: t.id,
                            topicName: t.topicName,
                            unit: '',
                            requirements: t.requirements,
                            multipleChoice: { biet: parseInt(t.questions.find(q=>q.questionType==='multipleChoice')?.distBiet || '0'), hieu: parseInt(t.questions.find(q=>q.questionType==='multipleChoice')?.distHieu || '0'), vd: parseInt(t.questions.find(q=>q.questionType==='multipleChoice')?.distVd || '0') },
                            trueFalse: { biet: parseInt(t.questions.find(q=>q.questionType==='trueFalse')?.distBiet || '0'), hieu: parseInt(t.questions.find(q=>q.questionType==='trueFalse')?.distHieu || '0'), vd: parseInt(t.questions.find(q=>q.questionType==='trueFalse')?.distVd || '0') },
                            shortAnswer: { biet: parseInt(t.questions.find(q=>q.questionType==='shortAnswer')?.distBiet || '0'), hieu: parseInt(t.questions.find(q=>q.questionType==='shortAnswer')?.distHieu || '0'), vd: parseInt(t.questions.find(q=>q.questionType==='shortAnswer')?.distVd || '0') },
                            essay: { biet: parseInt(t.questions.find(q=>q.questionType==='essay')?.distBiet || '0'), hieu: parseInt(t.questions.find(q=>q.questionType==='essay')?.distHieu || '0'), vd: parseInt(t.questions.find(q=>q.questionType==='essay')?.distVd || '0') }
                        }));
                    } else { // semiAuto
                         if (!uploadedFile) {
                            addToast(t('examStructure.toast.error.noFile'));
                            setIsLoading(false);
                            return;
                        }
                        setStatusMessage(t('examStructure.status.analyzingFile'));
                        let parts: any[] = [];
                        if (uploadedFile.type.startsWith('image/')) {
                            const base64Data = await fileToBase64(uploadedFile);
                            parts.push({ inlineData: { mimeType: uploadedFile.type, data: base64Data } });
                            parts.push({ text: "Phân tích hình ảnh đề thi này và tạo lại nội dung." });
                        } else if (uploadedFile.type === 'text/plain') {
                            parts.push({ text: await uploadedFile.text() });
                        } else {
                            addToast(t('examStructure.toast.error.fileType'));
                            setIsLoading(false);
                            return;
                        }
                        
                        const response = await ai.models.generateContent({
                            model: 'gemini-2.5-pro',
                            contents: { parts },
                            config: {
                                 responseMimeType: "application/json",
                                 systemInstruction: systemInstruction.instruction,
                                 responseSchema: {
                                    type: Type.OBJECT,
                                    properties: {
                                        examContent: {
                                            type: Type.STRING,
                                            description: "Nội dung HTML của toàn bộ đề thi được trích xuất và tái cấu trúc từ file."
                                        },
                                        answerContent: {
                                            type: Type.STRING,
                                            description: "Nội dung HTML của toàn bộ đáp án tương ứng được trích xuất từ file."
                                        }
                                    },
                                    required: ['examContent', 'answerContent']
                                 }
                            }
                        });

                        if (response.usageMetadata) updateTokenUsage(response.usageMetadata.totalTokenCount);
                        
                        const result = parseGeminiJson(response.text);
                        setExamData(result);
                        addToast(t('examStructure.toast.success.generateFromFile'));
                        setCurrentPage('results');
                        return; // End here for semi-auto
                    }

                    setStatusMessage(t('examStructure.status.manualStep1'));
                    const questionsPrompt = `Bạn là một người ra đề thi chuyên nghiệp. Dựa trên ma trận đề thi chi tiết sau đây, hãy tạo một bộ câu hỏi đầy đủ.
YÊU CẦU BẮT BUỘC:
1. TUÂN THỦ TUYỆT ĐỐI ma trận đã cho. Bạn PHẢI tạo ra CHÍNH XÁC số lượng câu hỏi cho mỗi chủ đề, mỗi loại câu hỏi (multipleChoice, trueFalse, shortAnswer, essay), và mỗi mức độ nhận thức (biet, hieu, vd) như đã được chỉ định trong ma trận.
2. Đây là yêu cầu BẮT BUỘC, không phải là gợi ý. Không được thêm, bớt, hay thay đổi số lượng câu hỏi ở bất kỳ mục nào.
3. Với các câu tự luận (essay), hãy cung cấp hướng dẫn chấm điểm chi tiết trong trường 'detailedAnswer' dưới dạng HTML, bao gồm biểu điểm cho từng ý.
4. Trả về kết quả dưới dạng một mảng JSON các đối tượng câu hỏi.
5. Đảm bảo JSON trả về là hợp lệ. Mọi giá trị chuỗi (string) phải được bao trong dấu ngoặc kép, và bất kỳ dấu ngoặc kép nào bên trong chuỗi phải được escape bằng dấu gạch chéo ngược (ví dụ: "câu hỏi về \\"ánh sáng\\"").
Ma trận: \`\`\`json\n${JSON.stringify(topics, null, 2)}\n\`\`\``;
                    
                    const qResponse = await ai.models.generateContent({
                        model: 'gemini-2.5-pro',
                        contents: questionsPrompt,
                        config: {
                             responseMimeType: "application/json",
                             systemInstruction: systemInstruction.instruction,
                             responseSchema: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING, description: "Một ID duy nhất cho câu hỏi, ví dụ 'q_123'." },
                                        topicId: { type: Type.STRING, description: "ID của chủ đề mà câu hỏi này thuộc về." },
                                        cognitiveLevel: { type: Type.STRING, description: "Mức độ nhận thức: 'biet', 'hieu', 'vd', hoặc 'vdc'." },
                                        questionType: { type: Type.STRING, description: "Loại câu hỏi: 'multipleChoice', 'trueFalse', 'shortAnswer', hoặc 'essay'." },
                                        content: { type: Type.STRING, description: "Nội dung câu hỏi, không bao gồm tiền tố 'Câu 1.' và các phương án A, B, C, D." },
                                        options: { 
                                            type: Type.ARRAY, 
                                            description: "Một mảng chứa 4 chuỗi phương án trả lời cho câu hỏi trắc nghiệm.",
                                            items: { type: Type.STRING, description: "Nội dung của một phương án, không bao gồm tiền tố 'A.'" } 
                                        },
                                        answer: { type: Type.STRING, description: "Đáp án của câu hỏi. Ví dụ: 'A' cho trắc nghiệm, 'S-Đ-S-Đ' cho Đúng/Sai." },
                                        detailedAnswer: { type: Type.STRING, description: "HTML cho lời giải chi tiết hoặc hướng dẫn chấm điểm. BẮT BUỘC đối với câu tự luận (essay). Bao gồm biểu điểm." },
                                    },
                                    required: ['id', 'topicId', 'cognitiveLevel', 'questionType', 'content', 'answer']
                                }
                             }
                        }
                    });
                    
                    if (qResponse.usageMetadata) totalTokens += qResponse.usageMetadata.totalTokenCount;
                    updateTokenUsage(totalTokens);

                    const questions = parseGeminiJson(qResponse.text);

                    setStatusMessage(t('examStructure.status.manualStep2'));
                    const examContent = formatExamToHtml(questions, topics);
                    const answerContent = formatAnswersToHtml(questions, examSettings.auto); // Use auto config as fallback for points
                    const validationReport = createValidationReport(topics, questions);

                    setExamData({ topics, questions, validationReport, examContent, answerContent });
                    addToast(t('examStructure.toast.success.generateManual'));
                    setCurrentPage('results');
                }
            }
        } catch (error) {
            console.error("Lỗi tạo đề:", error);
            addToast(`Đã xảy ra lỗi: ${(error as Error).message}`);
        } finally {
            setIsLoading(false);
            setStatusMessage('');
        }
    };
    
    // #endregion
    
    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            addToast(t('examStructure.toast.error.fileType'));
            return;
        }

        if (file.size > 15 * 1024 * 1024) { // 15MB limit
            addToast(t('examStructure.toast.error.fileSize'));
            return;
        }

        setUploadedFile(file);
        addToast(t('examStructure.toast.info.fileSelected', { fileName: file.name }));
    };
    
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Settings size={24} /> Thiết lập cấu trúc đề thi</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeMethod} onValueChange={(v) => handleMethodChange(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="auto"><Sparkles className="w-4 h-4 mr-2"/>Tự động (AI)</TabsTrigger>
            <TabsTrigger value="semiAuto"><FileUp className="w-4 h-4 mr-2"/>Bán tự động</TabsTrigger>
            <TabsTrigger value="manual"><Edit className="w-4 h-4 mr-2"/>Thủ công</TabsTrigger>
          </TabsList>
          
          <TabsContent value="auto" className="mt-4 space-y-4">
            <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
                <CardContent className="p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-indigo-500 mt-1 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-indigo-800 dark:text-indigo-200">
                            {isNguVan ? t('examStructure.logic.autoNguVan') : t('examStructure.logic.autoGeneric')}
                        </p>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-2 pt-2 border-t border-indigo-200/50 dark:border-indigo-800/50">
                            {t('examStructure.logic.generalSettingsNote')}
                        </p>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen size={20} className="text-orange-500"/>Thiết lập Phạm vi kiến thức</CardTitle></CardHeader>
                <CardContent>
                    <div>
                        <Label htmlFor="knowledge-scope" className="flex items-center gap-2"><Info size={16} className="text-slate-500"/>Chủ đề/Chương/Nội dung</Label>
                        <Textarea
                            id="knowledge-scope"
                            value={examSettings.auto.aiPrompt}
                            onChange={(e) => setExamSettings(prev => ({...prev, auto: { ...prev.auto, aiPrompt: e.target.value}}))}
                            placeholder={isNguVan ? t('examStructure.auto.nguVanPlaceholder') : t('examStructure.auto.genericPlaceholder')}
                            rows={4}
                        />
                        <p className="text-xs text-slate-500 mt-1">AI sẽ dựa vào đây để tạo nội dung đề thi.</p>
                    </div>
                </CardContent>
            </Card>

            <StructureConfig mode="auto" />
            
             {isLoading && activeMethod === 'auto' && (
                <div className="flex items-center justify-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    <span className="text-sm text-indigo-600 dark:text-indigo-300">{statusMessage}</span>
                </div>
            )}
            <div className="flex justify-end pt-2">
                <Button onClick={() => handleCreateExam('auto')} disabled={isLoading}>
                    {isLoading && activeMethod === 'auto' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    {isLoading && activeMethod === 'auto' ? t('examStructure.generatingButton') : (isNguVan ? t('examStructure.auto.generateNguVanButton') : t('examStructure.auto.generateButton'))}
                </Button>
            </div>
          </TabsContent>

          <TabsContent value="semiAuto" className="mt-4 space-y-4">
            <Card className="mb-4 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
                <CardContent className="p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-indigo-500 mt-1 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-indigo-800 dark:text-indigo-200">
                            {t('examStructure.logic.semiAuto')}
                        </p>
                         <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-2 pt-2 border-t border-indigo-200/50 dark:border-indigo-800/50">
                            {t('examStructure.logic.generalSettingsNote')}
                        </p>
                    </div>
                </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload size={20} className="text-indigo-500"/>Tải lên file câu hỏi</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <Label htmlFor="file-upload" className="mt-2 block text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                        {t('examStructure.semiAuto.uploadDescription')}
                    </Label>
                    <input id="file-upload" ref={fileInputRef} name="file-upload" type="file" className="sr-only" onChange={handleFileSelection} />
                </div>
                 {uploadedFile && (
                    <div className="mt-2 text-sm text-green-700 dark:text-green-300">Đã chọn: {uploadedFile.name}</div>
                )}
              </CardContent>
            </Card>

            <StructureConfig mode="semiAuto" />
            
             {isLoading && activeMethod === 'semiAuto' && (
                <div className="flex items-center justify-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    <span className="text-sm text-indigo-600 dark:text-indigo-300">{statusMessage}</span>
                </div>
            )}
            <div className="flex justify-end pt-2">
                <Button onClick={() => handleCreateExam('semiAuto')} disabled={isLoading || !uploadedFile}>
                    {isLoading && activeMethod === 'semiAuto' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    {isLoading && activeMethod === 'semiAuto' ? t('examStructure.semiAuto.processingButton') : t('examStructure.semiAuto.generateFromFileButton')}
                </Button>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="mt-4 space-y-4">
             <Card className="mb-4 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
                <CardContent className="p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-indigo-500 mt-1 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-indigo-800 dark:text-indigo-200">
                            {isNguVan ? t('examStructure.logic.manualNguVan') : t('examStructure.logic.manualGeneric')}
                        </p>
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-2 pt-2 border-t border-indigo-200/50 dark:border-indigo-800/50">
                            {t('examStructure.logic.generalSettingsNote')}
                        </p>
                    </div>
                </CardContent>
            </Card>
             {isNguVan ? (
                <div className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen size={20} />{t('examStructure.nguVan.part1Header', {points: examSettings.manual.nguVanDocHieuPart.questions.reduce((s, q) => s + (parseFloat(q.points) || 0), 0).toFixed(2)})}</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="flex items-center gap-2"><FileText size={16}/>{t('examStructure.nguVan.passageLabel')}</Label>
                                <Textarea placeholder={t('examStructure.nguVan.passagePlaceholder')} rows={5} value={examSettings.manual.nguVanDocHieuPart.passage} onChange={(e) => handleNguVanDHPassageChange(e.target.value)} />
                                <p className="text-xs text-slate-500 mt-1">{t('examStructure.nguVan.passageNote')}</p>
                            </div>
                            <div>
                                <Label className="flex items-center gap-2"><Settings2 size={16}/>{t('examStructure.nguVan.questionsLabel')}</Label>
                                {examSettings.manual.nguVanDocHieuPart.questions.map((q, index) => (
                                    <div key={q.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border p-2 rounded-lg mt-2">
                                        <div className="md:col-span-1 font-semibold">{t('examStructure.nguVan.questionLabel', {index: index + 1})}</div>
                                        <div className="md:col-span-3"><Label>Mức độ</Label><Select value={q.cognitiveLevel} onValueChange={v => handleNguVanDHQuestionChange(q.id, 'cognitiveLevel', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Nhận biết">Nhận biết</SelectItem><SelectItem value="Thông hiểu">Thông hiểu</SelectItem><SelectItem value="Vận dụng">Vận dụng</SelectItem><SelectItem value="Vận dụng cao">Vận dụng cao</SelectItem></SelectContent></Select></div>
                                        <div className="md:col-span-2"><Label>Điểm</Label><Input placeholder={t('examStructure.nguVan.pointsPlaceholder')} value={q.points} onChange={e => handleNguVanDHQuestionChange(q.id, 'points', e.target.value)} /></div>
                                        <div className="md:col-span-5"><Label>Yêu cầu cần đạt</Label><Input placeholder={t('examStructure.manual.requirementsLabel')} value={q.requirements} onChange={e => handleNguVanDHQuestionChange(q.id, 'requirements', e.target.value)} /></div>
                                        <div className="md:col-span-1"><Button variant="ghost" size="sm" onClick={() => handleRemoveNguVanDHQuestion(q.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button></div>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={handleAddNguVanDHQuestion} className="mt-2"><Plus className="w-4 h-4 mr-2"/>{t('examStructure.nguVan.addDHQuestionButton')}</Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Edit size={20} />{t('examStructure.nguVan.part2Header', { points: examSettings.manual.nguVanVietPart.questions.reduce((s, q) => s + (parseFloat(q.pointsBiet) || 0) + (parseFloat(q.pointsHieu) || 0) + (parseFloat(q.pointsVd) || 0) + (parseFloat(q.pointsVdCao) || 0), 0).toFixed(2)})}</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Checkbox id="usePart1Passage" checked={examSettings.manual.nguVanVietPart.usePart1Passage} onCheckedChange={handleNguVanVietUsePassageToggle} />
                                    <Label htmlFor="usePart1Passage">{t('examStructure.nguVan.usePart1PassageLabel')}</Label>
                                </div>
                                {!examSettings.manual.nguVanVietPart.usePart1Passage && (
                                    <div>
                                        <Label className="flex items-center gap-2"><FileText size={16}/>{t('examStructure.nguVan.promptDescriptionLabel')}</Label>
                                        <Textarea placeholder={t('examStructure.nguVan.promptDescriptionPlaceholder')} rows={3} value={examSettings.manual.nguVanVietPart.promptDescription} onChange={(e) => handleNguVanVietPromptChange(e.target.value)} />
                                    </div>
                                )}
                            </div>
                            {examSettings.manual.nguVanVietPart.questions.map((q, index) => (
                                <div key={q.id} className="border p-2 rounded-lg mt-2 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="font-semibold">{t('examStructure.nguVan.questionLabel', {index: index + 1})}</Label>
                                        <Button variant="ghost" size="sm" onClick={() => handleRemoveNguVanVietQuestion(q.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                                    </div>
                                    <div><Label>{t('examStructure.nguVan.questionPromptLabel')}</Label><Textarea placeholder="VD: Viết bài văn nghị luận..." value={q.prompt} onChange={e => handleNguVanVietQuestionChange(q.id, 'prompt', e.target.value)} /></div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        <div><Label>{t('examStructure.nguVan.pointsNBLabel')}</Label><Input placeholder="0.5" value={q.pointsBiet} onChange={e => handleNguVanVietQuestionChange(q.id, 'pointsBiet', e.target.value)} /></div>
                                        <div><Label>{t('examStructure.nguVan.pointsTHLabel')}</Label><Input placeholder="1.0" value={q.pointsHieu} onChange={e => handleNguVanVietQuestionChange(q.id, 'pointsHieu', e.target.value)} /></div>
                                        <div><Label>{t('examStructure.nguVan.pointsVDLabel')}</Label><Input placeholder="0.5" value={q.pointsVd} onChange={e => handleNguVanVietQuestionChange(q.id, 'pointsVd', e.target.value)} /></div>
                                        <div><Label>{t('examStructure.nguVan.pointsVDCLabel')}</Label><Input placeholder="0.0" value={q.pointsVdCao} onChange={e => handleNguVanVietQuestionChange(q.id, 'pointsVdCao', e.target.value)} /></div>
                                    </div>
                                </div>
                            ))}
                             <Button variant="outline" size="sm" onClick={handleAddNguVanVietQuestion} className="mt-2"><Plus className="w-4 h-4 mr-2"/>{t('examStructure.nguVan.addVietQuestionButton')}</Button>
                        </CardContent>
                    </Card>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <CognitiveSummaryTable stats={manualStats.cognitive} totalPoints={manualStats.totalPoints} />
                        <StructureSummaryTable stats={manualStats.structure} isNguVan={isNguVan} />
                        <TnTlDistributionTable stats={manualStats.tnTl} totalPoints={manualStats.totalPoints} isNguVan={isNguVan} />
                    </div>
                     {isLoading && activeMethod === 'manual' && (
                        <div className="flex items-center justify-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                            <span className="text-sm text-indigo-600 dark:text-indigo-300">{statusMessage}</span>
                        </div>
                    )}
                    <div className="mt-4 flex justify-between items-start">
                        <div className="text-left">
                           <div className="font-bold text-lg">Tổng điểm toàn đề: {nguVanManualTotalScore}</div>
                            {parseFloat(nguVanManualTotalScore) !== scale && parseFloat(nguVanManualTotalScore) > 0 && (
                                <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-md flex items-center gap-2">
                                    <Info size={16} />
                                    <span>{t('examStructure.scoreMismatchWarning', 'Tổng điểm ({totalScore}) chưa khớp với thang điểm ({scale}).', { totalScore: nguVanManualTotalScore, scale: scale.toFixed(1) })}</span>
                                </div>
                            )}
                        </div>
                        <Button onClick={() => handleCreateExam('manual')} disabled={isLoading}>
                            {isLoading && activeMethod === 'manual' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            {isLoading && activeMethod === 'manual' ? t('examStructure.generatingButton') : t('examStructure.manual.generateNguVanButton')}
                        </Button>
                    </div>
                </div>
             ) : (
                <div className="space-y-4">
                    {examSettings.manual.manualTopics.map((topic, index) => (
                        <Card key={topic.id}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2"><FolderCog size={20} className="text-indigo-500"/>{t('examStructure.manual.topicHeader', { index: index + 1 })}</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveTopic(topic.id)}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor={`topicName-${topic.id}`} className="flex items-center gap-2"><TypeIcon size={16} className="text-slate-500"/>{t('examStructure.manual.topicNameLabel')}</Label>
                                    <Input id={`topicName-${topic.id}`} value={topic.topicName} onChange={e => handleTopicChange(topic.id, 'topicName', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor={`requirements-${topic.id}`} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500"/>{t('examStructure.manual.requirementsLabel')}</Label>
                                    <Textarea id={`requirements-${topic.id}`} value={topic.requirements} onChange={e => handleTopicChange(topic.id, 'requirements', e.target.value)} placeholder={t('examStructure.manual.requirementsPlaceholder')} />
                                </div>
                                <div>
                                    <Label className="flex items-center gap-2"><Settings2 size={16} className="text-blue-500"/>{t('examStructure.manual.questionConfigLabel')}</Label>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Loại câu hỏi</TableHead>
                                                <TableHead>{t('examStructure.manual.totalQuestionsLabel')}</TableHead>
                                                <TableHead>{t('examStructure.manual.pointsPerQuestionLabel')}</TableHead>
                                                <TableHead>NB</TableHead>
                                                <TableHead>TH</TableHead>
                                                <TableHead>VD</TableHead>
                                                <TableHead>VDC</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {topic.questions.map(q => (
                                                <TableRow key={q.id}>
                                                    <TableCell>
                                                        <Select value={q.questionType} onValueChange={v => handleQuestionConfigChange(topic.id, q.id, 'questionType', v as any)}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="multipleChoice">Trắc nghiệm</SelectItem>
                                                                <SelectItem value="trueFalse">Đúng/Sai</SelectItem>
                                                                <SelectItem value="shortAnswer">Trả lời ngắn</SelectItem>
                                                                <SelectItem value="essay">Tự luận</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell><Input className="w-16" value={q.count} onChange={e => handleQuestionConfigChange(topic.id, q.id, 'count', e.target.value)} /></TableCell>
                                                    <TableCell><Input className="w-16" value={q.points} onChange={e => handleQuestionConfigChange(topic.id, q.id, 'points', e.target.value)} /></TableCell>
                                                    <TableCell><Input className="w-12" value={q.distBiet} onChange={e => handleQuestionConfigChange(topic.id, q.id, 'distBiet', e.target.value)} /></TableCell>
                                                    <TableCell><Input className="w-12" value={q.distHieu} onChange={e => handleQuestionConfigChange(topic.id, q.id, 'distHieu', e.target.value)} /></TableCell>
                                                    <TableCell><Input className="w-12" value={q.distVd} onChange={e => handleQuestionConfigChange(topic.id, q.id, 'distVd', e.target.value)} /></TableCell>
                                                    <TableCell><Input className="w-12" value={q.distVdCao} onChange={e => handleQuestionConfigChange(topic.id, q.id, 'distVdCao', e.target.value)} /></TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="sm" onClick={() => handleRemoveQuestionConfig(topic.id, q.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <Button variant="outline" size="sm" className="mt-2" onClick={() => handleAddQuestionConfig(topic.id)}><Plus className="w-4 h-4 mr-2" />{t('examStructure.manual.addQuestionConfigButton')}</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <CognitiveSummaryTable stats={manualStats.cognitive} totalPoints={manualStats.totalPoints} />
                        <StructureSummaryTable stats={manualStats.structure} isNguVan={isNguVan} />
                         <TnTlDistributionTable stats={manualStats.tnTl} totalPoints={manualStats.totalPoints} isNguVan={isNguVan} />
                    </div>
                     {isLoading && activeMethod === 'manual' && (
                        <div className="flex items-center justify-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                            <span className="text-sm text-indigo-600 dark:text-indigo-300">{statusMessage}</span>
                        </div>
                    )}
                    <div className="mt-4 flex justify-between items-start">
                        <Button onClick={handleAddTopic}><Plus className="w-4 h-4 mr-2" />{t('examStructure.manual.addTopicButton')}</Button>
                        <div className="text-right">
                            <div className="font-bold text-lg">Tổng điểm toàn đề: {manualGenericTotalScore}</div>
                            {parseFloat(manualGenericTotalScore) !== scale && parseFloat(manualGenericTotalScore) > 0 && (
                                <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-md flex items-center justify-end gap-2">
                                    <Info size={16} />
                                    <span>{t('examStructure.scoreMismatchWarning', 'Tổng điểm ({totalScore}) chưa khớp với thang điểm ({scale}).', { totalScore: manualGenericTotalScore, scale: scale.toFixed(1) })}</span>
                                </div>
                            )}
                        </div>
                        <Button onClick={() => handleCreateExam('manual')} disabled={isLoading}>
                            {isLoading && activeMethod === 'manual' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            {isLoading && activeMethod === 'manual' ? t('examStructure.generatingButton') : t('examStructure.manual.generateButton')}
                        </Button>
                    </div>
                </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}