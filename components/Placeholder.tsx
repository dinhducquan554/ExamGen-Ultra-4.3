

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface PlaceholderProps {
    pageTitle: string;
    message?: string;
    icon?: React.ReactNode;
}

const Placeholder: React.FC<PlaceholderProps> = ({ pageTitle, message, icon }) => {
    return (
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">{pageTitle}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mt-6 text-5xl text-slate-400 dark:text-slate-500 flex justify-center items-center">
                    {icon || <span className="animate-bounce">🚧</span>}
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-4">
                    {message || 'Nội dung cho trang này đang được xây dựng. Vui lòng quay lại sau!'}
                </p>
            </CardContent>
        </Card>
    );
};

export default Placeholder;