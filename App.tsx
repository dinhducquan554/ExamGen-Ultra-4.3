import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ExamCreationProvider } from './contexts/ExamCreationContext';
import { ToastProvider } from './contexts/ToastContext';
import { AdvancedSettingsProvider } from './contexts/AdvancedSettingsContext';
import { SystemInstructionProvider } from './contexts/SystemInstructionContext';
import { I18nProvider } from './contexts/I18nContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import GeminiWorkspace from './components/ai/GeminiWorkspace';
import GeneralSettingsWorkspace from './components/settings/GeneralSettingsWorkspace';
import ExamStructureWorkspace from './components/settings/ExamStructureWorkspace';
import UserManagementWorkspace from './components/users/UserManagementWorkspace';
import UserList from './components/users/UserList';
// FIX: Corrected import path for MixExamWorkspace. The component is located in the 'mix' subdirectory, not 'exam'.
import MixExamWorkspace from './components/mix/MixExamWorkspace';
import OutlineWorkspace from './components/exam/OutlineWorkspace';
import ResultsWorkspace from './components/results/ResultsWorkspace';
import Placeholder from './components/Placeholder';
import SettingsWorkspace from './components/settings/SettingsWorkspace';
import LoginScreen from './components/auth/LoginScreen';
import MyAccountWorkspace from './components/users/MyAccountWorkspace';
import SystemInstructionWorkspace from './components/settings/SystemInstructionWorkspace';
import { Page, GeneratedExamData, MixedExam, User } from './types';
import { NAV_ITEMS, ADMIN_ONLY_PAGES } from './constants';
import LicenseKeyModal from './components/auth/LicenseKeyModal';
import { Lock } from './components/icons';
import ApiKeyModal from './components/auth/ApiKeyModal';

const LOGGED_IN_USER_KEY = 'examgen_logged_in_user';
const USERS_STORAGE_KEY = 'examgen_users_list';
const LICENSE_KEY = 'examgen_license_key';
const LAST_LOGIN_USERNAME_KEY = 'examgen_last_login_username';
const API_KEY_STORAGE_KEY = 'examgen_gemini_api_key';
const MACHINE_ID_KEY = 'examgen_machine_id';
const DEVICE_USAGE_STORAGE_KEY = 'examgen_device_usage';

const MOCK_USERS: User[] = [
    { id: 99, name: 'Đinh Đức Quân', username: 'admin', password: 'admin@123', email: 'dinhducquan@examgen.pro', role: 'Quản trị hệ thống', school: 'ExamGen Ultra AI', profGroup: 'Quản trị', status: 'Hoạt động', lastLogin: '2024-07-29 09:00', avatar: 'https://i.imgur.com/of8t0I5.png', usageCount: 42, tokenUsage: 123456 },
    { id: 98, name: 'Võ Thị Thu Thủy', username: 'thuyvo', password: 'thuyvo@123', email: 'thuyvo@gmail.com', role: 'Giáo viên', school: 'THPT Bình Sơn', profGroup: 'Ngoại ngữ', status: 'Hoạt động', lastLogin: '2024-07-28 14:00', avatar: 'https://i.pravatar.cc/150?u=thuyvo', usageCount: 0, usageLimit: 10, tokenUsage: 0 },
    { id: 97, name: 'Giáo viên A', username: 'teacher', password: '123', email: 'teacher@example.com', role: 'Giáo viên', school: 'THPT Trần Quốc Tuấn', profGroup: 'Toán', status: 'Hoạt động', lastLogin: '', avatar: 'https://i.pravatar.cc/150?u=teacher', usageCount: 0, usageLimit: 5, tokenUsage: 0 },
    { id: 96, name: 'Giáo viên B', username: 'teacher1', password: '123', email: 'teacher1@example.com', role: 'Giáo viên', school: 'THPT Chuyên Lê Khiết', profGroup: 'Vật lý - Công nghệ', status: 'Hoạt động', lastLogin: '', avatar: 'https://i.pravatar.cc/150?u=teacher1', usageCount: 0, usageLimit: 5, tokenUsage: 0 },
    { id: 95, name: 'Giáo viên C', username: 'teacher2', password: '123', email: 'teacher2@example.com', role: 'Giáo viên', school: 'THPT Bình Sơn', profGroup: 'Ngữ văn', status: 'Hoạt động', lastLogin: '', avatar: 'https://i.pravatar.cc/150?u=teacher2', usageCount: 0, usageLimit: 5, tokenUsage: 0 },
    { id: 94, name: 'Giáo viên D', username: 'teacher3', password: '123', email: 'teacher3@example.com', role: 'Giáo viên', school: 'THCS và THPT Vạn Tường', profGroup: 'Lịch sử', status: 'Hoạt động', lastLogin: '', avatar: 'https://i.pravatar.cc/150?u=teacher3', usageCount: 0, usageLimit: 5, tokenUsage: 0 },
    { id: 93, name: 'Giáo viên E', username: 'teacher4', password: '123', email: 'teacher4@example.com', role: 'Giáo viên', school: 'THPT số 1 Tư Nghĩa', profGroup: 'Ngoại ngữ', status: 'Hoạt động', lastLogin: '', avatar: 'https://i.pravatar.cc/150?u=teacher4', usageCount: 0, usageLimit: 5, tokenUsage: 0 },
];

