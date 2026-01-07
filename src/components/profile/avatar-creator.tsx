
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PawPrint, Gamepad2, Ghost, Palmtree, Rocket, Pizza, Cat, Heart } from "lucide-react";

const SHOP_AVATARS = [
    { id: 'paw', icon: PawPrint },
    { id: 'gamepad', icon: Gamepad2 },
    { id: 'ghost', icon: Ghost },
    { id: 'palmtree', icon: Palmtree },
    { id: 'rocket', icon: Rocket },
    { id: 'pizza', icon: Pizza },
    { id: 'cat', icon: Cat },
    { id: 'heart', icon: Heart },
];

const shopAvatarMap = new Map(SHOP_AVATARS.map(item => [item.id, item]));

interface AvatarDisplayProps {
    user: Partial<User>;
    className?: string;
    showHat?: boolean;
}

export function AvatarDisplay({ user, className, showHat = false }: AvatarDisplayProps) {
    const avatarUrl = user.avatar;
    const name = user.name || '';
    
    if (!avatarUrl || typeof avatarUrl !== 'string') {
        return (
            <div className={cn("relative inline-block", className)}>
                <Avatar className="w-full h-full">
                    <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            </div>
        );
    }
    
    const parts = avatarUrl.split('_');
    const id = parts[0];
    let letter, color;
    
    if (id === 'letter') {
        letter = parts[1];
        color = parts[2];
    } else {
        color = parts[1];
    }

    const Icon = shopAvatarMap.get(id)?.icon;

    if (Icon || letter) {
        return (
            <div className={cn("relative inline-block", className)}>
                <Avatar className="w-full h-full">
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: color ? `#${color}` : '#737373' }}>
                        {letter ? (
                            <span className="font-bold text-4xl text-white">{letter}</span>
                        ) : Icon ? (
                            <Icon className="h-[60%] w-[60%] text-white" />
                        ) : (
                            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        )}
                    </div>
                </Avatar>
            </div>
        );
    }
    
    // Fallback for original URL-based avatars from Google Sign In
    return (
        <div className={cn("relative inline-block", className)}>
            <Avatar className="w-full h-full">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
        </div>
    );
}
