'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    Users, 
    MessageSquare, 
    BookCopy, 
    Newspaper, 
    GraduationCap, 
    Star, 
    HelpCircle, 
    Sparkles, 
    ArrowLeft,
    Menu,
    X,
    LayoutDashboard,
    Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useApp } from '@/lib/hooks/use-app';
import { AvatarDisplay } from '@/components/profile/avatar-creator';

const navItems = [
  { href: "/forum/community", label: "Comunitat", icon: Users },
  { href: "/forum/actualitat", label: "Actualitat", icon: Newspaper },
  { href: "/forum/clase", label: "La Meva Classe", icon: GraduationCap },
  { href: "/forum/discussions", label: "Discussions", icon: MessageSquare },
  { href: "/forum/resources", label: "Recursos", icon: BookCopy },
  { href: "/forum/valoracion", label: "Valoracions", icon: Star },
  { href: "/forum/recursos-dc", label: "Dynamic Class", icon: Wrench },
  { href: "/forum/ia", label: "Eines IA", icon: Sparkles },
  { href: "/forum/ayuda", label: "Ajuda", icon: HelpCircle },
];

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const SidebarContent = () => (
    <>
        <div className="p-4 border-b h-16 flex items-center justify-between">
            <Link href="/forum" className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-base font-bold font-headline">Fòrum</h1>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-5 w-5" />
            </Button>
        </div>
        <div className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
                <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    isActive && "bg-primary/10 text-primary font-semibold"
                )}
                onClick={() => setIsSidebarOpen(false)}
                >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                </Link>
            );
        })}
        </div>
        <div className="p-2 border-t space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/home')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Tornar a l'inici
            </Button>
            {user && (
                <Link href="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                    <AvatarDisplay user={user} className="h-9 w-9" />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                </Link>
            )}
        </div>
    </>
  );

  return (
    <div className="flex w-full min-h-screen bg-muted/40">
        {/* Sidebar for Desktop */}
        <nav className="hidden md:flex flex-col w-60 border-r bg-background">
          <SidebarContent />
        </nav>

        {/* Sidebar for Mobile (Drawer) */}
        {isSidebarOpen && (
            <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setIsSidebarOpen(false)}>
                <div className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-background border-r" onClick={e => e.stopPropagation()}>
                    <SidebarContent />
                </div>
            </div>
        )}

        <div className="flex flex-col flex-1 h-screen">
            {/* Top Header for Mobile */}
            <header className="md:hidden flex items-center justify-between px-2 border-b h-16 bg-background/95 backdrop-blur-sm sticky top-0 z-30">
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                    <Menu className="h-6 w-6" />
                </Button>
                <h2 className="font-bold text-lg">{navItems.find(i => i.href === pathname)?.label || 'Fòrum'}</h2>
                <div className="w-10">
                    {user && <AvatarDisplay user={user} className="h-8 w-8" />}
                </div>
            </header>
            
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    </div>
  );
}
