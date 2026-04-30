import React from "react";
import { Moon, Sun } from "../icons";
import { Button } from "../ui/Button";
import { useTheme } from "../../hooks/useTheme";
import { NAV_ITEMS, ADMIN_ONLY_PAGES } from "../../constants";
import { Page, User } from "../../types";
import { useI18n } from "../../hooks/useI18n";

interface MainSidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  currentUser: User;
}

export default function MainSidebar({ currentPage, setCurrentPage, currentUser }: MainSidebarProps) {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  const accessibleNavItems = NAV_ITEMS.filter(item => 
      !ADMIN_ONLY_PAGES.includes(item.path as Page) || (currentUser && currentUser.role === 'Quản trị hệ thống')
  );

  return (
    <div className="flex flex-col h-screen w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex-shrink-0 no-print">
      <div className="flex items-center justify-center h-16 font-semibold text-xl tracking-wide border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
        {t('sidebar.title', 'ExamGen Ultra 4.3')}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {accessibleNavItems.map((item, index) => {
           const isActive = currentPage === item.path;
           return (
            <div
              key={index}
              className="transform transition-transform duration-200 hover:scale-105 hover:translate-x-1"
            >
              <button
                onClick={() => setCurrentPage(item.path as Page)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer text-sm font-medium w-full text-left transition-all
                  ${isActive 
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
              >
                <span className={isActive ? '' : 'text-slate-500 dark:text-slate-400'}>
                    {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5' })}
                </span>
                <span>{t(item.tKey as any, item.title)}</span>
              </button>
            </div>
           );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <Button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          variant="outline"
          className={`w-full transition-all duration-300 text-slate-700 dark:text-slate-300 ${
            theme === 'light' ? 'shadow-lg ring-2 ring-indigo-500/20 border-indigo-200 dark:border-slate-700' : ''
          }`}
        >
          {theme === "dark" ? (
             <> <Sun className="w-5 h-5 text-yellow-500"/> {t('sidebar.lightMode' as any, 'Chế độ sáng')} </>
          ) : (
             <> <Moon className="w-5 h-5"/> {t('sidebar.darkMode' as any, 'Chế độ tối')} </>
          )}
        </Button>
      </div>
    </div>
  );
}