import React from 'react';
import { ExamCreationState } from '../../contexts/ExamCreationContext';
import { NguVanDocHieuQuestion } from '../../types';

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

const leftAlign: React.CSSProperties = {
    textAlign: 'left',
};

export const NguVanSpec: React.FC<{ examSettings: ExamCreationState }> = ({ examSettings }) => {
    const { creationMethod, manual } = examSettings;

    // This component is mostly for manual mode where requirements are explicitly defined.
    const isManual = creationMethod === 'manual';

    const { nguVanDocHieuPart, nguVanVietPart } = manual;

    const { questions: docHieuQuestions } = nguVanDocHieuPart;
    const { questions: vietQuestions } = nguVanVietPart;

    const docHieuReqsByLevel = { biet: [] as string[], hieu: [] as string[], vd: [] as string[], vdc: [] as string[] };
    docHieuQuestions.forEach(q => {
        const levelKey = q.cognitiveLevel.toLowerCase().includes('cao') ? 'vdc'
                       : q.cognitiveLevel.toLowerCase().includes('dụng') ? 'vd'
                       : q.cognitiveLevel.toLowerCase().includes('hiểu') ? 'hieu'
                       : 'biet';
        const level = levelKey as keyof typeof docHieuReqsByLevel;
        if(isManual && q.requirements) docHieuReqsByLevel[level].push(q.requirements);
    });

    const docHieuCounts = {
        biet: docHieuQuestions.filter(q => q.cognitiveLevel === 'Nhận biết').length,
        hieu: docHieuQuestions.filter(q => q.cognitiveLevel === 'Thông hiểu').length,
        vd: docHieuQuestions.filter(q => q.cognitiveLevel === 'Vận dụng').length,
        vdc: docHieuQuestions.filter(q => q.cognitiveLevel === 'Vận dụng cao').length,
    };
    const docHieuPoints = docHieuQuestions.reduce((sum, q) => sum + (parseFloat(q.points) || 0), 0);
    
    const vietTotalQuestions = vietQuestions.length;
    const vietPoints = vietQuestions.reduce((sum, q) => sum + (parseFloat(q.pointsBiet) || 0) + (parseFloat(q.pointsHieu) || 0) + (parseFloat(q.pointsVd) || 0) + (parseFloat(q.pointsVdCao) || 0), 0);

    const totalPoints = docHieuPoints + vietPoints;

    const renderReqs = (reqs: string[]) => reqs.length > 0 ? `- ${reqs.join('\n- ')}` : '<chưa có>';

    const docHieuReqsHTML = `
        ${docHieuReqsByLevel.biet.length > 0 ? `<strong>Nhận biết:</strong><br/>${renderReqs(docHieuReqsByLevel.biet)}<br/>` : ''}
        ${docHieuReqsByLevel.hieu.length > 0 ? `<strong>Thông hiểu:</strong><br/>${renderReqs(docHieuReqsByLevel.hieu)}<br/>` : ''}
        ${docHieuReqsByLevel.vd.length > 0 ? `<strong>Vận dụng:</strong><br/>${renderReqs(docHieuReqsByLevel.vd)}<br/>` : ''}
        ${docHieuReqsByLevel.vdc.length > 0 ? `<strong>Vận dụng cao:</strong><br/>${renderReqs(docHieuReqsByLevel.vdc)}<br/>` : ''}
    `;
    
    const vietReqsHTML = `<strong>Viết bài văn nghị luận xã hội:</strong><br/>- ${vietQuestions.map(q => q.prompt).join('<br/>- ')}`;
    
  return (
    <div className="overflow-x-auto">
      <div className='text-center font-bold text-lg my-2 dark:text-gray-100'>BẢN ĐẶC TẢ</div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle} rowSpan={2}>TT</th>
            <th style={thStyle} rowSpan={2}>Kĩ năng</th>
            <th style={thStyle} rowSpan={2}>Nội dung kiến thức</th>
            <th style={thStyle} rowSpan={2}>Mức độ kiến thức, kĩ năng cần kiểm tra</th>
            <th style={thStyle} colSpan={4}>Số câu hỏi theo mức độ nhận thức</th>
            <th style={thStyle} rowSpan={2}>Tổng % điểm</th>
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
            <td style={{...tdStyle, ...leftAlign}}><strong>ĐỌC HIỂU</strong></td>
            <td style={{...tdStyle, ...leftAlign}}>Văn bản nghị luận hoặc văn bản thông tin</td>
            <td style={{...tdStyle, ...leftAlign, whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{__html: docHieuReqsHTML}}/>
            <td style={tdStyle}>{docHieuCounts.biet || ''}</td>
            <td style={tdStyle}>{docHieuCounts.hieu || ''}</td>
            <td style={tdStyle}>{docHieuCounts.vd || ''}</td>
            <td style={tdStyle}>{docHieuCounts.vdc || ''}</td>
            <td style={tdStyle}>{totalPoints > 0 ? `${(docHieuPoints / totalPoints * 100).toFixed(2)}%` : '40.00%'}</td>
          </tr>
          <tr>
            <td style={tdStyle}><strong>2</strong></td>
            <td style={{...tdStyle, ...leftAlign}}><strong>VIẾT</strong></td>
            <td style={{...tdStyle, ...leftAlign}}>Bài văn nghị luận xã hội</td>
            <td style={{...tdStyle, ...leftAlign, whiteSpace: 'pre-line'}} dangerouslySetInnerHTML={{__html: vietReqsHTML}}/>
            <td style={tdStyle} colSpan={4}>({vietTotalQuestions || '1'} câu)</td>
            <td style={tdStyle}>{totalPoints > 0 ? `${(vietPoints / totalPoints * 100).toFixed(2)}%` : '60.00%'}</td>
          </tr>
          <tr>
            <td style={{...tdStyle, fontWeight: 'bold'}} colSpan={4}>Tổng</td>
            <td style={tdStyle}>{docHieuCounts.biet || ''}</td>
            <td style={tdStyle}>{docHieuCounts.hieu || ''}</td>
            <td style={tdStyle}>{docHieuCounts.vd || ''}</td>
            <td style={tdStyle}>{docHieuCounts.vdc || ''}</td>
            <td style={tdStyle}>100%</td>
          </tr>
          <tr>
            <td style={{...tdStyle, fontWeight: 'bold'}} colSpan={4}>Tỉ lệ % điểm</td>
            <td style={tdStyle}></td>
            <td style={tdStyle}></td>
            <td style={tdStyle}></td>
            <td style={tdStyle}></td>
            <td style={tdStyle}>100%</td>
          </tr>
          <tr>
            <td style={{...tdStyle, fontWeight: 'bold'}} colSpan={4}>Tỉ lệ chung (%)</td>
            <td style={tdStyle} colSpan={2}></td>
            <td style={tdStyle} colSpan={2}></td>
            <td style={tdStyle}>100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};