"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, BookUser, Users, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/learning-hub/explore", label: "Explorar", icon: Compass },
  { href: "/learning-hub/my-courses", label: "Mis Cursos", icon: BookUser },
  { href: "/learning-hub/classmates", label: "Compañeros", icon: Users },
];

export default function LearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex justify-center bg-muted/20 min-h-screen">
      <div className="relative flex w-full max-w-4xl flex-col bg-background shadow-2xl md:my-8 md:rounded-lg md:border">
        <header className="flex-shrink-0 p-4 border-b flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10 md:rounded-t-lg">
           <Button variant="ghost" size="icon" onClick={() => router.push('/home')}>
                <ArrowLeft />
            </Button>
            <h1 className="text-lg font-bold font-headline">Centro de Aprendizaje</h1>
            <div className="w-9"></div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20">{children}</main>

        <nav className="flex-shrink-0 border-t bg-card/95 backdrop-blur-sm sticky bottom-0 z-10 md:rounded-b-lg">
          <div className="mx-auto grid h-16 max-w-md grid-cols-3 items-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
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
  );
}
