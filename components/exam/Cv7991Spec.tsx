import React from 'react';
import { GeneratedExamData, QuestionDistribution, TopicDetails } from '../../types';
import { AppSettings } from '../../contexts/SettingsContext';
import { ExamCreationState } from '../../contexts/ExamCreationContext';

const tableStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid black',
  borderCollapse: 'collapse',
  textAlign: 'center',
  fontSize: '11pt',
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

const footnoteStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: '10pt',
  marginTop: '8px',
  fontStyle: 'italic',
};

const renderLevel = (dist?: QuestionDistribution) => (
  <>
    <td style={tdStyle}>{dist?.biet || ''}</td>
    <td style={tdStyle}>{dist?.hieu || ''}</td>
    <td style={tdStyle}>{dist?.vd || ''}</td>
  </>
);

const sumLevels = (topics: TopicDetails[], key: keyof TopicDetails): QuestionDistribution => {
  return topics.reduce((acc, topic) => {
    const dist = topic[key] as QuestionDistribution;
    if (dist) {
      acc.biet += dist.biet || 0;
      acc.hieu += dist.hieu || 0;
      acc.vd += dist.vd || 0;
    }
    return acc;
  }, { biet: 0, hieu: 0, vd: 0 });
};

const calculatePoints = (dist: QuestionDistribution, pointsPerQuestion: number) => {
    return (dist.biet + dist.hieu + dist.vd) * pointsPerQuestion;
};

interface Cv7991SpecProps {
    data: GeneratedExamData | null;
    examSettings: ExamCreationState;
    generalSettings: AppSettings;
}

