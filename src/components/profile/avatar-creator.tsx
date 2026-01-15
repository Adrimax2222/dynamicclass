
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PawPrint, Gamepad2, Ghost, Palmtree, Rocket, Pizza, Cat, Heart, Star, Crown, Flame, Dna, Brain, Beaker, Atom, Code } from "lucide-react";

export const SHOP_AVATARS_FEATURED = [
    { id: 'paw', icon: PawPrint, price: 5 },
    { id: 'gamepad', icon: Gamepad2, price: 12 },
    { id: 'ghost', icon: Ghost, price: 8 },
];

export const EXPANDED_SHOP_AVATARS = [
    { id: 'rocket', icon: Rocket, price: 10 },
    { id: 'pizza', icon: Pizza, price: 15 },
    { id: 'cat', icon: Cat, price: 7 },
    { id: 'star', icon: Star, price: 20 },
    { id: 'crown', icon: Crown, price: 50 },
    { id: 'flame', icon: Flame, price: 25 },
    { id: 'dna', icon: Dna, price: 18 },
    { id: 'brain', icon: Brain, price: 30 },
    { id: 'beaker', icon: Beaker, price: 15 },
    { id: 'atom', icon: Atom, price: 22 },
    { id: 'code', icon: Code, price: 10 },
];

export const allShopAvatars = [...SHOP_AVATARS_FEATURED, ...EXPANDED_SHOP_AVATARS];
const shopAvatarMap = new Map(allShopAvatars.map(item => [item.id, { ...item, icon: item.icon }]));


interface AvatarDisplayProps {
    user: Partial<User>;
    className?: string;
}

export function AvatarDisplay({ user, className }: AvatarDisplayProps) {
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
