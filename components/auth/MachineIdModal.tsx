import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { KeySquare, XCircle, Copy, CheckCircle2 } from '../icons';

interface MachineIdModalProps {
  isOpen: boolean;
  onClose: () => void;
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


const MachineIdModal: React.FC<MachineIdModalProps> = ({ isOpen, onClose }) => {
    const [isCopied, setIsCopied] = useState(false);
    const machineId = getMachineId();

    const handleCopy = () => {
        navigator.clipboard.writeText(machineId).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md transform animate-in fade-in-0 zoom-in-95" onClick={e => e.stopPropagation()}>
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold"><KeySquare className="w-5 h-5"/>Machine ID của bạn</CardTitle>
                    <Button type="button" variant="ghost" size="sm" onClick={onClose} className="rounded-full w-8 h-8 p-0"><XCircle className="w-5 h-5" /></Button>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Vui lòng sao chép mã này và gửi cho quản trị viên của bạn để nhận mã kích hoạt (Activation Key).</p>
                    <div>
                        <Label htmlFor="machine-id-display">Machine ID</Label>
                         <div className="relative mt-1">
                            <Input
                                id="machine-id-display"
                                readOnly
                                value={machineId}
                                className="pr-10 bg-gray-100 dark:bg-gray-800 font-mono text-sm"
                            />
                            <Button type="button" variant="ghost" size="sm" onClick={handleCopy} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-auto">
                                {isCopied ? <CheckCircle2 className="w-5 h-5 text-green-500"/> : <Copy className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>
                     <Button onClick={onClose} className="w-full">Đã hiểu</Button>
                </CardContent>
            </div>
        </div>
    );
};

export default MachineIdModal;
