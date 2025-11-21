import type { SummaryCardData, UpcomingClass, CalendarEvent } from './types';
import { NotebookText, FileCheck2, Clock, ListChecks, Trophy, Medal, Star } from 'lucide-react';

export const upcomingClasses: UpcomingClass[] = [
  {
    id: '1',
    subject: 'Física Cuántica',
    teacher: 'Dr. Evelyn Reed',
    time: '10:00 AM - 11:30 AM',
    notes: 'Repaso del capítulo 4. Prepara tus preguntas.',
    grade: 'A-',
  },
  {
    id: '2',
    subject: 'Algoritmos Avanzados',
    teacher: 'Prof. Ken Thompson',
    time: '1:00 PM - 2:30 PM',
    notes: 'Discusión sobre el problema P vs NP.',
    grade: 'B+',
  },
  {
    id: '3',
    subject: 'Escritura Creativa',
    teacher: 'Sra. Olivia Chen',
    time: '3:00 PM - 4:00 PM',
    notes: 'Sesión de revisión por pares para cuentos.',
  },
];

export const achievements: SummaryCardData[] = [
  { title: 'Trofeos Ganados', value: 12, icon: Trophy, color: 'text-yellow-400' },
  { title: 'Tareas Hechas', value: 128, icon: NotebookText, color: 'text-blue-400' },
  { title: 'Exámenes Aprobados', value: 34, icon: Medal, color: 'text-green-400' },
  { title: 'Notas Altas', value: 15, icon: Star, color: 'text-purple-400' },
];

export const currentStudentCourses = [
    'Introducción a Python',
    'Cálculo I',
    'Historia Mundial: 1500-Presente',
    'Composición en Español',
];
