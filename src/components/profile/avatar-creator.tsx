
"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const AVATAR_COLORS = [
    { name: 'Red', value: 'F87171' },
    { name: 'Amber', value: 'FBBF24' },
    { name: 'Emerald', value: '34D399' },
    { name: 'Blue', value: '60A5FA' },
    { name: 'Violet', value: 'A78BFA' },
    { name: 'Pink', value: 'F472B6' },
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

interface AvatarCreatorProps {
    currentAvatarUrl: string;
    onAvatarChange: (newAvatarUrl: string) => void;
}

// Helper to extract params from a placehold.co URL
const extractUrlParams = (url: string): { initial: string; color: string } => {
    try {
        if (!url || !url.includes('placehold.co')) {
            return { initial: 'A', color: 'A78BFA' };
        }
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const color = pathParts[2] || 'A78BFA';
        const textParam = urlObj.searchParams.get('text');
        const initial = textParam ? textParam.charAt(0).toUpperCase() : 'A';
        return { initial, color };
    } catch (e) {
        console.error("Failed to parse avatar URL, returning defaults", e);
        return { initial: 'A', color: 'A78BFA' };
    }
};

export function AvatarCreator({ currentAvatarUrl, onAvatarChange }: AvatarCreatorProps) {
    const { initial: initialInitial, color: initialColor } = extractUrlParams(currentAvatarUrl);
    
    const [initial, setInitial] = useState(initialInitial);
    const [color, setColor] = useState(initialColor);

    // Effect to update local state if the prop changes from outside (e.g., switching tabs)
    useEffect(() => {
        const { initial: newInitial, color: newColor } = extractUrlParams(currentAvatarUrl);
        setInitial(newInitial);
        setColor(newColor);
    }, [currentAvatarUrl]);

    const handleInitialChange = (newInitial: string) => {
        const finalInitial = newInitial.trim().toUpperCase() || 'A';
        setInitial(finalInitial);
        const newAvatarUrl = `https://placehold.co/100x100/${color}/FFFFFF?text=${finalInitial}`;
        onAvatarChange(newAvatarUrl);
    };
    
    const handleColorChange = (newColor: string) => {
        setColor(newColor);
        const newAvatarUrl = `https://placehold.co/100x100/${newColor}/FFFFFF?text=${initial}`;
        onAvatarChange(newAvatarUrl);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 items-center">
                <Label htmlFor="initial-select" className="text-right">Inicial</Label>
                <div className="col-span-2">
                    <Select onValueChange={handleInitialChange} value={initial}>
                        <SelectTrigger id="initial-select">
                            <SelectValue placeholder="Selecciona una letra" />
                        </SelectTrigger>
                        <SelectContent>
                            {ALPHABET.map(letter => (
                                <SelectItem key={letter} value={letter}>{letter}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
                <Label className="text-right">Color</Label>
                <div className="col-span-2 grid grid-cols-6 gap-2">
                    {AVATAR_COLORS.map(c => (
                        <button 
                            key={c.value} 
                            type="button" 
                            onClick={() => handleColorChange(c.value)} 
                            className={cn("w-8 h-8 rounded-full border", color === c.value && "ring-2 ring-primary ring-offset-2")} 
                            style={{ backgroundColor: `#${c.value}` }}
                            aria-label={`Select ${c.name} color`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
