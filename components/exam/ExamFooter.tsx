import React from 'react';

interface ExamFooterProps {
  place?: string;
  vicePrincipalName?: string;
  groupLeaderName?: string;
  creatorName?: string;
}

export const ExamFooter: React.FC<ExamFooterProps> = ({
  place = "[Nơi ký]",
  vicePrincipalName = "[Tên P. Hiệu trưởng]",
  groupLeaderName = "[Tên Tổ trưởng]",
  creatorName = "[Tên người ra đề]",
}) => {
  const today = new Date();
  const dateString = `ngày ${String(today.getDate()).padStart(2, '0')} tháng ${String(today.getMonth() + 1).padStart(2, '0')} năm ${today.getFullYear()}`;

  return (
    <div>
      <div style={{ width: '100%', fontStyle: 'italic', paddingBottom: '8px', textAlign: 'right' }}>
        {place}, {dateString}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
        <tbody>
          <tr>
            <td style={{ width: '33.33%', verticalAlign: 'top', padding: '4px', textAlign: 'center', border: 'none' }}>
              <strong>KÝ THAY HIỆU TRƯỞNG</strong>
              <div><strong>PHÓ HIỆU TRƯỞNG</strong></div>
              <div style={{ fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</div>
              <div style={{ height: '60px' }}></div>
              <strong>{vicePrincipalName}</strong>
            </td>
            <td style={{ width: '33.33%', verticalAlign: 'top', padding: '4px', textAlign: 'center', border: 'none' }}>
              <strong>DUYỆT CỦA TỔ CHUYÊN MÔN</strong>
              <div><strong>TỔ TRƯỞNG</strong></div>
              <div style={{ fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</div>
              <div style={{ height: '60px' }}></div>
              <strong>{groupLeaderName}</strong>
            </td>
            <td style={{ width: '33.33%', verticalAlign: 'top', padding: '4px', textAlign: 'center', border: 'none' }}>
              <strong>NGƯỜI RA ĐỀ</strong>
              <div style={{ height: '21px' }}>&nbsp;</div> {/* Spacer to align with other columns */}
              <div style={{ fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</div>
              <div style={{ height: '60px' }}></div>
              <strong>{creatorName}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
