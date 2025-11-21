import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { summaryCards, upcomingClasses } from "@/lib/data";
import type { SummaryCardData, UpcomingClass } from "@/liby/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

// This is a server component, but it could fetch real user data
async function getUser() {
  // In a real app, this would fetch from your database
  return {
    name: "Alex",
    trophies: 78,
  };
}

export default async function HomePage() {
  const user = await getUser();

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
            Dynamic Class
          </h1>
          <Badge variant="outline">V3.0</Badge>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border bg-card p-2 shadow-sm">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="font-bold">{user.trophies}</span>
            </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="mb-8">
        <h2 className="text-xl font-semibold sm:text-2xl">
          Welcome back, {user.name}!
        </h2>
        <p className="text-muted-foreground">Here's your summary for today.</p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      <section>
        <h3 className="text-xl font-semibold font-headline mb-4">Upcoming Classes</h3>
        <div className="space-y-4">
          {upcomingClasses.map((item) => (
            <UpcomingClassCard key={item.id} {...item} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color }: SummaryCardData) {
  return (
    <Card className="hover:border-primary/50 transition-colors duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-5 w-5 text-muted-foreground", color)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function UpcomingClassCard(item: UpcomingClass) {
    return (
        <Card className="overflow-hidden transition-all hover:shadow-md">
            <Link href="#" className="block hover:bg-muted/50">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="md:col-span-2">
                            <div className="flex items-start justify-between">
                                <h4 className="font-semibold">{item.subject}</h4>
                                {item.grade && <Badge variant="secondary">{item.grade}</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{item.teacher}</p>
                            <p className="text-sm text-muted-foreground">{item.time}</p>
                        </div>
                        <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center md:text-right">
                           <p className="text-sm italic text-muted-foreground line-clamp-2 md:mt-2">{item.notes}</p>
                           <ArrowRight className="h-5 w-5 text-primary shrink-0 ml-4 md:hidden" />
                        </div>
                    </div>
                </CardContent>
            </Link>
        </Card>
    )
}