const getMachineId = (): string => {
  let machineId = localStorage.getItem(MACHINE_ID_KEY);
  if (!machineId) {
    machineId = 'MACHINE-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem(MACHINE_ID_KEY, machineId);
  }
  return machineId;
};

const generateKeyForMachine = (machineId: string): string => {
  if (!machineId) return '';
  return 'EG-ULTRA-' + btoa(machineId).split('').reverse().join('');
};


function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [examData, setExamData] = useState<GeneratedExamData | null>(null);
  const [outlineData, setOutlineData] = useState<string | null>(null);
  const [mixedExamData, setMixedExamData] = useState<MixedExam[] | null>(null);
  const [userAwaitingLicense, setUserAwaitingLicense] = useState<User | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem(API_KEY_STORAGE_KEY));

  // Master user list state
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const parsedUsers = savedUsers ? JSON.parse(savedUsers) : MOCK_USERS;
      if (!savedUsers) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(MOCK_USERS));
      }
      return parsedUsers;
    } catch (e) {
      console.error("Failed to load users from storage", e);
      return MOCK_USERS;
    }
  });

  // Logged-in user state
  const [currentUser, _setCurrentUser] = useState<User | null>(() => {
    try {
      // Clean up any old persistent session. We only want session-based login.
      localStorage.removeItem(LOGGED_IN_USER_KEY);
      
      const fromSession = sessionStorage.getItem(LOGGED_IN_USER_KEY);
      if (fromSession) return JSON.parse(fromSession);

      return null;
    } catch (e) {
      console.error("Failed to load user session from storage", e);
      return null;
    }
  });

  // Effect to persist the master user list to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error("Failed to save users to storage", e);
    }
  }, [users]);

  // Create a wrapped setCurrentUser that handles synchronization AND session persistence.
  const setCurrentUser = useCallback((userUpdater: React.SetStateAction<User | null>) => {
    _setCurrentUser(prevUser => {
      const newUser = typeof userUpdater === 'function' ? userUpdater(prevUser) : userUpdater;

      if (newUser) {
        // Sync the change to the master users list
        setUsers(prevUsers => prevUsers.map(u => (u.id === newUser.id ? newUser : u)));

        // Always update sessionStorage for the current session
        sessionStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(newUser));
      }
      
      return newUser;
    });
  }, []);

  const updateTokenUsage = useCallback((count: number) => {
    if (!currentUser || count === 0) return;
    setCurrentUser(prevUser => {
        if (!prevUser) return null;
        const newUsage = (prevUser.tokenUsage || 0) + count;
        return { ...prevUser, tokenUsage: newUsage };
    });
  }, [currentUser, setCurrentUser]);

  const completeLogin = (user: User) => {
      const updatedUser = { 
          ...user, 
          lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' '),
          // usageCount is now passed in directly, no need to increment here.
          tokenUsage: user.tokenUsage || 0,
      };
      
      sessionStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(updatedUser));
      sessionStorage.removeItem('examgen_exam_created_this_session');
      
      setCurrentUser(updatedUser);

      if (user.role !== 'Quản trị hệ thống') {
        localStorage.setItem(LAST_LOGIN_USERNAME_KEY, user.username);
      } else {
        localStorage.removeItem(LAST_LOGIN_USERNAME_KEY);
      }
  }

  const handleLoginSuccess = (user: User, rememberMe: boolean) => {
    const isAdmin = user.role === 'Quản trị hệ thống';
    if (isAdmin) {
        completeLogin(user);
        return;
    }

    // For non-admins (Teachers), first check for a valid license key.
    const existingKey = localStorage.getItem(LICENSE_KEY);
    const currentMachineId = getMachineId();
    const expectedKey = generateKeyForMachine(currentMachineId);
    
    if (existingKey === expectedKey) {
        // User is licensed on this machine. Convert to full user if they were a trial user.
        const licensedUser = { ...user };
        delete licensedUser.usageLimit;
        completeLogin(licensedUser);
        return;
    }

    // If no valid license, check if it's a trial user.
    const isTrialUser = user.usageLimit !== undefined;
    if (isTrialUser) {
        let deviceUsage: { [key: string]: number } = {};
        try {
            const storedUsage = localStorage.getItem(DEVICE_USAGE_STORAGE_KEY);
            if (storedUsage) deviceUsage = JSON.parse(storedUsage);
        } catch (e) {
            console.error("Failed to parse device usage", e);
        }

        const deviceUsageCount = deviceUsage[user.username] || 0;
        const usageLimit = user.usageLimit!;

        if (deviceUsageCount < usageLimit) {
            // Trial is still active on this device.
            const newDeviceUsageCount = deviceUsageCount + 1;
            deviceUsage[user.username] = newDeviceUsageCount;
            localStorage.setItem(DEVICE_USAGE_STORAGE_KEY, JSON.stringify(deviceUsage));
            
            // Update the user object for this session to show the correct usage count.
            const updatedUserForLogin = { ...user, usageCount: newDeviceUsageCount };
            completeLogin(updatedUserForLogin);
        } else {
            // Trial has expired on this device.
            setUserAwaitingLicense(user);
        }
        return;
    }

    // If we reach here, the user is a Teacher without a usageLimit (activated)
    // but does not have a valid license key on this machine. They must activate.
    setUserAwaitingLicense(user);
  };
  
  const handleLicenseSuccess = (key: string) => {
      localStorage.setItem(LICENSE_KEY, key);
      if (userAwaitingLicense) {
          // Convert trial user to full user by removing usageLimit
          const licensedUser = { ...userAwaitingLicense };
          delete licensedUser.usageLimit;
          
          completeLogin(licensedUser);
      }
      setUserAwaitingLicense(null);
  };
  
  const handleApiKeySuccess = (key: string) => {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
      setApiKey(key);
  };

  const handleLogout = () => {
    localStorage.removeItem(LOGGED_IN_USER_KEY);
    sessionStorage.removeItem(LOGGED_IN_USER_KEY);
    _setCurrentUser(null); // Use the raw setter here to avoid sync issues on logout
    setCurrentPage('dashboard');
  };

  const handleRequestActivation = () => {
    if (currentUser) {
        setUserAwaitingLicense(currentUser);
    }
  };

  const renderContent = (): React.ReactNode => {
    if (currentUser && ADMIN_ONLY_PAGES.includes(currentPage) && currentUser.role !== 'Quản trị hệ thống') {
        return (
            <div className="flex items-center justify-center h-full">
                <Placeholder 
                   pageTitle="Truy cập bị từ chối" 
                   message="Bạn không có quyền truy cập vào chức năng này. Vui lòng liên hệ quản trị viên." 
                   icon={<Lock className="w-16 h-16 text-red-500" />}
                />
            </div>
        );
    }
    
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagementWorkspace users={users} setUsers={setUsers} currentUser={currentUser!} setCurrentUser={setCurrentUser} />;
      case 'user-list':
        return <UserList users={users} />;
      case 'system-instruction':
        return <SystemInstructionWorkspace />;
      case 'ai-tool':
        return <GeminiWorkspace updateTokenUsage={updateTokenUsage} />;
      case 'general-config':
        return <GeneralSettingsWorkspace />;
      case 'exam-structure':
        return <ExamStructureWorkspace setExamData={setExamData} setCurrentPage={setCurrentPage} updateTokenUsage={updateTokenUsage} currentUser={currentUser!} />;
      case 'mix-exam':
        return <MixExamWorkspace examData={examData} setMixedExamData={setMixedExamData} setCurrentPage={setCurrentPage} updateTokenUsage={updateTokenUsage} currentUser={currentUser!} />;
      case 'outline':
        return <OutlineWorkspace examData={examData} setOutlineData={setOutlineData} setCurrentPage={setCurrentPage} updateTokenUsage={updateTokenUsage} currentUser={currentUser!} />;
      case 'results':
        return <ResultsWorkspace examData={examData} setExamData={setExamData} outlineData={outlineData} mixedExamData={mixedExamData} />;
      case 'settings':
        return <SettingsWorkspace setCurrentPage={setCurrentPage} />;
      case 'my-account':
        return <MyAccountWorkspace currentUser={currentUser!} setCurrentUser={setCurrentUser} users={users} />;
      default:
        const page = NAV_ITEMS.find(item => item.path === currentPage);
        return <Placeholder pageTitle={page?.title || 'Trang không xác định'} />;
    }
  };

  const isAuthenticated = !!currentUser;
  
  const AppContent = () => {
      if (userAwaitingLicense) {
        return <LicenseKeyModal onSuccess={handleLicenseSuccess} />;
      }
      
      if (!isAuthenticated) {
        return <LoginScreen onLoginSuccess={handleLoginSuccess} users={users} />;
      }
      
      // API Key check logic
      if (!apiKey) {
        return <ApiKeyModal onSuccess={handleApiKeySuccess} />;
      }

      // Render the main app
      return (
          <AppLayout 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            handleLogout={handleLogout}
            handleRequestActivation={handleRequestActivation}
            currentUser={currentUser}
          >
            {renderContent()}
          </AppLayout>
        );
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <SettingsProvider>
          <AdvancedSettingsProvider>
            <I18nProvider>
              <SystemInstructionProvider>
                <ExamCreationProvider>
                  <AppContent />
                </ExamCreationProvider>
              </SystemInstructionProvider>
            </I18nProvider>
          </AdvancedSettingsProvider>
        </SettingsProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