export const Cv7991Spec: React.FC<Cv7991SpecProps> = ({ data, examSettings, generalSettings }) => {
    const topics = data?.topics || [];
    
    const activeConfig = (examSettings.creationMethod === 'auto' || examSettings.creationMethod === 'semiAuto')
      ? examSettings[examSettings.creationMethod]
      : examSettings.auto; // Fallback

    const points = {
        mc: parseFloat(activeConfig.cauHoiTracNghiem.diem) || 0,
        tf: parseFloat(activeConfig.cauHoiDungSai.diem) || 0,
        sa: parseFloat(activeConfig.cauHoiTraLoiNgan.diem) || 0,
        essay: parseFloat(activeConfig.cauHoiTuLuan.diem) || 0, // Total essay points
    };
    const totalScale = parseFloat(generalSettings.scale) || 10;

    const totals = {
        multipleChoice: sumLevels(topics, 'multipleChoice'),
        trueFalse: sumLevels(topics, 'trueFalse'),
        shortAnswer: sumLevels(topics, 'shortAnswer'),
        essay: sumLevels(topics, 'essay'),
    };
    
    const totalPoints = {
        mc: calculatePoints(totals.multipleChoice, points.mc),
        tf: calculatePoints(totals.trueFalse, points.tf),
        sa: calculatePoints(totals.shortAnswer, points.sa),
        essay: points.essay,
    };
    
    // Calculate Row Spans for Topics/Chapters
    const rowSpans = new Map<number, number>();
    let currentTopicName = "";
    let startIndex = 0;

    topics.forEach((topic, index) => {
        const normalizedName = topic.topicName.trim();
        if (normalizedName !== currentTopicName) {
            currentTopicName = normalizedName;
            startIndex = index;
            rowSpans.set(startIndex, 1);
        } else {
            const currentSpan = rowSpans.get(startIndex) || 0;
            rowSpans.set(startIndex, currentSpan + 1);
            rowSpans.set(index, 0); // Hide this cell
        }
    });

    const TopicRow: React.FC<{ topic: TopicDetails; index: number; rowSpan: number }> = ({ topic, index, rowSpan }) => (
      <tr>
        <td style={tdStyle}>{index + 1}</td>
        {rowSpan > 0 && (
            <td style={{...tdStyle, textAlign: 'left', verticalAlign: 'middle'}} rowSpan={rowSpan}>
                {topic.topicName}
            </td>
        )}
        <td style={{...tdStyle, textAlign: 'left'}}>{topic.unit}</td>
        <td style={{...tdStyle, textAlign: 'left', whiteSpace: 'pre-wrap'}}>{topic.requirements}</td>
        {renderLevel(topic.multipleChoice)}
        {renderLevel(topic.trueFalse)}
        {renderLevel(topic.shortAnswer)}
        {renderLevel(topic.essay)}
      </tr>
    );

    const staticEmptyRows = [1, 2, '...'].map(i => (
        <tr key={`empty-${i}`}>
            <td style={tdStyle}>{i}</td>
            <td style={{...tdStyle, textAlign: 'left'}}>Chương/Chủ đề {i}</td>
            <td style={{...tdStyle, textAlign: 'left'}}>Bài học/Đơn vị {i}</td>
            <td style={{...tdStyle, textAlign: 'left'}} dangerouslySetInnerHTML={{ __html: "- Biết… <br />- Hiểu… <br />- Vận dụng…" }} />
            <td style={tdStyle}></td><td style={tdStyle}></td><td style={tdStyle}></td>
            <td style={tdStyle}></td><td style={tdStyle}></td><td style={tdStyle}></td>
            <td style={tdStyle}></td><td style={tdStyle}></td><td style={tdStyle}></td>
            <td style={tdStyle}></td><td style={tdStyle}></td><td style={tdStyle}></td>
        </tr>
    ));

    return (
        <div className="overflow-x-auto">
        <div className='text-center font-bold text-lg my-2 dark:text-gray-100'>BẢNG ĐẶC TẢ</div>
        <table style={tableStyle}>
            <thead>
            <tr>
                <th style={thStyle} rowSpan={2}>TT</th>
                <th style={thStyle} rowSpan={2} className="min-w-[120px]">Chủ đề/Chương</th>
                <th style={thStyle} rowSpan={2} className="min-w-[150px]">Nội dung/đơn vị kiến thức</th>
                <th style={thStyle} rowSpan={2} className="min-w-[200px]">Yêu cầu cần đạt</th>
                <th style={thStyle} colSpan={3}>TNKQ – Nhiều lựa chọn</th>
                <th style={thStyle} colSpan={3}>TNKQ – “Đúng - Sai”¹</th>
                <th style={thStyle} colSpan={3}>TNKQ – Trả lời ngắn²</th>
                <th style={thStyle} colSpan={3}>Tự luận</th>
            </tr>
            <tr>
                <th style={thStyle}>Biết</th><th style={thStyle}>Hiểu</th><th style={thStyle}>Vận dụng</th>
                <th style={thStyle}>Biết</th><th style={thStyle}>Hiểu</th><th style={thStyle}>Vận dụng</th>
                <th style={thStyle}>Biết</th><th style={thStyle}>Hiểu</th><th style={thStyle}>Vận dụng</th>
                <th style={thStyle}>Biết</th><th style={thStyle}>Hiểu</th><th style={thStyle}>Vận dụng</th>
            </tr>
            </thead>
            <tbody>
                {topics.length > 0 ? topics.map((topic, index) => (
                    <TopicRow key={topic.id} topic={topic} index={index} rowSpan={rowSpans.get(index) ?? 1} />
                )) : staticEmptyRows}
             <tr>
                <td style={{...tdStyle, ...thStyle}} colSpan={4}>Tổng số câu</td>
                {renderLevel(totals.multipleChoice)}
                {renderLevel(totals.trueFalse)}
                {renderLevel(totals.shortAnswer)}
                {renderLevel(totals.essay)}
            </tr>
            <tr>
                <td style={{...tdStyle, ...thStyle}} colSpan={4}>Tổng số điểm</td>
                <td style={tdStyle} colSpan={3}>{totalPoints.mc > 0 ? totalPoints.mc.toFixed(2) : ''}</td>
                <td style={tdStyle} colSpan={3}>{totalPoints.tf > 0 ? totalPoints.tf.toFixed(2) : ''}</td>
                <td style={tdStyle} colSpan={3}>{totalPoints.sa > 0 ? totalPoints.sa.toFixed(2) : ''}</td>
                <td style={tdStyle} colSpan={3}>{totalPoints.essay > 0 ? totalPoints.essay.toFixed(2) : ''}</td>
            </tr>
             <tr>
                <td style={{...tdStyle, ...thStyle}} colSpan={4}>Tỉ lệ %</td>
                <td style={tdStyle} colSpan={3}>{totalScale > 0 && totalPoints.mc > 0 ? `${(totalPoints.mc / totalScale * 100).toFixed(2)}%` : ''}</td>
                <td style={tdStyle} colSpan={3}>{totalScale > 0 && totalPoints.tf > 0 ? `${(totalPoints.tf / totalScale * 100).toFixed(2)}%` : ''}</td>
                <td style={tdStyle} colSpan={3}>{totalScale > 0 && totalPoints.sa > 0 ? `${(totalPoints.sa / totalScale * 100).toFixed(2)}%` : ''}</td>
                <td style={tdStyle} colSpan={3}>{totalScale > 0 && totalPoints.essay > 0 ? `${(totalPoints.essay / totalScale * 100).toFixed(2)}%` : ''}</td>
            </tr>
            </tbody>
        </table>
        <div style={footnoteStyle} className="dark:text-gray-300">
            <p>¹ Mỗi câu hỏi “Đúng – Sai” gồm 4 ý nhỏ, học sinh chọn đúng hoặc sai.</p>
            <p>² Với môn học không dùng dạng này, chuyển toàn bộ điểm cho loại “Đúng – Sai”.</p>
            <p>⁵ Có ở trong một số ô của bảng đặc tả, ghi tắt tên của <strong>năng lực</strong> (đã được quy định trong chương trình môn học hoặc hoạt động giáo dục).</p>
        </div>
        </div>
    );
};