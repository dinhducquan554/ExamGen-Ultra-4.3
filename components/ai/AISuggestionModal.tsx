

import React, { useState } from "react";
import { Sparkles, XCircle, CheckCircle2, Brain } from "../icons";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";

interface AISuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AISuggestionModal({ isOpen, onClose }: AISuggestionModalProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const suggestions = [
    { id: 1, title: "Tạo mới 3 đề Hóa học 10 – Chương 2", desc: "AI đề xuất tạo 3 đề gồm 40 câu trắc nghiệm, phân bố theo Ma trận chuẩn đầu ra.", tag: "Đề thi", color: "from-blue-500 to-indigo-500" },
    { id: 2, title: "Phân tích tỉ lệ câu hỏi vận dụng cao", desc: "AI nhận thấy bạn có 12% câu hỏi vận dụng cao, nên tăng lên 20% để bám sát đề minh họa.", tag: "Phân tích", color: "from-green-500 to-emerald-500" },
    { id: 3, title: "Kiểm tra ngân hàng câu hỏi thiếu metadata", desc: "Có 27 câu hỏi chưa gắn chương/bài – AI có thể tự động phân loại giúp bạn.", tag: "Dữ liệu", color: "from-yellow-500 to-orange-500" },
    { id: 4, title: "Gợi ý cấu trúc đề Ngữ văn học kỳ I", desc: "Tạo khung đề gồm 3 phần: Đọc hiểu – Làm văn – Nghị luận xã hội, có thể tùy chỉnh theo khối lớp.", tag: "Đề cương", color: "from-pink-500 to-rose-500" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative overflow-hidden transform animate-slide-up">
        <style>{`
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            @keyframes slide-up { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        `}</style>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition">
          <XCircle className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <Brain className="w-8 h-8 text-purple-500" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Gợi ý chi tiết từ AI Gemini
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((item) => (
            <div key={item.id} className="transform transition-transform hover:scale-103" onClick={() => setSelected(item.id)}>
              <Card className={`rounded-2xl cursor-pointer border-2 ${selected === item.id ? "border-indigo-500 ring-2 ring-indigo-500/50" : "border-slate-200 dark:border-slate-800"} transition-all`}>
                <CardContent className="p-4">
                  <div className={`inline-block text-xs text-white px-2 py-1 rounded-full bg-gradient-to-r ${item.color}`}>
                    {item.tag}
                  </div>
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <Button variant="outline" onClick={onClose} className="text-slate-600 dark:text-slate-300">
            Hủy
          </Button>
          <Button disabled={!selected} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${selected ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white" : "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"}`}>
            <CheckCircle2 className="w-5 h-5" />
            {selected ? "Thực hiện gợi ý này" : "Chọn một gợi ý"}
          </Button>
        </div>
      </div>
    </div>
  );
}