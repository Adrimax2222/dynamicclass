
import type { SummaryCardData, UpcomingClass, CalendarEvent, Schedule } from './types';
import { NotebookText, FileCheck2, Clock, ListChecks, Trophy, Medal, Star } from 'lucide-react';

export const upcomingClasses: UpcomingClass[] = [
  {
    id: 'L1',
    subject: 'Educación Física',
    teacher: 'Laura Reinado',
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
    teacher: 'Yolanda Redondo',
    time: '10:10 - 11:10',
    notes: 'No hay contenido disponible.',
  },
];

export const fullSchedule: Schedule = {
  Lunes: [
    { id: 'L1', subject: 'Educación Física', time: '08:15 - 09:10', teacher: 'Laura Reinado', room: 'Pista', details: 'No hay contenido disponible.' },
    { id: 'L2', subject: 'Optativa', time: '09:15 - 10:10', teacher: 'Varía según el itinerario', room: 'Varía según el itinerario', details: 'La asignatura y el aula dependen de la elección del alumno.' },
    { id: 'L3', subject: 'Mates', time: '10:10 - 11:10', teacher: 'Yolanda Redondo', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
    { id: 'L4', subject: 'Ciencias Sociales', time: '11:45 - 12:40', teacher: 'Lucía Nervon', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
    { id: 'L5', subject: 'Proyecto', time: '12:45 - 13:40', teacher: 'Varía según el itinerario', room: 'Varía según el itinerario', details: 'El proyecto y el aula dependen de la elección del alumno.' },
    { id: 'L6', subject: 'Inglés Split Class', time: '13:45 - 14:40', teacher: 'Sergio Giménez, Cosmina', room: 'Aula 2.11 / TEC2', details: 'No hay contenido disponible.' },
  ],
  Martes: [
    { id: 'M1', subject: 'Proyecto', time: '08:15 - 09:10', teacher: 'Varía según el itinerario', room: 'Varía según el itinerario', details: 'El proyecto y el aula dependen de la elección del alumno.' },
    { id: 'M2', subject: 'Lengua Castellana', time: '09:15 - 10:10', teacher: 'Inma Ruíz', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
    { id: 'M3', subject: 'Itinerario', time: '10:10 - 11:10', teacher: 'Varía según el itinerario', room: 'Varía según el itinerario', details: 'La asignatura y el aula dependen de la elección del alumno.' },
    { id: 'M4', subject: 'Llengua Catalana', time: '11:45 - 12:40', teacher: 'Judith Forés', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
    { id: 'M5', subject: 'Itinerario', time: '12:45 - 13:40', teacher: 'Varía según el itinerario', room: 'Varía según el itinerario', details: 'La asignatura y el aula dependen de la elección del alumno.' },
    { id: 'M6', subject: 'Mates', time: '13:45 - 14:40', teacher: 'Yolanda Redondo', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
  ],
  Miércoles: [
    { id: 'W1', subject: 'Llengua Catalana', time: '08:15 - 09:10', teacher: 'Judith Forés', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
    { id: 'W2', subject: 'Optativa', time: '09:15 - 10:10', teacher: 'Varía según el itinerario', room: 'Varía según el itinerario', details: 'La asignatura y el aula dependen de la elección del alumno.' },
    { id: 'W3', subject: 'Inglés', time: '10:10 - 11:10', teacher: 'Sergio Giménez', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
    { id: 'W4', subject: 'Proyecto Sociales', time: '11:45 - 12:40', teacher: 'Lucía Nervon', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
    { id: 'W5', subject: 'Tutoría', time: '12:45 - 13:40', teacher: 'Sergio Giménez y Denia', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
    { id: 'W6', subject: 'Educación Física', time: '13:45 - 14:40', teacher: 'Laura Reinado', room: 'Gimnasio', details: 'No hay contenido disponible.' },
  ],
  Jueves: [
    { id: 'J1', subject: 'Mates', time: '08:15 - 09:10', teacher: 'Yolanda Redondo', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
    { id: 'J2', subject: 'Ciencias Sociales', time: '09:15 - 10:10', teacher: 'Lucía Nervon', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
    { id: 'J3', subject: 'Itinerario', time: '10:10 - 11:10', teacher: 'Varía según el itinerario', room: 'Varía según el itinerario', details: 'La asignatura y el aula dependen de la elección del alumno.' },
    { id: 'J4', subject: 'Activitats Cíviques', time: '11:45 - 12:40', teacher: 'Aïda Vinyals', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
    { id: 'J5', subject: 'Itinerario', time: '12:45 - 13:40', teacher: 'Varía según el itinerario', room: 'Varía según el itinerario', details: 'La asignatura y el aula dependen de la elección del alumno.' },
    { id: 'J6', subject: 'Lengua Castellana', time: '13:45 - 14:40', teacher: 'Inma Ruíz', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
  ],
  Viernes: [
    { id: 'F1', subject: 'Mates', time: '08:15 - 09:10', teacher: 'Yolanda Redondo', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
    { id: 'F2', subject: 'Inglés', time: '09:15 - 10:10', teacher: 'Sergio Giménez', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
    { id: 'F3', subject: 'Lengua Castellana', time: '10:10 - 11:10', teacher: 'Inma Ruíz', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
    { id: 'F4', subject: 'Proyecto', time: '11:45 - 12:40', teacher: 'Varía según el itinerario', room: 'Varía según el itinerario', details: 'El proyecto y el aula dependen de la elección del alumno.' },
    { id: 'F5', subject: 'Llengua Catalana', time: '12:45 - 13:40', teacher: 'Judith Forés', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
    { id: 'F6', subject: 'EVEC', time: '13:45 - 14:40', teacher: 'Lucía Nervon', room: 'Aula 2.11', details: 'No hay contenido disponible.' },
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
