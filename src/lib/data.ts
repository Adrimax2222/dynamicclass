import type { SummaryCardData, UpcomingClass, CalendarEvent } from './types';
import { NotebookText, FileCheck2, Clock, ListChecks, Trophy, Medal, Star } from 'lucide-react';

export const summaryCards: SummaryCardData[] = [
  { title: 'Tareas', value: 3, icon: NotebookText, color: 'text-blue-500' },
  { title: 'Exámenes', value: 1, icon: FileCheck2, color: 'text-red-500' },
  { title: 'Pendientes', value: 5, icon: Clock, color: 'text-yellow-500' },
  { title: 'Actividades', value: 8, icon: ListChecks, color: 'text-green-500' },
];

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

export const calendarEvents: CalendarEvent[] = [
    {
        id: '1',
        title: 'Examen Parcial de Matemáticas',
        date: new Date(new Date().setDate(new Date().getDate() + 2)),
        description: 'Cubre los capítulos 1-5. Traer calculadora.',
        type: 'class',
    },
    {
        id: '2',
        title: 'Reunión de Grupo de Proyecto',
        date: new Date(),
        description: 'Finalizar la presentación del proyecto. Reunión en la biblioteca.',
        type: 'personal',
    },
    {
        id: '3',
        title: 'Entregar Ensayo de Historia',
        date: new Date(new Date().setDate(new Date().getDate() + 5)),
        description: 'Ensayo sobre el impacto de la imprenta. 2000 palabras.',
        type: 'class',
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
