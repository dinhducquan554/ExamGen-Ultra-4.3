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
  height: '28px'
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

interface Cv7991MatrixProps {
    data: GeneratedExamData | null;
    examSettings: ExamCreationState;
    generalSettings: AppSettings;
}

export const Cv7991Matrix: React.FC<Cv7991MatrixProps> = ({ data, examSettings, generalSettings }) => {
  const topics = data?.topics || [];
  
  const activeConfig = (examSettings.creationMethod === 'auto' || examSettings.creationMethod === 'semiAuto')
    ? examSettings[examSettings.creationMethod]
    : examSettings.auto; 

  const points = {
    mc: parseFloat(activeConfig.cauHoiTracNghiem.diem) || 0,
    tf: parseFloat(activeConfig.cauHoiDungSai.diem) || 0,
    sa: parseFloat(activeConfig.cauHoiTraLoiNgan.diem) || 0,
    essay: parseFloat(activeConfig.cauHoiTuLuan.diem) || 0, 
  };
  const totalScale = parseFloat(generalSettings.scale) || 10;
  
  const totals = {
    multipleChoice: sumLevels(topics, 'multipleChoice'),
    trueFalse: sumLevels(topics, 'trueFalse'),
    shortAnswer: sumLevels(topics, 'shortAnswer'),
    essay: sumLevels(topics, 'essay'),
  };

  const totalEssayQuestions = totals.essay.biet + totals.essay.hieu + totals.essay.vd;
  const pointsPerEssay = totalEssayQuestions > 0 ? points.essay / totalEssayQuestions : 0;
  
  const grandTotals = {
    biet: totals.multipleChoice.biet + totals.trueFalse.biet + totals.shortAnswer.biet + totals.essay.biet,
    hieu: totals.multipleChoice.hieu + totals.trueFalse.hieu + totals.shortAnswer.hieu + totals.essay.hieu,
    vd: totals.multipleChoice.vd + totals.trueFalse.vd + totals.shortAnswer.vd + totals.essay.vd,
  }

  const totalPoints = {
    mc: calculatePoints(totals.multipleChoice, points.mc),
    tf: calculatePoints(totals.trueFalse, points.tf),
    sa: calculatePoints(totals.shortAnswer, points.sa),
    essay: points.essay,
  };

  const totalPointsByLevel = {
      biet: (totals.multipleChoice.biet * points.mc) + (totals.trueFalse.biet * points.tf) + (totals.shortAnswer.biet * points.sa) + (totals.essay.biet * pointsPerEssay),
      hieu: (totals.multipleChoice.hieu * points.mc) + (totals.trueFalse.hieu * points.tf) + (totals.shortAnswer.hieu * points.sa) + (totals.essay.hieu * pointsPerEssay),
      vd: (totals.multipleChoice.vd * points.mc) + (totals.trueFalse.vd * points.tf) + (totals.shortAnswer.vd * points.sa) + (totals.essay.vd * pointsPerEssay),
  };
  
  const grandTotalPoints = totalPointsByLevel.biet + totalPointsByLevel.hieu + totalPointsByLevel.vd;

  // Calculate Row Spans for Topics/Chapters
  const rowSpans = new Map<number, number>();
  let currentTopicName = "";
  let startIndex = 0;

  topics.forEach((topic, index) => {
      // Normalize topic name to handle slight variations if any, though ID usually better but here name is visual grouper
      const normalizedName = topic.topicName.trim(); 
      if (normalizedName !== currentTopicName) {
          currentTopicName = normalizedName;
          startIndex = index;
          rowSpans.set(startIndex, 1);
      } else {
          const currentSpan = rowSpans.get(startIndex) || 0;
          rowSpans.set(startIndex, currentSpan + 1);
          rowSpans.set(index, 0); // 0 means this cell will be hidden
      }
  });

  const TopicRow: React.FC<{ topic: TopicDetails; index: number; rowSpan: number }> = ({ topic, index, rowSpan }) => {
    const totalTopic = {
      biet: (topic.multipleChoice?.biet || 0) + (topic.trueFalse?.biet || 0) + (topic.shortAnswer?.biet || 0) + (topic.essay?.biet || 0),
      hieu: (topic.multipleChoice?.hieu || 0) + (topic.trueFalse?.hieu || 0) + (topic.shortAnswer?.hieu || 0) + (topic.essay?.hieu || 0),
      vd: (topic.multipleChoice?.vd || 0) + (topic.trueFalse?.vd || 0) + (topic.shortAnswer?.vd || 0) + (topic.essay?.vd || 0),
    };

    const totalPointsTopic = 
        calculatePoints(topic.multipleChoice, points.mc) +
        calculatePoints(topic.trueFalse, points.tf) +
        calculatePoints(topic.shortAnswer, points.sa) +
        calculatePoints(topic.essay, pointsPerEssay);

    const percentageTopic = totalScale > 0 ? (totalPointsTopic / totalScale) * 100 : 0;

    return (
      <tr>
        <td style={tdStyle}>{index + 1}</td>
        {rowSpan > 0 && (
            <td style={{...tdStyle, textAlign: 'left', verticalAlign: 'middle'}} rowSpan={rowSpan}>
                {topic.topicName}
            </td>
        )}
        <td style={{...tdStyle, textAlign: 'left'}}>{topic.unit}</td>
        {renderLevel(topic.multipleChoice)}
        {renderLevel(topic.trueFalse)}
        {renderLevel(topic.shortAnswer)}
        {renderLevel(topic.essay)}
        {renderLevel(totalTopic)}
        <td style={tdStyle}>{percentageTopic > 0 ? `${percentageTopic.toFixed(2)}%` : ''}</td>
      </tr>
    );
  };

  const staticEmptyRows = [1, 2, '...'].map(i => (
    <tr key={`empty-${i}`}>
      <td style={tdStyle}>{i}</td>
      <td style={{...tdStyle, textAlign: 'left'}}>Chương/Chủ đề {i}</td>
      <td style={{...tdStyle, textAlign: 'left'}}>Bài học/Nội dung {i}</td>
      <td style={tdStyle}></td>
      <td style={tdStyle}></td><td style={tdStyle}></td><td style={tdStyle}></td>
      <td style={tdStyle}></td><td style={tdStyle}></td><td style={tdStyle}></td>
      <td style={tdStyle}></td><td style={tdStyle}></td><td style={tdStyle}></td>
      <td style={tdStyle}></td><td style={tdStyle}></td><td style={tdStyle}></td>
      <td style={tdStyle}></td><td style={tdStyle}></td><td style={tdStyle}></td>
      <td style={tdStyle}></td>
    </tr>
  ));

  return (
    <div className="overflow-x-auto">
      <div className='text-center font-bold text-lg my-2 dark:text-gray-100'>MA TRẬN</div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle} rowSpan={2}>TT</th>
            <th style={thStyle} rowSpan={2} className="min-w-[120px]">Chủ đề/Chương</th>
            <th style={thStyle} rowSpan={2} className="min-w-[150px]">Nội dung/đơn vị kiến thức</th>
            <th style={thStyle} colSpan={3}>TNKQ – Nhiều lựa chọn</th>
            <th style={thStyle} colSpan={3}>TNKQ – “Đúng - Sai”¹</th>
            <th style={thStyle} colSpan={3}>TNKQ – Trả lời ngắn²</th>
            <th style={thStyle} colSpan={3}>Tự luận</th>
            <th style={thStyle} colSpan={3}>Tổng</th>
            <th style={thStyle} rowSpan={2} className="min-w-[80px]">Tỉ lệ % điểm</th>
          </tr>
          <tr>
            <th style={thStyle}>Biết</th><th style={thStyle}>Hiểu</th><th style={thStyle}>Vận dụng</th>
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
            <td style={{...tdStyle, ...thStyle}} colSpan={3}>Tổng số câu</td>
            {renderLevel(totals.multipleChoice)}
            {renderLevel(totals.trueFalse)}
            {renderLevel(totals.shortAnswer)}
            {renderLevel(totals.essay)}
            {renderLevel(grandTotals)}
            <td style={tdStyle}>{grandTotalPoints.toFixed(2)}</td>
          </tr>
           <tr>
            <td style={{...tdStyle, ...thStyle}} colSpan={3}>Tổng số điểm</td>
            <td style={tdStyle} colSpan={3}>{totalPoints.mc > 0 ? totalPoints.mc.toFixed(2) : ''}</td>
            <td style={tdStyle} colSpan={3}>{totalPoints.tf > 0 ? totalPoints.tf.toFixed(2) : ''}</td>
            <td style={tdStyle} colSpan={3}>{totalPoints.sa > 0 ? totalPoints.sa.toFixed(2) : ''}</td>
            <td style={tdStyle} colSpan={3}>{totalPoints.essay > 0 ? totalPoints.essay.toFixed(2) : ''}</td>
            <td style={tdStyle}>{totalPointsByLevel.biet > 0 ? totalPointsByLevel.biet.toFixed(2) : ''}</td>
            <td style={tdStyle}>{totalPointsByLevel.hieu > 0 ? totalPointsByLevel.hieu.toFixed(2) : ''}</td>
            <td style={tdStyle}>{totalPointsByLevel.vd > 0 ? totalPointsByLevel.vd.toFixed(2) : ''}</td>
            <td style={tdStyle}>{grandTotalPoints > 0 ? grandTotalPoints.toFixed(2) : ''}</td>
          </tr>
          <tr>
            <td style={{...tdStyle, ...thStyle}} colSpan={3}>Tỉ lệ %</td>
            <td style={tdStyle} colSpan={3}>{totalScale > 0 && totalPoints.mc > 0 ? `${(totalPoints.mc / totalScale * 100).toFixed(2)}%` : ''}</td>
            <td style={tdStyle} colSpan={3}>{totalScale > 0 && totalPoints.tf > 0 ? `${(totalPoints.tf / totalScale * 100).toFixed(2)}%` : ''}</td>
            <td style={tdStyle} colSpan={3}>{totalScale > 0 && totalPoints.sa > 0 ? `${(totalPoints.sa / totalScale * 100).toFixed(2)}%` : ''}</td>
            <td style={tdStyle} colSpan={3}>{totalScale > 0 && totalPoints.essay > 0 ? `${(totalPoints.essay / totalScale * 100).toFixed(2)}%` : ''}</td>
            <td style={tdStyle}>{totalScale > 0 && totalPointsByLevel.biet > 0 ? `${(totalPointsByLevel.biet / totalScale * 100).toFixed(2)}%` : ''}</td>
            <td style={tdStyle}>{totalScale > 0 && totalPointsByLevel.hieu > 0 ? `${(totalPointsByLevel.hieu / totalScale * 100).toFixed(2)}%` : ''}</td>
            <td style={tdStyle}>{totalScale > 0 && totalPointsByLevel.vd > 0 ? `${(totalPointsByLevel.vd / totalScale * 100).toFixed(2)}%` : ''}</td>
            <td style={tdStyle}>{totalScale > 0 && grandTotalPoints > 0 ? `${(grandTotalPoints / totalScale * 100).toFixed(2)}%` : ''}</td>
          </tr>
        </tbody>
      </table>
       <div style={footnoteStyle} className="dark:text-gray-300">
        <p>¹ Mỗi câu hỏi gồm 4 ý nhỏ, học sinh chọn đúng hoặc sai. Một số tài liệu xếp loại này vào dạng “Nhiều lựa chọn phức hợp”.</p>  
        <p>² Với môn học không sử dụng dạng “Trả lời ngắn”, chuyển điểm cho loại “Đúng – Sai”.</p>  
        <p>³ Số liệu trong bảng thể hiện số câu hỏi hoặc số điểm tùy theo cách thiết kế.</p> 
        <p>⁴ Các dạng câu hỏi phân bổ điểm theo hướng dẫn của Công văn 7991 (% TNKQ, % Đúng – Sai, % Trả lời ngắn, % Tự luận).</p>
      </div>
    </div>
  );
};