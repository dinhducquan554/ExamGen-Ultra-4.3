import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Loader2, User as UserIcon, Eye, EyeOff } from '../icons';
import { User } from '../../types';
import { useI18n } from '../../hooks/useI18n';

interface LoginScreenProps {
  onLoginSuccess: (user: User, rememberMe: boolean) => void;
  users: User[];
}

const LAST_LOGIN_USERNAME_KEY = 'examgen_last_login_username';
const ATTEMPTS_STORAGE_KEY = 'examgen_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 5;


const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    const lastUsername = localStorage.getItem(LAST_LOGIN_USERNAME_KEY);
    if (lastUsername) {
        setUsername(lastUsername);
    }
  }, []);

  useEffect(() => {
    const normalizedUsername = username.toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === normalizedUsername);
    setFoundUser(user || null);

    if (user) {
      setAvatarUrl(user.avatar);
    } else {
      setAvatarUrl(null);
    }
  }, [username, users]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate an API call with detailed validation
    setTimeout(() => {
      const now = Date.now();
      let attemptsData: { [key: string]: { count: number; lockedUntil: number } } = {};
      try {
        const savedAttempts = sessionStorage.getItem(ATTEMPTS_STORAGE_KEY);
        if (savedAttempts) attemptsData = JSON.parse(savedAttempts);
      } catch (e) {}

      const userAttempts = attemptsData[username.toLowerCase()] || { count: 0, lockedUntil: 0 };

      if (userAttempts.lockedUntil > now) {
        setError(t('login.error.locked', `Tài khoản bị tạm khóa. Vui lòng thử lại sau ${Math.ceil((userAttempts.lockedUntil - now) / 1000 / 60)} phút.`, { minutes: Math.ceil((userAttempts.lockedUntil - now) / 1000 / 60) }));
        setIsLoading(false);
        return;
      }

      if (!foundUser) {
        setError(t('login.error.notFound', 'Tài khoản này chưa được quản trị viên tạo. Vui lòng liên hệ Admin để được cấp quyền đăng nhập.'));
        setIsLoading(false);
        return;
      }

      if (foundUser.status === 'Tạm khóa') {
        setError(t('login.error.disabled', 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ Admin.'));
        setIsLoading(false);
        return;
      }

      if (password !== foundUser.password) {
        const newCount = userAttempts.count + 1;
        if (newCount >= MAX_ATTEMPTS) {
          attemptsData[username.toLowerCase()] = { count: newCount, lockedUntil: now + LOCKOUT_DURATION_MINUTES * 60 * 1000 };
          setError(t('login.error.tooManyAttempts', 'Bạn đã nhập sai quá {maxAttempts} lần. Tài khoản bị tạm khóa trong {minutes} phút.', { maxAttempts: MAX_ATTEMPTS, minutes: LOCKOUT_DURATION_MINUTES }));
        } else {
          attemptsData[username.toLowerCase()] = { count: newCount, lockedUntil: 0 };
          setError(t('login.error.wrongCredentials', 'Tên đăng nhập hoặc mật khẩu không chính xác.'));
        }
        sessionStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attemptsData));
        setIsLoading(false);
        return;
      }

      // Success: Clear attempts and proceed to login
      delete attemptsData[username.toLowerCase()];
      sessionStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attemptsData));
      onLoginSuccess(foundUser, false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
       <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-indigo-950 -z-10"></div>
      <Card className="w-full max-w-sm shadow-2xl border-none animate-in fade-in-0 zoom-in-95">
        <CardHeader className="text-center">
          <div className="relative mx-auto w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 shadow-lg mb-4 overflow-hidden">
            {avatarUrl ? (
                <img key={avatarUrl} src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover animate-in fade-in-0 duration-500" />
            ) : (
                <UserIcon size={48} />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">{t('login.title', 'Đăng nhập ExamGen Ultra 4.3')}</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('login.welcome', 'Chào mừng bạn trở lại!')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">{t('login.usernameLabel', 'Tài khoản')}</Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder={t('login.usernamePlaceholder', 'Tên đăng nhập')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5 relative">
              <Label htmlFor="password">{t('login.passwordLabel', 'Mật khẩu')}</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('login.passwordPlaceholder', '••••••••')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pr-10"
              />
               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
               </button>
            </div>
            
            {error && <p className="text-sm text-red-500 text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-md">{error}</p>}

            {foundUser && foundUser.role === 'Giáo viên' && foundUser.usageLimit != null && (
                <div 
                    className="text-xs text-center text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                    dangerouslySetInnerHTML={{ __html: t('login.trial.remaining', 'Số lần đăng nhập dùng thử còn lại: <strong>{remaining}</strong> / {limit}', { remaining: Math.max(0, foundUser.usageLimit - (foundUser.usageCount || 0)), limit: foundUser.usageLimit }) }}
                />
            )}
            
            <div className="flex items-center justify-end pt-2">
              <a href="#" onClick={(e) => e.preventDefault()} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                {t('login.forgotPassword', 'Quên mật khẩu?')}
              </a>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('login.loggingInButton', 'Đang xử lý...')}
                </>
              ) : (
                t('login.loginButton', 'Đăng nhập')
              )}
            </Button>
          </form>
           <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            {t('login.footer', 'ExamGen Ultra 4.3 – Nền tảng ra đề thông minh dành cho giáo viên Việt Nam.')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;