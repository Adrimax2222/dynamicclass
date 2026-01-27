
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Info, Sparkles, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/hooks/use-app";

const navItems = [
  { href: "/home", label: "Inicio", icon: Home },
  { href: "/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/courses", label: "Info", icon: Info },
  { href: "/chatbot", label: "IA", icon: Sparkles },
  { href: "/profile", label: "Perfil", icon: UserCircle },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { hasNewAnnouncements, hasNewChatMessages } = useApp();
  const hasNotifications = hasNewAnnouncements || hasNewChatMessages;

  return (
    <nav className="border-t bg-card/95 backdrop-blur-sm">
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/home' && pathname.startsWith(item.href));
          const isInfoTabWithNotification = item.href === '/courses' && hasNotifications;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 p-2 text-muted-foreground transition-colors hover:text-primary",
                isActive && "text-primary"
              )}
            >
              {isInfoTabWithNotification && <span className="absolute top-2 right-4 block h-2.5 w-2.5 rounded-full bg-blue-500" />}
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
