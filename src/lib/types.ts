

import type { LucideIcon } from "lucide-react";
import type { Timestamp } from "firebase/firestore";

export type User = {
  uid: string;
  name: string;
  email: string;
  center: string;
  ageRange: string;
  course: string;
  className: string;
  role: 'student' | 'teacher' | 'admin' | string; // Allow dynamic admin roles like 'admin-4ESO-B'
  avatar: string;
  trophies: number;
  tasks: number;
  exams: number;
  pending: number;
  activities: number;
  studyMinutes?: number;
  streak?: number;
  lastStudyDay?: string;
  organizationId?: string; // e.g., 'ies-torre-del-palau'
  isNewUser?: boolean;
  ownedAvatars?: string[];
  isBanned?: boolean;
};

// Simplified user type for center management
export type CenterUser = Pick<User, 'uid' | 'name' | 'email' | 'avatar' | 'role' | 'course' | 'className'>;


export type ClassDefinition = {
  name: string;
  icalUrl?: string;
  schedule?: Schedule;
}

export type Center = {
    uid: string;
    name: string;
    code: string;
    classes: ClassDefinition[];
    createdAt: Timestamp;
    imageUrl?: string;
    isPinned?: boolean;
};

export type SummaryCardData = {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  isAnnouncement: boolean;
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

export type Chat = {
  id: string;
  title: string;
  createdAt: Timestamp;
  userId: string;
};

export type ResponseLength = 'breve' | 'normal' | 'detallada';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Timestamp;
};

export type Note = {
    id: string;
    title: string;
    content: string;
    createdAt: { seconds: number, nanoseconds: number };
};

export type AnnouncementScope = 'general' | 'center' | 'class';

export type Announcement = {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: { seconds: number, nanoseconds: number };
  scope: AnnouncementScope;
  centerId?: string; // ID of the center if scope is 'center' or 'class'
  className?: string; // Name of the class if scope is 'class', e.g. "4ESO-B"
  likedBy?: string[];
  likes?: number;
  isPinned?: boolean;
  viewedBy?: string[];
};

export type CompletedItem = {
    id: string;
    title: string;
    type: 'task' | 'exam';
    completedAt: Timestamp;
};

export type UserToken = {
    token: string;
    updatedAt: Timestamp;
}

export type ScannedDocument = {
  id: number;
  name: string;
  timestamp: string;
  thumbnail: string;
  pages: string[];
}
