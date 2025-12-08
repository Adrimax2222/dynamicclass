
"use client";

import { useState, useEffect, useRef } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Schedule } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Building, Info, User, Sandwich } from "lucide-react";
import { TeacherInfoDialog } from "./teacher-info-dialog";

interface FullScheduleViewProps {
    scheduleData: Schedule;
    selectedClassId?: string;
}

const PatioSeparator = () => (
    <div className="flex items-center justify-center gap-2 my-2 rounded-md bg-blue-500/10 py-2 px-4 text-sm font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
        <Sandwich className="h-4 w-4" />
        <span>PATIO</span>
    </div>
);

export function FullScheduleView({ scheduleData, selectedClassId }: FullScheduleViewProps) {
    const today = new Date().toLocaleString('es-ES', { weekday: 'long' });
    const itemRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
    const [isMounted, setIsMounted] = useState(false);
    
    // Find which day the selected class is on to set the default tab
    const findDefaultTab = () => {
        if (selectedClassId) {
            for (const day in scheduleData) {
                // Capitalize day to match keys in scheduleData
                const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
                if (scheduleData[capitalizedDay as keyof Schedule]?.some(entry => entry.id === selectedClassId)) {
                    return capitalizedDay;
                }
            }
        }
        // Fallback to today, but make sure today is a valid key.
        const capitalizedToday = today.charAt(0).toUpperCase() + today.slice(1);
        const validDays = Object.keys(scheduleData);
        return validDays.includes(capitalizedToday) ? capitalizedToday : validDays[0];
    }
    
    const defaultTab = findDefaultTab();

    const dayAbbreviations: Record<string, string> = {
        Lunes: 'Lun',
        Martes: 'Mar',
        Miércoles: 'Mié',
        Jueves: 'Jue',
        Viernes: 'Vie',
    }

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && selectedClassId) {
            // Delay scrolling slightly to ensure the element is in the DOM and visible
            setTimeout(() => {
                const itemEl = itemRefs.current.get(`item-${selectedClassId}`);
                if (itemEl) {
                    itemEl.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 100);
        }
    }, [isMounted, selectedClassId]);

    if (!isMounted) {
        return null;
    }

    const renderScheduleEntry = (entry: any) => {
        const isSelected = entry.id === selectedClassId;
        return (
            <div key={entry.id} ref={(node) => itemRefs.current.set(`item-${entry.id}`, node)}>
                <AccordionItem 
                    value={`item-${entry.id}`} 
                    className={cn(isSelected && 'border-primary rounded-lg bg-primary/10')}
                >
                    <AccordionTrigger className="hover:no-underline px-4">
                        <div className="flex-1 text-left">
                            <p className="font-bold">{entry.subject}</p>
                            <p className="text-sm text-muted-foreground">{entry.time}</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 px-4">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="flex items-center gap-1.5">
                                {entry.teacher}
                                <TeacherInfoDialog />
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{entry.room}</span>
                        </div>
                        {entry.details && (
                            <div className="flex items-start gap-2 text-sm pt-2">
                                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <p className="italic">{entry.details}</p>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </div>
        );
    };

    return (
        <Tabs defaultValue={defaultTab} className="w-full flex-1 flex flex-col min-h-0">
            <div className="px-6">
                <TabsList className="grid w-full grid-cols-5 h-auto">
                    {Object.keys(scheduleData).map(day => (
                        <TabsTrigger key={day} value={day} className="py-2 text-xs sm:text-sm">{dayAbbreviations[day] || day}</TabsTrigger>
                    ))}
                </TabsList>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-4">
                    {Object.entries(scheduleData).map(([day, entries]) => (
                        <TabsContent key={day} value={day} className="mt-0">
                            <Accordion type="single" collapsible defaultValue={selectedClassId ? `item-${selectedClassId}` : undefined}>
                                {entries.slice(0, 3).map(renderScheduleEntry)}
                                <PatioSeparator />
                                {entries.slice(3).map(renderScheduleEntry)}
                            </Accordion>
                        </TabsContent>
                    ))}
                </div>
            </div>
        </Tabs>
    );
}
