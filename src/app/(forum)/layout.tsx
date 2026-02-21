"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, MessageSquare, BookCopy, UserCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/forum/community", label: "Comunidad", icon: Users },
  { href: "/forum/discussions", label: "Discusiones", icon: MessageSquare },
  { href: "/forum/resources", label: "Recursos", icon: BookCopy },
  { href: "/forum/members", label: "Miembros", icon: UserCircle },
];

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

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
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                {children}
            </main>

            {/* Bottom Nav for Mobile */}
            <nav className="flex-shrink-0 border-t bg-card/95 backdrop-blur-sm sticky bottom-0 z-10 md:hidden">
            <div className="mx-auto grid h-16 max-w-md grid-cols-4 items-center">
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
                    <item.icon className="h-6 w-6" />
                    <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                );
                })}
            </div>
            </nav>
        </div>

      </div>
    </div>
  );
}
