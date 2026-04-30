import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Loader2, KeySquare, Copy, CheckCircle2 } from '../icons';

interface LicenseKeyModalProps {
  onSuccess: (key: string) => void;
}

const MACHINE_ID_KEY = 'examgen_machine_id';

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
  // Simple "crypto" simulation: reverse the base64 of the machineId and prepend a prefix.
  return 'EG-ULTRA-' + btoa(machineId).split('').reverse().join('');
};

const LicenseKeyModal: React.FC<LicenseKeyModalProps> = ({ onSuccess }) => {
  const [key, setKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [machineId, setMachineId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleShowMachineId = () => {
    setMachineId(getMachineId());
  };

  const handleCopy = () => {
    if (!machineId) return;
    navigator.clipboard.writeText(machineId).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const currentMachineId = getMachineId();
      const expectedKey = generateKeyForMachine(currentMachineId);

      if (key.trim() === expectedKey) {
        onSuccess(key.trim());
      } else {
        setError('Mã key không hợp lệ hoặc không dành cho máy này. Vui lòng kiểm tra lại.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-white to-yellow-100 dark:from-gray-900 dark:via-gray-950 dark:to-yellow-950 -z-10"></div>
      <Card className="w-full max-w-md shadow-2xl border-none animate-in fade-in-0 zoom-in-95">
        <CardHeader className="text-center">
          <KeySquare className="mx-auto w-12 h-12 text-yellow-500 mb-4" />
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Yêu cầu kích hoạt</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bản dùng thử của bạn đã hết hạn. Vui lòng làm theo các bước sau để kích hoạt bản quyền.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleActivate} className="space-y-6">
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <Label className="font-semibold text-gray-800 dark:text-gray-100">Bước 1: Lấy Machine ID</Label>
              <p className="text-sm text-gray-600 dark:text-gray-300">Nhấn vào nút bên dưới để lấy Machine ID của bạn và gửi nó cho quản trị viên.</p>
              {!machineId ? (
                <Button type="button" variant="outline" onClick={handleShowMachineId} className="w-full">
                  Lấy Machine ID của bạn
                </Button>
              ) : (
                <div className="relative">
                  <Input value={machineId} readOnly className="pr-10 bg-white dark:bg-gray-900 font-mono text-sm" />
                  <Button type="button" variant="ghost" size="sm" onClick={handleCopy} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-auto">
                    {isCopied ? <CheckCircle2 className="w-5 h-5 text-green-500"/> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="license-key" className="font-semibold">Bước 2: Kích hoạt</Label>
               <p className="text-sm text-gray-600 dark:text-gray-300">Nhập mã kích hoạt (Activation Key) bạn nhận được từ quản trị viên.</p>
              <Input
                id="license-key"
                type="text"
                placeholder="VD: EG-ULTRA-..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang kiểm tra...
                </>
              ) : (
                'Kích hoạt'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LicenseKeyModal;
