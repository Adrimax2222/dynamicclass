import type { SummaryCardData, UpcomingClass, CalendarEvent, Schedule } from './types';
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

export const fullSchedule: Schedule = {
  Lunes: [
    { id: '101', subject: 'Matemáticas', time: '08:00 - 09:00', teacher: 'Sra. Davis', room: 'Aula 101', details: 'Tema: Álgebra Lineal' },
    { id: '102', subject: 'Historia', time: '09:00 - 10:00', teacher: 'Sr. Moore', room: 'Aula 102', details: 'Tema: La Revolución Francesa' },
    { id: '103', subject: 'Biología', time: '10:00 - 11:00', teacher: 'Dr. Carter', room: 'Laboratorio A', details: 'Práctica: Disección de una flor' },
    { id: '104', subject: 'Educación Física', time: '11:00 - 12:00', teacher: 'Entrenador Smith', room: 'Gimnasio', details: 'Pruebas de resistencia' },
  ],
  Martes: [
    { id: '2', subject: 'Algoritmos Avanzados', time: '1:00 PM - 2:30 PM', teacher: 'Prof. Ken Thompson', room: 'Aula de Informática 3', details: 'Discusión sobre el problema P vs NP.' },
    { id: '202', subject: 'Química', time: '09:00 - 10:00', teacher: 'Sra. Rodriguez', room: 'Laboratorio B', details: 'Experimento de titulación' },
    { id: '203', subject: 'Literatura', time: '10:00 - 11:00', teacher: 'Sr. Harris', room: 'Aula 201', details: 'Análisis de "Cien años de soledad"' },
  ],
  Miércoles: [
    { id: '301', subject: 'Matemáticas', time: '08:00 - 09:00', teacher: 'Sra. Davis', room: 'Aula 101', details: 'Repaso para el examen' },
    { id: '302', subject: 'Física', time: '09:00 - 10:00', teacher: 'Dr. Evelyn Reed', room: 'Laboratorio de Física', details: 'Leyes de Newton' },
    { id: '1', subject: 'Física Cuántica', time: '10:00 AM - 11:30 AM', teacher: 'Dr. Evelyn Reed', room: 'Auditorio', details: 'Repaso del capítulo 4. Prepara tus preguntas.' },
  ],
  Jueves: [
    { id: '401', subject: 'Química', time: '09:00 - 10:00', teacher: 'Sra. Rodriguez', room: 'Laboratorio B', details: 'Reacciones redox' },
    { id: '3', subject: 'Escritura Creativa', time: '3:00 PM - 4:00 PM', teacher: 'Sra. Olivia Chen', room: 'Biblioteca', notes: 'Sesión de revisión por pares para cuentos.' },
    { id: '403', subject: 'Geografía', time: '11:00 - 12:00', teacher: 'Sr. Allen', room: 'Aula 301', details: 'Climas del mundo' },
  ],
  Viernes: [
    { id: '501', subject: 'Matemáticas', time: '08:00 - 09:00', teacher: 'Sra. Davis', room: 'Aula 101', details: 'Examen de Álgebra' },
    { id: '502', subject: 'Historia', time: '09:00 - 10:00', teacher: 'Sr. Moore', room: 'Aula 102', details: 'Presentaciones de proyectos' },
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
