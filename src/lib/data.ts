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
    { id: 'L1', subject: 'Matemáticas', time: '08:15 - 09:10', teacher: 'Sra. Davis', room: 'Aula 101', details: 'Álgebra Lineal' },
    { id: 'L2', subject: 'Historia', time: '09:15 - 10:10', teacher: 'Sr. Moore', room: 'Aula 102', details: 'La Revolución Francesa' },
    { id: 'L3', subject: 'Biología', time: '10:10 - 11:10', teacher: 'Dr. Carter', room: 'Laboratorio A', details: 'Disección de una flor' },
    { id: 'L4', subject: 'Química', time: '11:45 - 12:40', teacher: 'Sra. Rodriguez', room: 'Laboratorio B', details: 'Experimento de titulación' },
    { id: 'L5', subject: 'Literatura', time: '12:45 - 13:40', teacher: 'Sr. Harris', room: 'Aula 201', details: 'Análisis de "Cien años de soledad"' },
    { id: 'L6', subject: 'Música', time: '13:45 - 14:40', teacher: 'Sra. Allegro', room: 'Sala de Música', details: 'Práctica de solfeo' },
  ],
  Martes: [
    { id: 'M1', subject: 'Física', time: '08:15 - 09:10', teacher: 'Dr. Evelyn Reed', room: 'Laboratorio de Física', details: 'Leyes de Newton' },
    { id: 'M2', subject: 'Lengua Castellana', time: '09:15 - 10:10', teacher: 'Sr. Harris', room: 'Aula 201', details: 'Sintaxis: Oraciones compuestas' },
    { id: 'M3', subject: 'Educación Física', time: '10:10 - 11:10', teacher: 'Entrenador Smith', room: 'Gimnasio', details: 'Pruebas de resistencia' },
    { id: '2', subject: 'Algoritmos Avanzados', time: '11:45 - 12:40', teacher: 'Prof. Ken Thompson', room: 'Aula de Informática 3', details: 'Discusión sobre P vs NP.' },
    { id: 'M5', subject: 'Geografía', time: '12:45 - 13:40', teacher: 'Sr. Allen', room: 'Aula 301', details: 'Climas del mundo' },
    { id: 'M6', subject: 'Inglés', time: '13:45 - 14:40', teacher: 'Mrs. Turner', room: 'Aula 103', details: 'Conversation practice' },
  ],
  Miércoles: [
    { id: 'W1', subject: 'Matemáticas', time: '08:15 - 09:10', teacher: 'Sra. Davis', room: 'Aula 101', details: 'Repaso para el examen' },
    { id: 'W2', subject: 'Biología', time: '09:15 - 10:10', teacher: 'Dr. Carter', room: 'Laboratorio A', details: 'Genética Mendeliana' },
    { id: '1', subject: 'Física Cuántica', time: '10:10 - 11:10', teacher: 'Dr. Evelyn Reed', room: 'Auditorio', details: 'Repaso del capítulo 4.' },
    { id: 'W4', subject: 'Tecnología', time: '11:45 - 12:40', teacher: 'Sr. Chip', room: 'Taller de Tecno', details: 'Introducción a la robótica' },
    { id: 'W5', subject: 'Historia del Arte', time: '12:45 - 13:40', teacher: 'Sra. Monet', room: 'Aula de Arte', details: 'El Renacimiento' },
    { id: 'W6', subject: 'Latín', time: '13:45 - 14:40', teacher: 'Sr. Cicerón', room: 'Aula 202', details: 'Tercera declinación' },
  ],
  Jueves: [
    { id: 'J1', subject: 'Química', time: '08:15 - 09:10', teacher: 'Sra. Rodriguez', room: 'Laboratorio B', details: 'Reacciones redox' },
    { id: 'J2', subject: 'Filosofía', time: '09:15 - 10:10', teacher: 'Sr. Platón', room: 'Aula 303', details: 'El mito de la caverna' },
    { id: 'J3', subject: 'Educación Física', time: '10:10 - 11:10', teacher: 'Entrenador Smith', room: 'Pista de Atletismo', details: 'Pruebas de velocidad' },
    { id: 'J4', subject: 'Lengua Catalana', time: '11:45 - 12:40', teacher: 'Sra. Font', room: 'Aula 203', details: 'Verbos irregulares' },
    { id: '3', subject: 'Escritura Creativa', time: '12:45 - 13:40', teacher: 'Sra. Olivia Chen', room: 'Biblioteca', notes: 'Revisión por pares.' },
    { id: 'J6', subject: 'Matemáticas', time: '13:45 - 14:40', teacher: 'Sra. Davis', room: 'Aula 101', details: 'Trigonometría' },
  ],
  Viernes: [
    { id: 'F1', subject: 'Matemáticas', time: '08:15 - 09:10', teacher: 'Sra. Davis', room: 'Aula 101', details: 'Examen de Álgebra' },
    { id: 'F2', subject: 'Historia', time: '09:15 - 10:10', teacher: 'Sr. Moore', room: 'Aula 102', details: 'Presentaciones de proyectos' },
    { id: 'F3', subject: 'Inglés', time: '10:10 - 11:10', teacher: 'Mrs. Turner', room: 'Aula 103', details: 'Movie Friday' },
    { id: 'F4', subject: 'Tecnología', time: '11:45 - 12:40', teacher: 'Sr. Chip', room: 'Taller de Tecno', details: 'Montaje de robots' },
    { id: 'F5', subject: 'Música', time: '12:45 - 13:40', teacher: 'Sra. Allegro', room: 'Sala de Música', details: 'Ensayo general' },
    { id: 'F6', subject: 'Tutoría', time: '13:45 - 14:40', teacher: 'Sra. Davis', room: 'Aula 101', details: 'Revisión semanal' },
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
