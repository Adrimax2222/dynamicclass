"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ViewContainerProps {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}

export const ViewContainer = ({ title, children, onBack }: ViewContainerProps) => {
    return (
        <div className="flex flex-col h-full">
            <header className="p-4 flex items-center justify-center relative flex-shrink-0">
                {onBack && (
                    <Button variant="ghost" size="icon" onClick={onBack} className="absolute left-3 top-1/2 -translate-y-1/2">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                )}
                <h3 className="text-lg font-bold">{title}</h3>
            </header>
            <div className="flex-1 overflow-y-auto p-4">
                {children}
            </div>
        </div>
    );
};
