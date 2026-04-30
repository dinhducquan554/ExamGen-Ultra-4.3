import React from 'react';
import { ExamCreationState } from '../../contexts/ExamCreationContext';

const tableStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid black',
  borderCollapse: 'collapse',
  textAlign: 'center',
  fontSize: '12pt',
  fontFamily: 'Times New Roman, serif',
};

const thStyle: React.CSSProperties = {
  border: '1px solid black',
  padding: '4px',
  fontWeight: 'bold',
};

const tdStyle: React.CSSProperties = {
  border: '1px solid black',
  padding: '4px',
};

export const NguVanMatrix: React.FC<{ examSettings: ExamCreationState }> = ({ examSettings }) => {
    const { creationMethod, auto, semiAuto, manual } = examSettings;

    const isAutoOrSemi = creationMethod === 'auto' || creationMethod === 'semiAuto';
    const activeConfig = isAutoOrSemi ? examSettings[creationMethod] : auto; // for percentages

    let docHieuTotalQuestions: number, docHieuPoints: number, vietTotalQuestions: number, vietTotalPoints: number;
    let docHieuCounts = { biet: 0, hieu: 0, vd: 0, vdc: 0 };
    let vietPointsByLevel = { biet: 0, hieu: 0, vd: 0, vdc: 0 };
    let totalPointsPerLevel = { biet: 0, hieu: 0, vd: 0, vdc: 0 };
    let totalQuestionsPerLevel = { biet: 0, hieu: 0, vd: 0, vdc: 0 };

    if (isAutoOrSemi) {
        const config = examSettings[creationMethod];
        docHieuTotalQuestions = parseInt(config.nguVanTuDongDocHieuPart.soCau, 10) || 0;
        docHieuPoints = parseFloat(config.nguVanTuDongDocHieuPart.tongDiem) || 0;
        vietTotalQuestions = parseInt(config.nguVanTuDongVietPart.soCau, 10) || 0;
        vietTotalPoints = parseFloat(config.nguVanTuDongVietPart.tongDiem) || 0;
        // Per-level question counts are not user-defined, so they remain 0
    } else { // Manual mode
        const docHieuQuestions = manual.nguVanDocHieuPart.questions;
        const vietQuestions = manual.nguVanVietPart.questions;

        docHieuCounts = {
            biet: docHieuQuestions.filter(q => q.cognitiveLevel === 'Nhận biết').length,
            hieu: docHieuQuestions.filter(q => q.cognitiveLevel === 'Thông hiểu').length,
            vd: docHieuQuestions.filter(q => q.cognitiveLevel === 'Vận dụng').length,
            vdc: docHieuQuestions.filter(q => q.cognitiveLevel === 'Vận dụng cao').length,
        };
        docHieuTotalQuestions = docHieuQuestions.length;
        docHieuPoints = docHieuQuestions.reduce((sum, q) => sum + (parseFloat(q.points) || 0), 0);

        vietTotalQuestions = vietQuestions.length;
        vietPointsByLevel = vietQuestions.reduce((acc, q) => {
            acc.biet += parseFloat(q.pointsBiet) || 0;
            acc.hieu += parseFloat(q.pointsHieu) || 0;
            acc.vd += parseFloat(q.pointsVd) || 0;
            acc.vdc += parseFloat(q.pointsVdCao) || 0;
            return acc;
        }, { biet: 0, hieu: 0, vd: 0, vdc: 0 });
        vietTotalPoints = vietPointsByLevel.biet + vietPointsByLevel.hieu + vietPointsByLevel.vd + vietPointsByLevel.vdc;

        totalQuestionsPerLevel = {
            biet: docHieuCounts.biet,
            hieu: docHieuCounts.hieu,
            vd: docHieuCounts.vd,
            vdc: docHieuCounts.vdc,
        };

        totalPointsPerLevel = {
            biet: vietPointsByLevel.biet + docHieuQuestions.filter(q => q.cognitiveLevel === 'Nhận biết').reduce((s, q) => s + (parseFloat(q.points) || 0), 0),
            hieu: vietPointsByLevel.hieu + docHieuQuestions.filter(q => q.cognitiveLevel === 'Thông hiểu').reduce((s, q) => s + (parseFloat(q.points) || 0), 0),
            vd: vietPointsByLevel.vd + docHieuQuestions.filter(q => q.cognitiveLevel === 'Vận dụng').reduce((s, q) => s + (parseFloat(q.points) || 0), 0),
            vdc: vietPointsByLevel.vdc + docHieuQuestions.filter(q => q.cognitiveLevel === 'Vận dụng cao').reduce((s, q) => s + (parseFloat(q.points) || 0), 0),
        };
    }
    
    const totalPoints = docHieuPoints + vietTotalPoints;
    const grandTotalQuestions = docHieuTotalQuestions + vietTotalQuestions;

    if (isAutoOrSemi) {
        // Calculate points per level based on overall distribution percentages for Auto/Semi-Auto
        totalPointsPerLevel = {
            biet: totalPoints * (parseFloat(activeConfig.distNhanBiet) / 100),
            hieu: totalPoints * (parseFloat(activeConfig.distThongHieu) / 100),
            vd: totalPoints * (parseFloat(activeConfig.distVanDung) / 100),
            vdc: totalPoints * (parseFloat(activeConfig.distVdCao) / 100),
        };
    }

  return (
    <div className="overflow-x-auto">
        <div className='text-center font-bold text-lg my-2 dark:text-gray-100'>MA TRẬN</div>
        <table style={tableStyle}>
            <thead>
                <tr>
                    <th style={thStyle} rowSpan={3}>TT</th>
                    <th style={thStyle} rowSpan={3}>Kĩ năng</th>
                    <th style={thStyle} rowSpan={3}>Nội dung kiến thức / Đơn vị kĩ năng</th>
                    <th style={thStyle} colSpan={5}>Mức độ nhận thức</th>
                    <th style={thStyle} rowSpan={3}>Tổng % điểm</th>
                </tr>
                <tr>
                    <th style={thStyle} colSpan={4}>Hình thức câu hỏi</th>
                    <th style={thStyle} rowSpan={2}>Tổng</th>
                </tr>
                <tr>
                    <th style={thStyle}>Nhận biết</th>
                    <th style={thStyle}>Thông hiểu</th>
                    <th style={thStyle}>Vận dụng</th>
                    <th style={thStyle}>Vận dụng cao</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style={tdStyle}><strong>1</strong></td>
                    <td style={{...tdStyle, textAlign: 'left'}}><strong>Đọc hiểu</strong></td>
                    <td style={{...tdStyle, textAlign: 'left'}}>Văn bản nghị luận (chính trị, xã hội, văn hóa) hoặc văn bản thông tin</td>
                    <td style={tdStyle}>{isAutoOrSemi ? '' : docHieuCounts.biet || ''}</td>
                    <td style={tdStyle}>{isAutoOrSemi ? '' : docHieuCounts.hieu || ''}</td>
                    <td style={tdStyle}>{isAutoOrSemi ? '' : docHieuCounts.vd || ''}</td>
                    <td style={tdStyle}>{isAutoOrSemi ? '' : docHieuCounts.vdc || ''}</td>
                    <td style={tdStyle}>{docHieuTotalQuestions || ''}</td>
                    <td style={tdStyle}>{totalPoints > 0 ? `${(docHieuPoints / totalPoints * 100).toFixed(2)}%` : '40.00%'}</td>
                </tr>
                <tr>
                    <td style={tdStyle}><strong>2</strong></td>
                    <td style={{...tdStyle, textAlign: 'left'}}><strong>Viết</strong></td>
                    <td style={{...tdStyle, textAlign: 'left'}}>Viết bài văn nghị luận về một vấn đề xã hội</td>
                    <td style={tdStyle}></td>
                    <td style={tdStyle}></td>
                    <td style={tdStyle}></td>
                    <td style={tdStyle}></td>
                    <td style={tdStyle}>{vietTotalQuestions || ''}</td>
                    <td style={tdStyle}>{totalPoints > 0 ? `${(vietTotalPoints / totalPoints * 100).toFixed(2)}%` : '60.00%'}</td>
                </tr>
                <tr>
                    <td style={{...tdStyle, fontWeight: 'bold'}} colSpan={3}>Tổng</td>
                    <td style={tdStyle}>{totalQuestionsPerLevel.biet || ''}</td>
                    <td style={tdStyle}>{totalQuestionsPerLevel.hieu || ''}</td>
                    <td style={tdStyle}>{totalQuestionsPerLevel.vd || ''}</td>
                    <td style={tdStyle}>{totalQuestionsPerLevel.vdc || ''}</td>
                    <td style={tdStyle}>{grandTotalQuestions || ''}</td>
                    <td style={tdStyle}><strong>100%</strong></td>
                </tr>
                 <tr>
                    <td style={{...tdStyle, fontWeight: 'bold'}} colSpan={3}>Tỉ lệ chung (%)</td>
                    <td style={tdStyle}>{totalPoints > 0 ? `${(totalPointsPerLevel.biet / totalPoints * 100).toFixed(2)}%` : ''}</td>
                    <td style={tdStyle}>{totalPoints > 0 ? `${(totalPointsPerLevel.hieu / totalPoints * 100).toFixed(2)}%` : ''}</td>
                    <td style={tdStyle}>{totalPoints > 0 ? `${(totalPointsPerLevel.vd / totalPoints * 100).toFixed(2)}%` : ''}</td>
                    <td style={tdStyle}>{totalPoints > 0 ? `${(totalPointsPerLevel.vdc / totalPoints * 100).toFixed(2)}%` : ''}</td>
                    <td style={tdStyle}></td>
                    <td style={tdStyle}><strong>100%</strong></td>
                </tr>
            </tbody>
        </table>
    </div>
  );
};