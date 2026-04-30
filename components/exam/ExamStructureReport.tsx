import React from 'react';
import { ExamCreationState } from '../../contexts/ExamCreationContext';
import { AppSettings } from '../../contexts/SettingsContext';
import { ExamHeader } from '../exam/ExamHeader';

interface ExamStructureReportProps {
    examSettings: ExamCreationState;
    generalSettings: AppSettings;
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid black',
  borderCollapse: 'collapse',
  textAlign: 'center',
  fontSize: '11pt',
  fontFamily: '"Times New Roman", serif',
  marginTop: '16px',
};

const thStyle: React.CSSProperties = {
  border: '1px solid black',
  padding: '6px',
  fontWeight: 'bold',
  backgroundColor: '#f2f2f2',
};

const tdStyle: React.CSSProperties = {
  border: '1px solid black',
  padding: '6px',
};

const leftTdStyle: React.CSSProperties = {
    ...tdStyle,
    textAlign: 'left',
};

const h4Style: React.CSSProperties = {
    fontWeight: 'bold',
    marginTop: '16px',
    marginBottom: '8px',
    fontSize: '13pt',
};

const ExamStructureReport: React.FC<ExamStructureReportProps> = ({ examSettings, generalSettings }) => {
    const { creationMethod, auto, semiAuto, manual } = examSettings;
    const isNguVanMode = generalSettings.subject === 'Ngữ văn';

    const matrixTypeMap: { [key: string]: string } = {
        'm1': 'Tiểu học',
        'm2': 'CV 7991',
        'm3': 'Ngữ văn (TN THPT 2025)',
        'm4': 'Tải lên'
    };

    const creationMethodMap: { [key: string]: string } = {
        'auto': 'Tự động (AI)',
        'semiAuto': 'Bán tự động (File)',
        'manual': 'Thủ công'
    };
    
    const renderManualStructure = () => (
        <>
            <h4 style={h4Style}>BẢNG CHI TIẾT CÁC CHỦ ĐỀ</h4>
            {manual.manualTopics.map((topic, index) => (
                <div key={topic.id} style={{ marginBottom: '24px', pageBreakInside: 'avoid' }}>
                    <h5 style={{ fontWeight: 'bold', fontSize: '12pt' }}>{index + 1}. Chủ đề: {topic.topicName}</h5>
                    <p style={{ fontSize: '11pt', fontStyle: 'italic' }}><strong>Yêu cầu cần đạt:</strong> {topic.requirements}</p>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Loại câu hỏi</th>
                                <th style={thStyle}>Số câu</th>
                                <th style={thStyle}>Điểm/câu</th>
                                <th style={thStyle}>NB</th>
                                <th style={thStyle}>TH</th>
                                <th style={thStyle}>VD</th>
                                <th style={thStyle}>VDC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topic.questions.length > 0 ? topic.questions.map(q => (
                                <tr key={q.id}>
                                    <td style={leftTdStyle}>{q.questionType.replace('multipleChoice', 'Trắc nghiệm').replace('essay', 'Tự luận')}</td>
                                    <td style={tdStyle}>{q.count}</td>
                                    <td style={tdStyle}>{q.points}</td>
                                    <td style={tdStyle}>{q.distBiet}</td>
                                    <td style={tdStyle}>{q.distHieu}</td>
                                    <td style={tdStyle}>{q.distVd}</td>
                                    <td style={tdStyle}>{q.distVdCao}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td style={tdStyle} colSpan={7}>Chưa có cấu hình câu hỏi cho chủ đề này.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ))}
        </>
    );

    const renderNguVanManualStructure = () => (
        <>
            <h4 style={h4Style}>PHẦN I: ĐỌC HIỂU</h4>
            <p style={{ fontSize: '11pt' }}><strong>Ngữ liệu:</strong> {manual.nguVanDocHieuPart.passage ? 'Đã cung cấp' : 'Chưa cung cấp'}</p>
            <table style={tableStyle}>
                <thead><tr><th style={thStyle}>Câu</th><th style={thStyle}>Mức độ</th><th style={thStyle}>Điểm</th><th style={thStyle}>Yêu cầu cần đạt</th></tr></thead>
                <tbody>{manual.nguVanDocHieuPart.questions.map((q, i) => (<tr key={q.id}><td style={tdStyle}>{i+1}</td><td style={tdStyle}>{q.cognitiveLevel}</td><td style={tdStyle}>{q.points}</td><td style={leftTdStyle}>{q.requirements}</td></tr>))}</tbody>
            </table>

            <h4 style={h4Style}>PHẦN II: VIẾT</h4>
            <p style={{ fontSize: '11pt' }}><strong>Mô tả yêu cầu chung:</strong> {manual.nguVanVietPart.promptDescription}</p>
            <table style={tableStyle}>
                 <thead><tr><th style={thStyle}>Câu</th><th style={thStyle}>Yêu cầu</th><th style={thStyle}>Điểm NB</th><th style={thStyle}>Điểm TH</th><th style={thStyle}>Điểm VD</th><th style={thStyle}>Điểm VDC</th></tr></thead>
                <tbody>{manual.nguVanVietPart.questions.map((q, i) => (<tr key={q.id}><td style={tdStyle}>{i+1}</td><td style={leftTdStyle}>{q.prompt}</td><td style={tdStyle}>{q.pointsBiet}</td><td style={tdStyle}>{q.pointsHieu}</td><td style={tdStyle}>{q.pointsVd}</td><td style={tdStyle}>{q.pointsVdCao}</td></tr>))}</tbody>
            </table>
        </>
    );

    const renderNguVanAutoStructure = () => {
        const config = creationMethod === 'semiAuto' ? semiAuto : auto;
        return (
            <>
                {config.aiPrompt && (
                    <>
                        <h4 style={h4Style}>PHẠM VI KIẾN THỨC (YÊU CẦU AI)</h4>
                        <p style={{...leftTdStyle, border: '1px dashed #ccc', padding: '8px', whiteSpace: 'pre-wrap'}}>{config.aiPrompt}</p>
                    </>
                )}
    
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Phần</th>
                            <th style={thStyle}>Số lượng câu hỏi</th>
                            <th style={thStyle}>Tổng điểm</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={leftTdStyle}><strong>I. Đọc hiểu</strong></td>
                            <td style={tdStyle}>{config.nguVanTuDongDocHieuPart.soCau}</td>
                            <td style={tdStyle}>{config.nguVanTuDongDocHieuPart.tongDiem}</td>
                        </tr>
                        <tr>
                            <td style={leftTdStyle}><strong>II. Viết</strong></td>
                            <td style={tdStyle}>{config.nguVanTuDongVietPart.soCau}</td>
                            <td style={tdStyle}>{config.nguVanTuDongVietPart.tongDiem}</td>
                        </tr>
                    </tbody>
                </table>
            </>
        );
    }

    const renderAutoStructure = () => {
        const config = creationMethod === 'semiAuto' ? semiAuto : auto;
        return (
            <>
                <h4 style={h4Style}>PHẠM VI KIẾN THỨC (YÊU CẦU AI)</h4>
                <p style={{...leftTdStyle, border: '1px dashed #ccc', padding: '8px', whiteSpace: 'pre-wrap'}}>{config.aiPrompt}</p>
            </>
        )
    }

    const activeConfig = (creationMethod === 'auto' || creationMethod === 'semiAuto') ? examSettings[creationMethod] : auto;

    return (
        <div style={{ padding: '20px', color: 'black', backgroundColor: 'white' }}>
            <ExamHeader 
                province={generalSettings.province.toUpperCase()}
                school={generalSettings.school.toUpperCase()}
                examType="BÁO CÁO CẤU TRÚC ĐỀ THI"
                subject={generalSettings.subject.toUpperCase()}
                grade={generalSettings.grade}
                year={generalSettings.year}
            />

            <h4 style={h4Style}>I. THÔNG TIN CHUNG</h4>
            <table style={tableStyle}>
                <tbody>
                    <tr>
                        <td style={leftTdStyle}><strong>Kiểu Ma trận:</strong></td>
                        <td style={leftTdStyle}>{matrixTypeMap[activeConfig.matrixType]}</td>
                        <td style={leftTdStyle}><strong>Phương thức tạo:</strong></td>
                        <td style={leftTdStyle}>{creationMethodMap[creationMethod]}</td>
                    </tr>
                </tbody>
            </table>

            <h4 style={h4Style}>II. PHÂN BỔ TỔNG QUÁT</h4>
             <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>Phân bổ</th>
                        <th style={thStyle}>Tỉ lệ / Số lượng</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={leftTdStyle}><strong>Tỉ lệ % điểm TN / TL:</strong></td>
                        <td style={tdStyle}>{activeConfig.distTrinhLuan}</td>
                    </tr>
                    <tr>
                        <td style={leftTdStyle}><strong>Nhận biết (%):</strong></td>
                        <td style={tdStyle}>{activeConfig.distNhanBiet}</td>
                    </tr>
                     <tr>
                        <td style={leftTdStyle}><strong>Thông hiểu (%):</strong></td>
                        <td style={tdStyle}>{activeConfig.distThongHieu}</td>
                    </tr>
                     <tr>
                        <td style={leftTdStyle}><strong>Vận dụng (%):</strong></td>
                        <td style={tdStyle}>{activeConfig.distVanDung}</td>
                    </tr>
                     <tr>
                        <td style={leftTdStyle}><strong>Vận dụng cao (%):</strong></td>
                        <td style={tdStyle}>{activeConfig.distVdCao}</td>
                    </tr>
                </tbody>
            </table>

             <h4 style={h4Style}>III. CHI TIẾT CẤU TRÚC</h4>
             {(() => {
                if (creationMethod === 'manual') {
                    return isNguVanMode ? renderNguVanManualStructure() : renderManualStructure();
                }
                if (creationMethod === 'auto' || creationMethod === 'semiAuto') {
                    return isNguVanMode ? renderNguVanAutoStructure() : renderAutoStructure();
                }
                return <p>Chưa chọn phương thức tạo chi tiết.</p>;
             })()}
        </div>
    );
};

export default ExamStructureReport;