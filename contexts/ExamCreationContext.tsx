import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '../hooks/useToast';
import { ManualTopic, NguVanDocHieuPart, NguVanVietPart, CauHoi } from '../types';

// Define common config for auto and semi-auto modes
export type AutoSemiAutoConfig = {
  aiPrompt: string;
  matrixType: 'm1' | 'm2' | 'm3' | 'm4';
  distTn: string;
  distTl: string;
  distNhanBiet: string;
  distThongHieu: string;
  distVanDung: string;
  distVdCao: string;
  cauHoiTracNghiem: CauHoi;
  cauHoiDungSai: CauHoi;
  cauHoiTraLoiNgan: CauHoi;
  cauHoiTuLuan: CauHoi;
  nguVanTuDongDocHieuPart: {
    soCau: string;
    tongDiem: string;
  };
  nguVanTuDongVietPart: {
    soCau: string;
    tongDiem: string;
  };
};

// Define config for manual mode
type ManualConfig = {
  manualTopics: ManualTopic[];
  nguVanDocHieuPart: NguVanDocHieuPart;
  nguVanVietPart: NguVanVietPart;
};

export interface ExamCreationState {
  creationMethod: 'auto' | 'semiAuto' | 'manual';
  auto: AutoSemiAutoConfig;
  semiAuto: AutoSemiAutoConfig;
  manual: ManualConfig;

  // MixExamWorkspace and OutlineWorkspace states remain top-level
  mixVersions: string;
  mixStartCode: string;
  outlineQuestionCountMultiplier: string;
  outlineIntegrationPercentage: string;
  outlineDetailLevel: 'basic' | 'standard' | 'advanced';
}

const defaultAutoSemiAutoConfig: AutoSemiAutoConfig = {
  aiPrompt: '',
  matrixType: 'm2',
  distTn: '70',
  distTl: '30',
  distNhanBiet: '30',
  distThongHieu: '40',
  distVanDung: '30',
  distVdCao: '0',
  cauHoiTracNghiem: { cau: "12", diem: "0.25" },
  cauHoiDungSai: { cau: "2", diem: "1.00" },
  cauHoiTraLoiNgan: { cau: "4", diem: "0.5" },
  cauHoiTuLuan: { cau: "1", diem: "3.0" },
  nguVanTuDongDocHieuPart: {
    soCau: "4",
    tongDiem: "3.0",
  },
  nguVanTuDongVietPart: {
    soCau: "1",
    tongDiem: "7.0",
  },
};

const defaultManualConfig: ManualConfig = {
  manualTopics: [
    {
      id: 'topic-default-1',
      topicName: 'Chủ đề 1 (Ví dụ)',
      requirements: 'Học sinh có khả năng nhận biết và mô tả các khái niệm cơ bản về Este và Lipit.',
      questions: [
        {
          id: 'q-default-1',
          questionType: 'multipleChoice',
          count: '10',
          points: '0.25',
          distBiet: '3',
          distHieu: '4',
          distVd: '3',
          distVdCao: '0'
        },
        {
          id: 'q-default-2',
          questionType: 'essay',
          count: '1',
          points: '3.0',
          distBiet: '0',
          distHieu: '0',
          distVd: '1',
          distVdCao: '0'
        }
      ]
    }
  ],
  nguVanDocHieuPart: {
    passage: '',
    questions: [
      { id: `nv-dh-1`, cognitiveLevel: 'Nhận biết', points: '1.0', requirements: 'Xác định phương thức biểu đạt chính của văn bản.' },
      { id: `nv-dh-2`, cognitiveLevel: 'Thông hiểu', points: '1.0', requirements: 'Anh/chị hiểu như thế nào về ý kiến: ...?' },
      { id: `nv-dh-3`, cognitiveLevel: 'Vận dụng', points: '1.0', requirements: 'Trình bày suy nghĩ về thông điệp mà tác giả muốn gửi gắm.' },
    ],
  },
  nguVanVietPart: {
    promptDescription: 'Từ nội dung văn bản ở Phần Đọc hiểu, anh/chị hãy thực hiện các yêu cầu sau:',
    usePart1Passage: true,
    questions: [
      {
        id: `nv-v-1`,
        prompt: 'Viết một bài văn nghị luận (khoảng 500 chữ) trình bày suy nghĩ của mình về vấn đề...',
        pointsBiet: '1.0',
        pointsHieu: '2.0',
        pointsVd: '3.0',
        pointsVdCao: '1.0'
      },
    ],
  },
};


const defaultState: ExamCreationState = {
  creationMethod: 'auto',
  auto: defaultAutoSemiAutoConfig,
  semiAuto: { ...defaultAutoSemiAutoConfig }, // Create a shallow copy for independence
  manual: defaultManualConfig,
  
  mixVersions: '4',
  mixStartCode: '101',
  outlineQuestionCountMultiplier: '3',
  outlineIntegrationPercentage: '100',
  outlineDetailLevel: 'standard'
};

const STORAGE_KEY = 'form_exam_creation_settings';

// Helper for deep merging state from localStorage
function isObject(item: any) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const sourceKey = key as keyof Partial<T>;
      const targetKey = key as keyof T;
      if (isObject(source[sourceKey])) {
        if (target[targetKey] && isObject(target[targetKey])) {
          output[targetKey] = deepMerge(target[targetKey] as object, source[sourceKey] as object) as T[keyof T];
        } else {
          Object.assign(output, { [key]: source[sourceKey] });
        }
      } else if (source[sourceKey] !== undefined) {
        Object.assign(output, { [key]: source[sourceKey] });
      }
    });
  }
  return output;
}


interface ExamCreationContextType {
  examSettings: ExamCreationState;
  setExamSettings: React.Dispatch<React.SetStateAction<ExamCreationState>>;
  resetExamSettings: () => void;
}

export const ExamCreationContext = createContext<ExamCreationContextType | null>(null);

export const ExamCreationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  
  const [examSettings, setExamSettings] = useState<ExamCreationState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedSaved = JSON.parse(saved);
        // Deep merge saved settings over defaults to prevent crashes from outdated state shapes.
        return deepMerge(defaultState, parsedSaved);
      }
    } catch (error) {
      console.error('Error parsing exam settings from localStorage', error);
    }
    return defaultState;
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      addToast("Đã khôi phục dữ liệu tạo đề thi.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(examSettings));
    } catch (error) {
      console.error('Error saving exam settings to localStorage', error);
    }
  }, [examSettings]);

  const resetExamSettings = () => {
    setExamSettings(defaultState);
    localStorage.removeItem(STORAGE_KEY);
    addToast("Đã xóa dữ liệu tạo đề thi.");
  };

  return (
    <ExamCreationContext.Provider value={{ examSettings, setExamSettings, resetExamSettings }}>
      {children}
    </ExamCreationContext.Provider>
  );
};