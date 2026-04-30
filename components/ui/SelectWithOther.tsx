import React, { useState, useEffect } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './Select';
import { Input } from './Input';
import { Button } from './Button';
import { ChevronLeft, Search } from '../icons';

interface SelectWithOtherProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}

const OTHER_VALUE = 'Khác...';

export const SelectWithOther: React.FC<SelectWithOtherProps> = ({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  disabled = false,
}) => {
  const isPredefinedOption = options.includes(value);
  const [isInputMode, setIsInputMode] = useState(!isPredefinedOption && !!value);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Đồng bộ hóa chế độ hiển thị nếu `value` prop thay đổi từ bên ngoài
    if (isPredefinedOption) {
      if (isInputMode) setIsInputMode(false);
    } else if (value) { 
      if (!isInputMode) setIsInputMode(true);
    }
  }, [value, isPredefinedOption, isInputMode]);


  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === OTHER_VALUE) {
      setIsInputMode(true);
      onValueChange(''); // Xóa giá trị để người dùng nhập mới
    } else {
      setIsInputMode(false);
      onValueChange(selectedValue);
    }
    setSearchTerm(''); // Reset tìm kiếm khi chọn xong
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(e.target.value);
  };

  const handleBackToSelect = () => {
    setIsInputMode(false);
    onValueChange('');
    setSearchTerm('');
  };

  if (disabled) {
    return <Input id={id} value={value} placeholder={placeholder} disabled />;
  }

  if (isInputMode) {
    return (
      <div className="relative" id={id}>
        <Input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder="Nhập giá trị khác"
          className="pr-10"
          autoFocus
        />
        <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 h-auto"
            onClick={handleBackToSelect}
            title="Quay lại danh sách"
        >
            <ChevronLeft className="w-5 h-5 text-slate-500" />
        </Button>
      </div>
    );
  }

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id={id}>
      <Select onValueChange={handleSelectChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="p-0 overflow-hidden">
          <div className="p-2 sticky top-0 bg-white dark:bg-slate-800 z-10 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 placeholder-slate-400"
                    onKeyDown={(e) => e.stopPropagation()} 
                />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                    {option}
                    </SelectItem>
                ))
            ) : (
                <div className="p-3 text-sm text-center text-slate-500 dark:text-slate-400 italic">
                    Không tìm thấy "{searchTerm}"
                </div>
            )}
            <SelectItem value={OTHER_VALUE} className="font-semibold text-indigo-600 dark:text-indigo-400 border-t border-slate-100 dark:border-slate-700 mt-1">
                {OTHER_VALUE}
            </SelectItem>
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};