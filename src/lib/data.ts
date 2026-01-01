
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

export const fullSchedule: Schedule = {
  Lunes: [
    { id: 'L1', subject: 'E.F.', time: '08:10 - 09:10', teacher: 'LREIN', room: 'Pista', details: '' },
    { id: 'L2', subject: 'Optativa', time: '09:10 - 10:10', teacher: 'Varía', room: 'Varía', details: 'La asignatura y el aula dependen de la elección del alumno.' },
    { id: 'L3', subject: 'Mates', time: '10:10 - 11:10', teacher: 'YREDO', room: '2.11', details: '' },
    { id: 'L4', subject: 'Sociales', time: '11:40 - 12:40', teacher: 'LNERV', room: '2.11', details: '' },
    { id: 'L5', subject: 'Proyecto', time: '12:40 - 13:40', teacher: 'Varía', room: 'Itinerario', details: 'El proyecto y el aula dependen de la elección del alumno.' },
    { id: 'L6', subject: 'English (Desdo.)', time: '13:40 - 14:40', teacher: 'SGIME/CSTAN', room: '2.11 / TEC2', details: 'Desdoblamiento' },
  ],
  Martes: [
    { id: 'M1', subject: 'Proyecto', time: '08:10 - 09:10', teacher: 'Varía', room: 'Itinerario', details: 'El proyecto y el aula dependen de la elección del alumno.' },
    { id: 'M2', subject: 'Castellano', time: '09:10 - 10:10', teacher: 'IRUIZ', room: '2.11', details: '' },
    { id: 'M3', subject: 'Itinerari', time: '10:10 - 11:10', teacher: 'Varía', room: 'Itinerario', details: 'La asignatura y el aula dependen de la elección del alumno.' },
    { id: 'M4', subject: 'Catalán', time: '11:40 - 12:40', teacher: 'JFORE', room: '2.11', details: '' },
    { id: 'M5', subject: 'Itinerari', time: '12:40 - 13:40', teacher: 'Varía', room: 'Itinerario', details: 'La asignatura y el aula dependen de la elección del alumno.' },
    { id: 'M6', subject: 'Mates', time: '13:40 - 14:40', teacher: 'YREDO', room: '2.11', details: '' },
  ],
  Miércoles: [
    { id: 'W1', subject: 'Catalán', time: '08:10 - 09:10', teacher: 'JFORE', room: '2.11', details: '' },
    { id: 'W2', subject: 'Optativa', time: '09:10 - 10:10', teacher: 'Varía', room: 'Varía', details: 'La asignatura y el aula dependen de la elección del alumno.' },
    { id: 'W3', subject: 'English', time: '10:10 - 11:10', teacher: 'SGIME', room: '2.11', details: '' },
    { id: 'W4', subject: 'Proyecto 2.11', time: '11:40 - 12:40', teacher: 'LNERV', room: '2.11', details: '' },
    { id: 'W5', subject: 'Tutoría con Sergi', time: '12:40 - 13:40', teacher: 'SGIME/DSERR', room: '2.11', details: '' },
    { id: 'W6', subject: 'E.F.', time: '13:40 - 14:40', teacher: 'LREIN', room: 'Gimnasio', details: '' },
  ],
  Jueves: [
    { id: 'J1', subject: 'Mates', time: '08:10 - 09:10', teacher: 'YREDO', room: '2.11', details: '' },
    { id: 'J2', subject: 'Sociales', time: '09:10 - 10:10', teacher: 'LNERV', room: '2.11', details: '' },
    { id: 'J3', subject: 'Itinerari', time: '10:10 - 11:10', teacher: 'Varía', room: 'Itinerario', details: 'La asignatura y el aula dependen de la elección del alumno.' },
    { id: 'J4', subject: 'Activitats Cíviques', time: '11:40 - 12:40', teacher: 'AVINY', room: '2.11', details: '' },
    { id: 'J5', subject: 'Itinerari', time: '12:40 - 13:40', teacher: 'Varía', room: 'Itinerario', details: 'La asignatura y el aula dependen de la elección del alumno.' },
    { id: 'J6', subject: 'Castellano', time: '13:40 - 14:40', teacher: 'IRUIZ', room: '2.11', details: '' },
  ],
  Viernes: [
    { id: 'F1', subject: 'Mates', time: '08:10 - 09:10', teacher: 'YREDO', room: '2.11', details: '' },
    { id: 'F2', subject: 'English', time: '09:10 - 10:10', teacher: 'SGIME', room: '2.11', details: '' },
    { id: 'F3', subject: 'Castellano', time: '10:10 - 11:10', teacher: 'IRUIZ', room: '2.11', details: '' },
    { id: 'F4', subject: 'Proyecto', time: '11:45 - 12:40', teacher: 'Varía', room: 'Itinerario', details: 'El proyecto y el aula dependen de la elección del alumno.' },
    { id: 'F5', subject: 'Catalán', time: '12:45 - 13:40', teacher: 'JFORE', room: '2.11', details: '' },
    { id: 'F6', subject: 'EVEC - Lnerv', time: '13:45 - 14:40', teacher: 'LNERV', room: '2.11', details: 'Educació en Valors Ètics i Cívics' },
  ]
};

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
