
"use client";

import { useApp } from '@/lib/hooks/use-app';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Timer } from 'lucide-react';
import { useMemo } from 'react';

export default function FloatingStudyTimer() {
    const { 
        isActive, 
        timeLeft, 
        timerMode, 
        phase, 
        customMode
    } = useApp();
    const pathname = usePathname();

    const modes = useMemo(() => ({
        pomodoro: { focus: 25, break: 5 },
        long: { focus: 50, break: 10 },
        deep: { focus: 90, break: 20 },
        custom: { focus: customMode.focus, break: customMode.break }
    }), [customMode]);

    if (!isActive || pathname === '/study') {
        return null;
    }

    const totalDuration = modes[timerMode][phase] * 60;
    const progress = totalDuration > 0 ? (timeLeft / totalDuration) * 100 : 0;
    const circumference = 2 * Math.PI * 18; // 2 * pi * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };
    
    const phaseColorClass = phase === 'focus' ? 'text-primary' : 'text-green-500';

    return (
        <Link href="/study">
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2 h-12 px-4 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg cursor-pointer transition-transform hover:scale-105">
                <div className="relative h-10 w-10">
                    <svg className="w-full h-full" viewBox="0 0 40 40">
                        <circle
                            className="stroke-current text-muted/30"
                            strokeWidth="3"
                            fill="transparent"
                            r="18"
                            cx="20"
                            cy="20"
                        />
                        <circle
                            className={cn("stroke-current", phaseColorClass)}
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="transparent"
                            r="18"
                            cx="20"
                            cy="20"
                            style={{
                                strokeDasharray: circumference,
                                strokeDashoffset: strokeDashoffset,
                                transform: 'rotate(-90deg)',
                                transformOrigin: '50% 50%',
                                transition: 'stroke-dashoffset 0.5s linear'
                            }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                         <Timer className={cn("h-4 w-4", phaseColorClass)} />
                    </div>
                </div>
                <div className="flex flex-col items-start">
                    <span className="font-mono font-bold text-lg leading-none">{formatTime(timeLeft)}</span>
                    <span className={cn("text-xs font-semibold uppercase", phaseColorClass)}>
                        {phase === 'focus' ? 'ENFOQUE' : 'DESCANSO'}
                    </span>
                </div>
            </div>
        </Link>
    );
}
