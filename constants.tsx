import React from 'react';
import { Settings, Users, Bell, Sliders, FileText, Shuffle, BookOpen, BarChart2, Sparkles } from "./components/icons";
import { NavItem, Page } from './types';

export const NAV_ITEMS: NavItem[] = [
    { title: "Bảng điều khiển", tKey: "sidebar.dashboard", icon: <BarChart2 />, path: "dashboard" },
    { title: "Quản lý người dùng", tKey: "sidebar.userManagement", icon: <Users />, path: "users" },
    { title: "Danh sách người dùng", tKey: "sidebar.userList", icon: <Users />, path: "user-list" },
    { title: "Lời nhắc hệ thống", tKey: "sidebar.systemInstruction", icon: <Bell />, path: "system-instruction" },
    { title: "Thiết lập chung", tKey: "sidebar.generalConfig", icon: <Sliders />, path: "general-config" },
    { title: "Thiết lập cấu trúc đề thi", tKey: "sidebar.examStructure", icon: <FileText />, path: "exam-structure" },
    { title: "Trộn đề", tKey: "sidebar.mixExam", icon: <Shuffle />, path: "mix-exam" },
    { title: "Tạo đề cương ôn tập", tKey: "sidebar.outline", icon: <BookOpen />, path: "outline" },
    { title: "Kết quả", tKey: "sidebar.results", icon: <BarChart2 />, path: "results" },
    { title: "AI Tool (Gemini)", tKey: "sidebar.aiTool", icon: <Sparkles />, path: "ai-tool" },
    { title: "Cài đặt", tKey: "sidebar.settings", icon: <Settings />, path: "settings" },
];

export const ADMIN_ONLY_PAGES: Page[] = ['users', 'user-list', 'system-instruction', 'settings'];

export const PROVINCES = [
  "An Giang", "Bắc Ninh", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Nội", "Hà Tĩnh", "Huế", "Hưng Yên", "Khánh Hòa", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Nghệ An", "Ninh Bình", "Phú Thọ", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sơn La", "Tây Ninh", "Thái Nguyên", "Thanh Hóa", "Tuyên Quang", "TP. Cần Thơ", "TP. Đà Nẵng", "TP. Hải Phòng", "TP. Hồ Chí Minh", "Vĩnh Long"
];

