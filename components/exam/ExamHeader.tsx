import React from 'react';

interface ExamHeaderProps {
  province?: string;
  school?: string;
  group?: string;
  year?: string;
  subject?: string;
  grade?: string;
  duration?: number;
  questionCount?: number;
  examType?: string;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
  province = "[TỈNH/THÀNH PHỐ]",
  school = "[TÊN TRƯỜNG]",
  group = "[TỔ CHUYÊN MÔN]",
  year = "202X – 202Y",
  subject = "[MÔN HỌC]",
  grade = "[KHỐI]",
  duration = 0,
  questionCount,
  examType = "ĐỀ KIỂM TRA"
}) => {
  return (
    <table style={{ width: '100%', border: 'none', borderCollapse: 'collapse' }}>
      <tbody>
        <tr>
          <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top', padding: '0 8px', border: 'none' }}>
            <div style={{ textTransform: 'uppercase' }}><strong>SỞ GD & ĐT {province}</strong></div>
            <div style={{ textTransform: 'uppercase' }}><strong>TRƯỜNG {school}</strong></div>
            <div style={{ textTransform: 'uppercase' }}><strong>TỔ {group}</strong></div>
          </td>
          <td style={{ width: '50%', textAlign: 'center', verticalAlign: 'top', padding: '0 8px', border: 'none' }}>
            <div style={{ textTransform: 'uppercase' }}><strong>{examType}</strong></div>
            <div style={{ textTransform: 'uppercase' }}><strong>NĂM HỌC {year}</strong></div>
            <div style={{ textTransform: 'uppercase' }}><strong>MÔN: {subject} - KHỐI {grade}</strong></div>
            <div style={{ fontStyle: 'italic' }}>
              Thời gian làm bài: {duration} phút;{questionCount && questionCount > 0 ? ` (Đề có ${questionCount} câu)` : ''}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
};
