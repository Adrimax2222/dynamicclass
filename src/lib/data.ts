import type { SummaryCardData, UpcomingClass, CalendarEvent } from './types';
import { NotebookText, FileCheck2, Clock, ListChecks, Trophy, Medal, Star } from 'lucide-react';

export const summaryCards: SummaryCardData[] = [
  { title: 'Homework', value: 3, icon: NotebookText, color: 'text-blue-500' },
  { title: 'Exams', value: 1, icon: FileCheck2, color: 'text-red-500' },
  { title: 'Pending', value: 5, icon: Clock, color: 'text-yellow-500' },
  { title: 'Tasks', value: 8, icon: ListChecks, color: 'text-green-500' },
];

export const upcomingClasses: UpcomingClass[] = [
  {
    id: '1',
    subject: 'Quantum Physics',
    teacher: 'Dr. Evelyn Reed',
    time: '10:00 AM - 11:30 AM',
    notes: 'Chapter 4 review. Prepare questions.',
    grade: 'A-',
  },
  {
    id: '2',
    subject: 'Advanced Algorithms',
    teacher: 'Prof. Ken Thompson',
    time: '1:00 PM - 2:30 PM',
    notes: 'Discussion on P vs NP problem.',
    grade: 'B+',
  },
  {
    id: '3',
    subject: 'Creative Writing',
    teacher: 'Ms. Olivia Chen',
    time: '3:00 PM - 4:00 PM',
    notes: 'Peer review session for short stories.',
  },
];

export const calendarEvents: CalendarEvent[] = [
    {
        id: '1',
        title: 'Math Mid-term Exam',
        date: new Date(new Date().setDate(new Date().getDate() + 2)),
        description: 'Covers chapters 1-5. Bring a calculator.',
        type: 'class',
    },
    {
        id: '2',
        title: 'Project Group Meeting',
        date: new Date(),
        description: 'Finalize the project presentation. Meet at the library.',
        type: 'personal',
    },
    {
        id: '3',
        title: 'Submit History Essay',
        date: new Date(new Date().setDate(new Date().getDate() + 5)),
        description: 'Essay on the impact of the printing press. 2000 words.',
        type: 'class',
    },
];

export const achievements: SummaryCardData[] = [
  { title: 'Trophies Won', value: 12, icon: Trophy, color: 'text-yellow-400' },
  { title: 'Homework Done', value: 128, icon: NotebookText, color: 'text-blue-400' },
  { title: 'Exams Passed', value: 34, icon: Medal, color: 'text-green-400' },
  { title: 'Top Grades', value: 15, icon: Star, color: 'text-purple-400' },
];

export const currentStudentCourses = [
    'Introduction to Python',
    'Calculus I',
    'World History: 1500-Present',
    'English Composition',
];