export const SCHOOLS_BY_PROVINCE: { [key: string]: string[] } = {
  "Quảng Ngãi": [
    "THPT Bình Sơn", "THCS và THPT Vạn Tường", "THPT Trần Kỳ Phong",
    "THPT Lê Quý Đôn", "THPT Võ Nguyên Giáp", "THPT Ba Gia",
    "THPT Sơn Mỹ", "THPT Huỳnh Thúc Kháng", "THPT Trần Quốc Tuấn",
    "THPT chuyên Lê Khiết", "THPT Lê Trung Đình", "THPT số 1 Nghĩa Hành",
    "THPT số 2 Nghĩa Hành", "THPT Nguyễn Công Phương", "THPT số 1 Tư Nghĩa",
    "THPT số 2 Tư Nghĩa", "THPT Thu Xà", "THPT Chu Văn An",
    "THPT Phạm Văn Đồng", "THPT số 2 Mộ Đức", "THPT Trần Quang Diệu",
    "THPT Nguyễn Công Trứ", "THPT số 1 Đức Phổ", "THPT số 2 Đức Phổ",
    "THPT Lương Thế Vinh", "THPT Lý Sơn", "THPT Ba Tơ",
    "THPT Sơn Hà", "THPT Trà Bồng", "THCS và THPT Phó Mục Gia",
    "THPT Đinh Tiên Hoàng", "THPT Minh Long", "THPT Tây Trà",
    "THPT Phạm Kiệt", "THCS và THPT Phạm Kiệt", "THPT Quang Trung",
    "PTDTNT THPT tỉnh Quảng Ngãi", "Trung tâm GDTX tỉnh Quảng Ngãi",
    "Trung tâm hỗ trợ phát triển giáo dục hòa nhập tỉnh Quảng Ngãi",
    "Trung tâm GDNN-GDTX khu vực Bình Sơn", "Trung tâm GDNN-GDTX khu vực Mộ Đức",
    "Trung tâm GDNN-GDTX khu vực Ba Tơ", "Trung tâm GDNN-GDTX khu vực Đức Phổ",
    "THPT tư thục Hoàng Văn Thụ", "THPT tư thục Trương Định",
    "liên cấp thành phố giáo dục quốc tế IEC", "Trung tâm hỗ trợ phát triển giáo dục hòa nhập Tâm Việt",
    "THCS và THPT Tôn Đức Thắng",
    "THPT chuyên Nguyễn Tất Thành", "THPT Kon Tum", "THPT Lê Lợi", "THPT Phan Bội Châu", "THPT Duy Tân", "THPT Trường Chinh", "THCS và THPT Ngô Mây", "THPT Trần Hưng Đạo", "THPT Nguyễn Văn Cừ", "THPT Nguyễn Trãi", "THPT Phan Chu Trinh", "THPT Trần Phú", "THPT Phan Đình Phùng", "THPT Nguyễn Huệ", "PTDTNT THPT Kon Tum", "PTDTNT THPT Đăk Hà", "PTDTNT THPT Đăk Tô", "PTDTNT THPT Tu Mơ Rông", "PTDTNT THPT Đăk Glei", "PTDTNT THCS và THPT Đăk Rve", "PTDTNT THPT Măng Đen", "PTDTNT THPT Sa Thầy", "PTDTNT THPT Ia Tơi", "THCS và THPT Liên Việt Kon Tum", "THCS THSP Lý Tự Trọng", "tiểu học THSP Ngụy Như Kon Tum", "mầm non THSP Kon Tum", "Trung tâm GDTX Kon Tum", "Trung tâm GDNN-GDTX Đăk Hà", "Trung tâm GDNN-GDTX Đăk Tô", "Trung tâm GDNN-GDTX Tu Mơ Rông", "Trung tâm GDNN-GDTX Đăk Glei", "Trung tâm GDNN-GDTX Ngọc Hồi", "Trung tâm GDNN-GDTX Kon Rẫy", "Trung tâm GDNN-GDTX Kon Plông", "Trung tâm GDNN-GDTX Sa Thầy",
  ],
  "Kon Tum": [
    "THPT chuyên Nguyễn Tất Thành", "THPT Kon Tum", "THPT Lê Lợi",
    "THPT Phan Bội Châu", "THPT Duy Tân", "THPT Trường Chinh",
    "THCS và THPT Ngô Mây", "THPT Trần Hưng Đạo", "THPT Nguyễn Văn Cừ",
    "THPT Nguyễn Trãi", "THPT Phan Chu Trinh", "THPT Trần Phú",
    "THPT Phan Đình Phùng", "THPT Nguyễn Huệ", "PTDTNT THPT Kon Tum",
    "PTDTNT THPT Đăk Hà", "PTDTNT THPT Đăk Tô", "PTDTNT THPT Tu Mơ Rông",
    "PTDTNT THPT Đăk Glei", "PTDTNT THCS và THPT Đăk Rve",
    "PTDTNT THPT Măng Đen", "PTDTNT THPT Sa Thầy", "PTDTNT THPT Ia Tơi",
    "THCS và THPT Liên Việt Kon Tum", "THCS THSP Lý Tự Trọng",
    "tiểu học THSP Ngụy Như Kon Tum", "mầm non THSP Kon Tum",
    "Trung tâm GDTX Kon Tum", "Trung tâm GDNN-GDTX Đăk Hà", "Trung tâm GDNN-GDTX Đăk Tô",
    "Trung tâm GDNN-GDTX Tu Mơ Rông", "Trung tâm GDNN-GDTX Đăk Glei", "Trung tâm GDNN-GDTX Ngọc Hồi",
    "Trung tâm GDNN-GDTX Kon Rẫy", "Trung tâm GDNN-GDTX Kon Plông", "Trung tâm GDNN-GDTX Sa Thầy",
  ],
  "Hà Nội": [
    "THPT Chu Văn An", "THPT Kim Liên", "THPT Chuyên Hà Nội - Amsterdam",
    "THPT Việt Đức", "THPT Phan Đình Phùng",
  ],
  "TP. Hồ Chí Minh": [
    "THPT Chuyên Lê Hồng Phong", "THPT Nguyễn Thị Minh Khai", "Phổ thông Năng khiếu, ĐHQG-HCM",
    "THPT Gia Định", "THPT Trưng Vương",
  ],
};

