import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, Settings, Download, Sparkles, Sun, Moon, Users, LogOut, KeySquare, Brain } from "../icons";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useToast } from "../../hooks/useToast";
import { Page, User } from "../../types";
import { useI18n } from "../../hooks/useI18n";
import MachineIdModal from "../auth/MachineIdModal";
import AiConfigModal from "../ai/AiConfigModal";

interface HeaderNavProps {
  setCurrentPage: (page: Page) => void;
  handleLogout: () => void;
  currentUser: User;
  handleRequestActivation: () => void;
}

export default function HeaderNav({ setCurrentPage, handleLogout, currentUser, handleRequestActivation }: HeaderNavProps) {
  const { addToast } = useToast();
  const { t } = useI18n();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMachineIdModalOpen, setIsMachineIdModalOpen] = useState(false);
  const [isAiConfigModalOpen, setIsAiConfigModalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotifications = () => {
    addToast(t('toasts.noNewNotifications', "Chưa có thông báo mới."));
  };

  const handlePrint = () => {
    window.print();
  };
  
  const isTrialUser = currentUser.role === 'Giáo viên' && currentUser.usageLimit !== undefined;

  return (
    <>
      <header className="w-full h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 flex-shrink-0 no-print">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg animate-pulse-slow">
            <Brain size={20} />
          </div>
          <h1 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
            {t('header.title', 'ExamGen Ultra 4.3')}
          </h1>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden lg:block">
          <div className="relative">
            <Input
              type="text"
              placeholder={t('header.searchPlaceholder', "Tìm kiếm nhanh (câu hỏi, đề thi, người dùng...)")}
              className="pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-400"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500 dark:text-slate-400" />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Nút Cấu hình API Key & Module AI cho mọi người dùng */}
          <Button
            variant="ghost"
            onClick={() => setIsAiConfigModalOpen(true)}
            className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700/70 px-2.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold shadow-xs transition-all hover:scale-[1.02]"
            title={t('header.apiKeyConfigTitle', 'Cấu hình API Key & Mô hình AI')}
          >
            <KeySquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">{t('header.apiKeyConfig', 'Cấu hình API Key')}</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => setCurrentPage('ai-tool')}
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800"
            title="AI Tool (Gemini)"
          >
            <Sparkles className="w-5 h-5" />
            <span className="hidden md:inline">{t('header.aiTool', 'AI Tool')}</span>
          </Button>

          <Button
            variant="ghost"
            onClick={handlePrint}
            className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-slate-800"
            title={t('header.exportPrint', "Xuất file / In ấn")}
          >
            <Download className="w-5 h-5" />
          </Button>

          <div className="transition-transform hover:rotate-12">
            <Button
              variant="ghost"
              onClick={handleNotifications}
              className="text-yellow-500 hover:bg-yellow-50 dark:hover:bg-slate-800"
              title={t('header.notifications', "Thông báo hệ thống")}
            >
              <Bell className="w-5 h-5" />
            </Button>
          </div>

          {isTrialUser && (
            <Button
                variant="ghost"
                onClick={handleRequestActivation}
                className="text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-slate-800"
                title={t('header.activateAccountTitle', "Kích hoạt tài khoản")}
            >
                <KeySquare className="w-5 h-5" />
                <span className="hidden md:inline ml-1">{t('header.activateAccountButton', 'Kích hoạt')}</span>
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={() => setIsMachineIdModalOpen(true)}
            className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Lấy Machine ID"
          >
            <KeySquare className="w-5 h-5" />
          </Button>

          {currentUser.role === 'Quản trị hệ thống' && (
            <Button
              variant="ghost"
              onClick={() => setCurrentPage('settings')}
              className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title={t('header.systemSettings', "Cài đặt hệ thống")}
            >
              <Settings className="w-5 h-5" />
            </Button>
          )}

          <div className="relative" ref={profileMenuRef}>
            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 ml-2 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
              <img
                src={currentUser.avatar}
                alt="User Avatar"
                className="w-9 h-9 rounded-full shadow"
              />
              <div className="hidden md:block text-sm text-left text-slate-800 dark:text-slate-100">
                <p className="font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentUser.role}
                </p>
              </div>
            </button>

            {isProfileMenuOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                <div className="py-1">
                  <button
                    onClick={() => { setIsAiConfigModalOpen(true); setIsProfileMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <KeySquare size={16} className="text-amber-500" /> {t('header.apiKeyConfig', 'Cấu hình API Key')}
                  </button>
                  <button
                    onClick={() => { setCurrentPage('my-account'); setIsProfileMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Users size={16} /> {t('header.myAccount', 'Tài khoản của tôi')}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut size={16} /> {t('header.logout', 'Đăng xuất')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <MachineIdModal isOpen={isMachineIdModalOpen} onClose={() => setIsMachineIdModalOpen(false)} />
      <AiConfigModal isOpen={isAiConfigModalOpen} onClose={() => setIsAiConfigModalOpen(false)} />
    </>
  );
}