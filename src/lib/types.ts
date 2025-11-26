import type { LucideIcon } from "lucide-react";

export type User = {
  uid: string;
  name: string;
  email: string;
  center: string;
  ageRange: string;
  course: string;
  className: string;
  role: 'student' | 'teacher' | 'admin';
  avatar: string;
  trophies: number;
  tasks: number;
  exams: number;
  pending: number;
  activities: number;
  organizationId?: string; // e.g., 'ies-torre-del-palau'
};

export type SummaryCardData = {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
};

export type UpcomingClass = {
  id: string;
  subject: string;
  teacher: string;
  time: string;
  notes?: string;
  grade?: string;
};

export type ScheduleEntry = {
  id: string;
  subject: string;
  time: string;
  teacher: string;
  room: string;
  details?: string;
  notes?: string; // from UpcomingClass
};

export type Schedule = {
  Lunes: ScheduleEntry[];
  Martes: ScheduleEntry[];
  Miércoles: ScheduleEntry[];
  Jueves: ScheduleEntry[];
  Viernes: ScheduleEntry[];
};


export type CalendarEvent = {
  id: string;
  title: string;
  date: Date | { seconds: number, nanoseconds: number };
  description: string;
  type: 'personal' | 'class';
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  type?: 'text' | 'image';
};

export type Note = {
    id: string;
    title: string;
    content: string;
    createdAt: { seconds: number, nanoseconds: number };
};
