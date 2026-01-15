
import type { SummaryCardData, UpcomingClass, CalendarEvent, Schedule } from './types';
import { NotebookText, FileCheck2, Clock, ListChecks, Trophy, Medal, Star } from 'lucide-react';

export const upcomingClasses: UpcomingClass[] = [
  {
    id: 'L1',
    subject: 'Educación Física',
    teacher: 'LREIN',
    time: '08:15 - 09:10',
    notes: 'No hay contenido disponible.',
  },
  {
    id: 'L2',
    subject: 'Optativa',
    teacher: 'Varía según el itinerario',
    time: '09:15 - 10:10',
    notes: 'La asignatura y el aula dependen de la elección del alumno.',
  },
  {
    id: 'L3',
    subject: 'Mates',
    teacher: 'YREDO',
    time: '10:10 - 11:10',
    notes: 'No hay contenido disponible.',
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
