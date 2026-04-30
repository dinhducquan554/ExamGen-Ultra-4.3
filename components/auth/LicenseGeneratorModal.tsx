import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { Loader2, KeySquare, XCircle, Copy, CheckCircle2 } from '../icons';
import { useToast } from '../../hooks/useToast';

interface LicenseGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const generateKeyForMachine = (machineId: string): string => {
  if (!machineId) return '';
  return 'EG-ULTRA-' + btoa(machineId).split('').reverse().join('');
};

const LicenseGeneratorModal: React.FC<LicenseGeneratorModalProps> = ({ isOpen, onClose }) => {
    const { addToast } = useToast();
    const [machineIdInput, setMachineIdInput] = useState('');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = () => {
        if (!machineIdInput.trim()) {
            addToast("Vui lòng nhập Machine ID của người dùng.");
            return;
        }
        setIsGenerating(true);
        setTimeout(() => {
            const key = generateKeyForMachine(machineIdInput.trim());
            setGeneratedKey(key);
            setIsGenerating(false);
        }, 500);
    };

    const handleCopy = () => {
        if (!generatedKey) return;
        navigator.clipboard.writeText(generatedKey).then(() => {
            setCopied(true);
            addToast("Đã sao chép key vào clipboard.");
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg transform animate-in fade-in-0 zoom-in-95" onClick={e => e.stopPropagation()}>
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100"><KeySquare className="w-5 h-5"/> Tạo Key bản quyền theo Machine ID</CardTitle>
                    <Button type="button" variant="ghost" size="sm" onClick={onClose} className="rounded-full w-8 h-8 p-0"><XCircle className="w-5 h-5" /></Button>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div>
                        <Label htmlFor="machine-id">Machine ID của người dùng</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Yêu cầu người dùng cung cấp mã này từ phần mềm của họ.</p>
                        <div className="flex items-center gap-2">
                            <Input
                                id="machine-id"
                                type="text"
                                placeholder="VD: MACHINE-16..."
                                value={machineIdInput}
                                onChange={(e) => setMachineIdInput(e.target.value)}
                                disabled={isGenerating}
                            />
                            <Button onClick={handleGenerate} disabled={isGenerating} className="flex-shrink-0">
                                {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Tạo Key
                            </Button>
                        </div>
                    </div>

                    {generatedKey && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                            <Label>Key đã tạo</Label>
                            <div className="relative mt-1">
                                <Input
                                    readOnly
                                    value={generatedKey}
                                    className="pr-10 bg-gray-100 dark:bg-gray-800 font-mono text-sm"
                                />
                                <Button type="button" variant="ghost" size="sm" onClick={handleCopy} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-auto">
                                    {copied ? <CheckCircle2 className="w-5 h-5 text-green-500"/> : <Copy className="w-5 h-5" />}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </div>
        </div>
    );
};

export default LicenseGeneratorModal;