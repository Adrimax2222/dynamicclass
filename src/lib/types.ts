

import type { LucideIcon } from "lucide-react";
import type { Timestamp } from "firebase/firestore";

export type Theme = 'light' | 'dark';
export type Language = 'esp' | 'cat' | 'eng' | 'mad';

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
  isChatBanned?: boolean;
  accessCount?: number;
  adminAccessCount?: number;
  hasSeenOnboarding?: boolean;
  theme?: Theme;
  isChatBubbleVisible?: boolean;
  isClassChatBubbleVisible?: boolean;
  isStudyBubbleVisible?: boolean;
  saveScannedDocs?: boolean;
  language?: Language;
  weeklySummary?: boolean;
  emailNotifications?: boolean;
  plantCount?: number;
  desertRunHighScore?: number;
  flappyBotHighScore?: number;
  createdAt?: Timestamp;
};

export type ReservedCourse = {
  uid: string; // The doc ID
  courseTitle: string;
  category: string;
  progress: number;
  reservedAt: Timestamp;
};

// Simplified user type for center management
export type CenterUser = Pick<User, 'uid' | 'name' | 'email' | 'avatar' | 'role' | 'course' | 'className' | 'isChatBanned'>;


export type ClassDefinition = {
  name: string;
  icalUrl?: string;
  schedule?: Schedule;
  imageUrl?: string;
  description?: string;
  isChatEnabled?: boolean;
  isPinned?: boolean;
  color?: string;
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
  uid: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Timestamp;
};

export type ClassChatMessage = {
  uid: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  timestamp: Timestamp;
  viewedBy?: string[];
  isPinned?: boolean;
  editedAt?: Timestamp;
  replyToAuthor?: string;
  replyToContent?: string;
};

export type Note = {
    uid: string;
    title: string;
    content: string;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
    color?: string;
    isPinned?: boolean;
};

export type AnnouncementScope = 'general' | 'center' | 'class';
export type AnnouncementType = 'text' | 'poll' | 'file';

export type PollOption = {
  id: string;
  text: string;
};

export type Announcement = {
  uid: string;
  text?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: Timestamp;
  scope: AnnouncementScope;
  centerId?: string;
  className?: string;
  likedBy?: string[];
  likes?: number;
  isPinned?: boolean;
  viewedBy?: string[];
  reactions?: { [key: string]: string[] };
  
  // Poll fields
  type: AnnouncementType;
  pollQuestion?: string;
  pollOptions?: PollOption[];
  pollVoteCounts?: { [optionId: string]: number };
  votedUserIds?: string[];
  allowMultipleVotes?: boolean;
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

export type TimerMode = "pomodoro" | "long" | "deep" | "custom";
export type Phase = "focus" | "break";

export interface CustomMode {
  focus: number;
  break: number;
}
