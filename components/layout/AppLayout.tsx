

import React from 'react';
import MainSidebar from './MainSidebar';
import HeaderNav from './HeaderNav';
import RightSidebar from './RightSidebar';
import { Page, User } from '../../types';

interface AppLayoutProps {
  children?: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  handleLogout: () => void;
  currentUser: User;
  handleRequestActivation: () => void;
}

export default function AppLayout({ children, currentPage, setCurrentPage, handleLogout, currentUser, handleRequestActivation }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <MainSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} currentUser={currentUser} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <HeaderNav setCurrentPage={setCurrentPage} handleLogout={handleLogout} currentUser={currentUser} handleRequestActivation={handleRequestActivation} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6" id="printable-content">
          {children}
        </main>
      </div>
      <RightSidebar />
    </div>
  );
}
