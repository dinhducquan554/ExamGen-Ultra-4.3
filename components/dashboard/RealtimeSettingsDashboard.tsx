import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Sliders } from '../icons';
import { useSettings } from '../../hooks/useSettings';
import { useExamCreation } from '../../hooks/useExamCreation';

const InfoRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-100 dark:border-slate-800 last:border-none">
        <span className="text-slate-500 dark:text-slate-400">{label}</span>
        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{value}</span>
    </div>
);

export default function RealtimeSettingsDashboard() {
    const { settings } = useSettings();
    const { examSettings } = useExamCreation();

    const creationMethod = examSettings.creationMethod;
    const isManual = creationMethod === 'manual';
    const activeConfig = (creationMethod === 'auto' || creationMethod === 'semiAuto') ? examSettings[creationMethod] : examSettings.auto;

    const creationMethodMap = {
        'auto': 'Tự động (AI)',
        'semiAuto': 'Bán tự động',
        'manual': 'Thủ công'
    };

    const matrixTypeMap: { [key: string]: string } = {
        'm1': 'Tiểu học',
        'm2': 'CV 7991',
        'm3': 'Ngữ văn',
        'm4': 'Tải lên'
    };
    
    const cognitiveDist = isManual 
        ? 'Định nghĩa theo từng chủ đề' 
        : `${activeConfig.distNhanBiet}% / ${activeConfig.distThongHieu}% / ${activeConfig.distVanDung}% / ${activeConfig.distVdCao}%`;

    let questionStructure: React.ReactNode = 'Định nghĩa theo từng chủ đề';
    if (!isManual) {
      if (settings.subject === 'Ngữ văn') {
          const docHieuCount = activeConfig.nguVanTuDongDocHieuPart.soCau;
          const vietCount = activeConfig.nguVanTuDongVietPart.soCau;
          questionStructure = `Đọc hiểu: ${docHieuCount} | Viết: ${vietCount}`;
      } else {
          const parts = [];
          if (parseInt(activeConfig.cauHoiTracNghiem.cau) > 0) parts.push(`TN: ${activeConfig.cauHoiTracNghiem.cau}`);
          if (parseInt(activeConfig.cauHoiDungSai.cau) > 0) parts.push(`Đ/S: ${activeConfig.cauHoiDungSai.cau}`);
          if (parseInt(activeConfig.cauHoiTraLoiNgan.cau) > 0) parts.push(`TLN: ${activeConfig.cauHoiTraLoiNgan.cau}`);
          if (parseInt(activeConfig.cauHoiTuLuan.cau) > 0) parts.push(`TL: ${activeConfig.cauHoiTuLuan.cau}`);
          questionStructure = parts.join(' | ');
      }
    }
    
    return (
        <Card className="shadow-lg border-none bg-white dark:bg-slate-900">
            <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sliders className="text-indigo-500"/>
                    Cập nhật thông tin trực tiếp
                </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-4 space-y-1">
                <InfoRow label="Môn học" value={settings.subject || 'Chưa chọn'} />
                <InfoRow label="Chế độ ra đề" value={creationMethodMap[creationMethod]} />
                <InfoRow label="Kiểu Ma trận" value={isManual ? 'Không áp dụng' : matrixTypeMap[activeConfig.matrixType]} />
                <InfoRow label="Phân bổ (NB/TH/VD/VDC)" value={cognitiveDist} />
                <InfoRow label="Cấu trúc câu hỏi" value={questionStructure || 'Chưa có'} />
            </CardContent>
        </Card>
    );
}