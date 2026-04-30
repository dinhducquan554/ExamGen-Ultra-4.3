import React from 'react';

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: 'Quản trị hệ thống' | 'Giáo viên';
  school: string;
  profGroup: string;
  usageCount: number;
  tokenUsage: number;
  usageLimit?: number;
  status: 'Hoạt động' | 'Tạm khóa';
  lastLogin: string;
  avatar: string;
};

export type NavItem = {
  title: string;
  tKey: string;
  icon: React.ReactNode;
  path: string;
};

export type Preset = {
  id: string;
  title: string;
  prompt: string;
};

export type Message = {
  id: string | number;
  role: 'user' | 'assistant' | 'system';
  text: string;
  meta: string;
};

export type Page = 'dashboard' | 'users' | 'system-instruction' | 'general-config' | 'exam-structure' | 'mix-exam' | 'outline' | 'results' | 'ai-tool' | 'settings' | 'my-account' | 'user-list';

export interface QuestionDistribution {
  biet: number;
  hieu: number;
  vd: number;
}

export interface TopicDetails {
  id: string;
  topicName: string;
  unit: string;
  requirements: string;
  multipleChoice: QuestionDistribution;
  trueFalse: QuestionDistribution;
  shortAnswer: QuestionDistribution;
  essay: QuestionDistribution;
}

export interface Question {
  id: string;
  topicId: string;
  cognitiveLevel: 'biet' | 'hieu' | 'vd';
  questionType: 'multipleChoice' | 'trueFalse' | 'shortAnswer' | 'essay';
  content: string; 
  options?: string[];
  answer: string; 
}

// FIX: Refactored `ValidationReport` to a strongly-typed structure. This resolves type inference issues with `Object.entries` and `Object.values`, fixing errors where properties were inferred as `unknown`.
export interface ValidationStats {
  biet: { expected: number; actual: number };
  hieu: { expected: number; actual: number };
  vd: { expected: number; actual: number };
}

export interface ValidationReportTopic {
    topicName: string;
    multipleChoice: ValidationStats;
    trueFalse: ValidationStats;
    shortAnswer: ValidationStats;
    essay: ValidationStats;
}

export interface ValidationReport {
  [topicId: string]: ValidationReportTopic;
}

export interface GeneratedExamData {
  topics: TopicDetails[];
  questions?: Question[];
  validationReport?: ValidationReport;
  examContent?: string;
  answerContent?: string;
}

export interface CauHoi {
  cau: string;
  diem: string;
}

export interface MixedExam {
  code: string;
  examContent: string;
  answerContent: string;
}

export type ManualQuestionConfig = {
  id: string;
  questionType: 'multipleChoice' | 'trueFalse' | 'shortAnswer' | 'essay';
  count: string;
  points: string;
  distBiet: string;
  distHieu: string;
  distVd: string;
  distVdCao: string;
};

export type ManualTopic = {
  id: string;
  topicName: string;
  requirements: string;
  questions: ManualQuestionConfig[];
};

export type NguVanDocHieuQuestion = {
  id: string;
  cognitiveLevel: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  points: string;
  requirements: string;
};

export type NguVanDocHieuPart = {
  passage: string;
  questions: NguVanDocHieuQuestion[];
};

export type NguVanVietQuestion = {
  id: string;
  prompt: string;
  pointsBiet: string;
  pointsHieu: string;
  pointsVd: string;
  pointsVdCao: string;
};

export type NguVanVietPart = {
  promptDescription: string;
  usePart1Passage: boolean;
  questions: NguVanVietQuestion[];
};