export const PROFESSIONAL_GROUPS = {
  "Tiểu học": ["1", "2", "3", "4", "5", "Tiếng Anh", "Tin học", "Năng khiếu (Âm nhạc, Mỹ thuật, Thể dục)"],
  "THCS": ["Toán – Tin", "Ngữ văn", "Ngoại ngữ", "Khoa học Tự nhiên", "Khoa học Xã hội", "Năng khiếu (Nhạc-Họa)", "Thể dục - GDQP"],
  "THPT": ["Toán", "Tin học", "Vật lý - Công nghệ", "Hóa học", "Sinh học", "Ngữ văn", "Lịch sử", "Địa lý", "GDCD", "Ngoại ngữ", "Thể dục - GDQP"],
};

export const SCHOOL_LEVELS_CONFIG = {
  "Tiểu học": {
    grades: ["1", "2", "3", "4", "5"],
    subjects: ["Toán", "Tiếng Việt", "Tự nhiên và Xã hội", "Khoa học", "Lịch sử và Địa lí", "Đạo đức", "Âm nhạc", "Mĩ thuật", "Giáo dục thể chất", "Hoạt động trải nghiệm", "Tiếng Anh", "Tin học và Công nghệ"],
  },
  "THCS": {
    grades: ["6", "7", "8", "9"],
    subjects: ["Ngữ văn", "Toán", "Tiếng Anh", "Giáo dục công dân", "Lịch sử và Địa lí", "Khoa học tự nhiên", "Công nghệ", "Tin học", "Giáo dục thể chất", "Nghệ thuật (Âm nhạc, Mĩ thuật)", "Hoạt động trải nghiệm, hướng nghiệp", "Nội dung giáo dục của địa phương"],
  },
  "THPT": {
    grades: ["10", "11", "12", "TNTHPT"],
    subjects: ["Ngữ văn", "Toán", "Tiếng Anh", "Lịch sử", "Giáo dục thể chất", "Giáo dục Quốc phòng và An ninh", "Hoạt động trải nghiệm, hướng nghiệp", "Nội dung giáo dục của địa phương", "Vật lí", "Hóa học", "Sinh học", "Địa lí", "Giáo dục kinh tế và pháp luật", "Tin học", "Công nghệ", "Ngoại ngữ 2"],
  },
};

export const TEXTBOOKS = {
  "Default": ["Chung cho cả các bộ sách", "Kết nối tri thức với cuộc sống", "Cánh Diều", "Chân trời sáng tạo"],
  "Tiếng Anh": ["Global Success", "English Discovery", "Right On!", "i-Learn Smart World", "THiNK", "Wonderful World"],
};

export const EXAM_TYPES = [
  "Kiểm tra thường xuyên (15 phút)",
  "Kiểm tra Giữa học kỳ I",
  "Kiểm tra Cuối học kỳ I",
  "Kiểm tra Giữa học kỳ II",
  "Kiểm tra Cuối học kỳ II",
  "Thi thử tốt nghiệp THPT",
];