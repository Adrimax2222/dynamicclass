
"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AVATAR_COLORS = [
    { name: 'Red', value: 'F87171' },
    { name: 'Amber', value: 'FBBF24' },
    { name: 'Emerald', value: '34D399' },
    { name: 'Blue', value: '60A5FA' },
    { name: 'Violet', value: 'A78BFA' },
    { name: 'Pink', value: 'F472B6' },
];

interface AvatarCreatorProps {
    currentAvatarUrl: string;
    onAvatarChange: (newAvatarUrl: string) => void;
}

export function AvatarCreator({ currentAvatarUrl, onAvatarChange }: AvatarCreatorProps) {
    const [initial, setInitial] = useState('A');
    const [color, setColor] = useState('A78BFA');

    // Effect to parse the initial and color from the URL when the component mounts or the URL changes
    useEffect(() => {
        try {
            if (currentAvatarUrl && currentAvatarUrl.includes('placehold.co')) {
                const url = new URL(currentAvatarUrl);
                const pathParts = url.pathname.split('/');
                const newColor = pathParts[2] || 'A78BFA';
                const textParam = url.searchParams.get('text');
                const newInitial = textParam ? textParam.charAt(0).toUpperCase() : 'A';
                
                setInitial(newInitial);
                setColor(newColor);
            } else if (!currentAvatarUrl) {
                // If there's no URL, generate a default one
                onAvatarChange(`https://placehold.co/100x100/${color}/FFFFFF?text=${initial}`);
            }
        } catch (e) {
            console.error("Failed to parse avatar URL", e);
             // On failure, set a default
            setInitial('A');
            setColor('A78BFA');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAvatarUrl]);

    const handleInitialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newInitial = e.target.value.trim().toUpperCase() || 'A';
        setInitial(newInitial);
        const newAvatarUrl = `https://placehold.co/100x100/${color}/FFFFFF?text=${newInitial}`;
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
                <Label htmlFor="initial-input" className="text-right">Inicial</Label>
                <Input 
                    id="initial-input"
                    value={initial}
                    onChange={handleInitialChange}
                    maxLength={1}
                    className="col-span-2"
                />
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

    