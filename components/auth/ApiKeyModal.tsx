import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Loader2, KeySquare } from '../icons';

interface ApiKeyModalProps {
  onSuccess: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSuccess }) => {
  const [key, setKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('Vui lòng nhập API Key.');
      return;
    }
    setError('');
    setIsLoading(true);

    // No real validation here, just save and assume it's correct.
    setTimeout(() => {
      onSuccess(key.trim());
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-indigo-950 -z-10"></div>
      <Card className="w-full max-w-lg text-center shadow-2xl border-none">
        <CardHeader>
          <KeySquare className="mx-auto w-12 h-12 text-gray-400 mb-4" />
          <CardTitle className="text-2xl font-bold">Cần có Khóa API Gemini</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 pt-2">
            Để sử dụng các tính năng AI của ExamGen Ultra, bạn cần cung cấp Khóa API Gemini của mình.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <Label htmlFor="api-key">Gemini API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Nhập API Key của bạn vào đây"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <p className="text-xs text-left text-gray-500">
                Bạn có thể lấy khóa API của mình từ <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Google AI Studio</a>.
            </p>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu và Tiếp tục'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyModal;