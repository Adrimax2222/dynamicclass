import type { LucideIcon } from "lucide-react";

export type User = {
  name: string;
  email: string;
  center: string;
  ageRange: string;
  role: 'student' | 'teacher';
  avatar: string;
  trophies: number;
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

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  description: string;
  type: 'personal' | 'class';
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
};
