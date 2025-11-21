"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calendarEvents as initialEvents } from "@/lib/data";
import type { CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

type CalendarType = "personal" | "class" | "all";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [calendarType, setCalendarType] = useState<CalendarType>("all");

  const filteredEvents = events.filter(
    (event) => calendarType === "all" || event.type === calendarType
  );

  const eventsOnSelectedDate = filteredEvents.filter(
    (event) => date && format(event.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
  );

  const addEvent = (newEvent: Omit<CalendarEvent, "id">) => {
    setEvents([...events, { ...newEvent, id: Date.now().toString() }]);
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6">
      <header className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-2xl font-bold font-headline tracking-tighter sm:text-3xl">
                Calendar
            </h1>
            <p className="text-muted-foreground">Manage your tasks and events.</p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Select onValueChange={(value: CalendarType) => setCalendarType(value)} defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select calendar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Calendars</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="class">Class</SelectItem>
            </SelectContent>
          </Select>
          <AddEventDialog onAddEvent={addEvent} />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full"
                modifiers={{
                  hasEvent: filteredEvents.map((event) => event.date),
                }}
                modifiersClassNames={{
                  hasEvent: "bg-primary/20 rounded-full",
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <h2 className="mb-4 text-lg font-semibold">
            Events on {date ? format(date, "MMMM d") : "selected date"}
          </h2>
          <Card className="h-[433px]">
            <CardContent className="p-4">
              {eventsOnSelectedDate.length > 0 ? (
                <ul className="space-y-3">
                  {eventsOnSelectedDate.map((event) => (
                    <li key={event.id} className="rounded-lg border bg-background p-3">
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <span className={cn("mt-2 inline-block px-2 py-0.5 text-xs rounded-full", event.type === 'class' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800')}>{event.type}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">No events for this day.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AddEventDialog({ onAddEvent }: { onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date|undefined>(new Date());
  const [type, setType] = useState<"personal" | "class">("personal");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    if (title && date) {
      onAddEvent({ title, description, date, type });
      setTitle("");
      setDescription("");
      setDate(new Date());
      setIsOpen(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="icon" aria-label="Add Event">
          <PlusCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
           <div className="space-y-2">
            <Label>Date</Label>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select onValueChange={(v: "personal"|"class") => setType(v)} defaultValue={type}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="class">Class</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Add Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
