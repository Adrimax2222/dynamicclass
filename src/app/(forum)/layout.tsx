"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, MessageSquare, Star, GraduationCap, Wrench, HelpCircle, ArrowLeft, BookCopy, Wand2, Eye, EyeOff, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: "/forum/community", label: "Comunidad", icon: Users },
  { href: "/forum/actualitat", label: "Actualitat", icon: Newspaper },
  { href: "/forum/ia", label: "IA", icon: Wand2 },
  { href: "/forum/valoracion", label: "Valoración", icon: Star },
  { href: "/forum/discussions", label: "Discusiones", icon: MessageSquare },
  { href: "/forum/clase", label: "Clase", icon: GraduationCap },
  { href: "/forum/resources", label: "Recursos", icon: BookCopy },
  { href: "/forum/recursos-dc", label: "Dynamic Class", icon: Wrench },
  { href: "/forum/ayuda", label: "Ayuda", icon: HelpCircle },
];

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavVisible, setIsNavVisible] = useState(true);

  return (
    <div className="min-h-screen bg-muted/30 md:p-4 lg:p-8 flex justify-center">
      <div className="relative flex w-full max-w-7xl flex-col md:flex-row bg-background shadow-2xl md:rounded-2xl md:border">
        
        {/* Sidebar for Desktop */}
        <nav className="hidden md:flex flex-col w-60 border-r">
          <div className="p-4 border-b h-20 flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
             </div>
             <h1 className="text-lg font-bold font-headline">Foro de la Comunidad</h1>
          </div>
          <div className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                    <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                        isActive && "bg-primary/10 text-primary font-semibold"
                    )}
                    >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    </Link>
                );
            })}
          </div>
           <div className="p-4 border-t">
              <Button variant="outline" className="w-full" onClick={() => router.push('/home')}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Volver
              </Button>
           </div>
        </nav>

        <div className="flex flex-col flex-1 md:h-screen md:overflow-hidden">
            {/* Main Content Area */}
            <main className={cn("flex-1 overflow-y-auto md:pb-0", isNavVisible ? "pb-36" : "pb-24")}>
                {children}
            </main>
            
            {/* Toggle button for mobile */}
            <div className={cn(
                "md:hidden fixed right-4 z-20 transition-all duration-300",
                isNavVisible ? "bottom-36" : "bottom-4"
            )}>
                <Button size="icon" variant="secondary" className="rounded-full shadow-lg" onClick={() => setIsNavVisible(!isNavVisible)}>
                    {isNavVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    <span className="sr-only">Mostrar/Ocultar Navegación</span>
                </Button>
            </div>

            {/* Bottom Nav for Mobile */}
            <AnimatePresence>
                {isNavVisible && (
                    <motion.nav 
                        className="flex-shrink-0 border-t bg-card/95 backdrop-blur-sm sticky bottom-0 z-10 md:hidden"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                    >
                        <div className="mx-auto grid h-32 max-w-md grid-cols-4 items-center">
                            {navItems.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center gap-1 p-2 text-muted-foreground transition-colors hover:text-primary",
                                        isActive && "text-primary"
                                    )}
                                    >
                                    <item.icon className="h-5 w-5" />
                                    <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
