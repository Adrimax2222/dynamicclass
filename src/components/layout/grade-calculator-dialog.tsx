
"use client";

import { useState, useEffect, useMemo } from "react";
import { useApp } from "@/lib/hooks/use-app";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Flag,
  BookCopy,
  Pencil,
  Award,
  TrendingUp,
  TrendingDown,
  Info,
  LineChart,
  Target,
  Calculator,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fullSchedule } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User } from "@/lib/types";

interface Grade {
  id: number;
  title: string;
  grade: string;
  weight: string;
}

type ResultStatus = "success" | "warning" | "danger" | "info" | "error";

interface ResultState {
    status: ResultStatus;
    title: string;
    description: string;
    grade?: number;
}

interface SubjectConfig {
    grades: Grade[];
    desiredGrade: string;
    result: ResultState | null;
}

interface AllSubjectConfigs {
    [subjectName: string]: SubjectConfig;
}


interface GradeCalculatorDialogProps {
    children: React.ReactNode;
    isScheduleAvailable: boolean;
    user: User;
    openTo?: "calculator" | "report";
}

export function GradeCalculatorDialog({ children, isScheduleAvailable, user, openTo = "calculator" }: GradeCalculatorDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [allConfigs, setAllConfigs] = useState<AllSubjectConfigs>({});
    const [subjects, setSubjects] = useState<string[]>([]);
    const [activeSubject, setActiveSubject] = useState<string>('');
    const [newSubjectName, setNewSubjectName] = useState('');

    const storageKey = `gradeConfigs-${user.uid}`;

    // Load from localStorage on mount
    useEffect(() => {
      if (!isOpen) return;
        try {
            const savedConfigs = localStorage.getItem(storageKey);
            const parsedConfigs: AllSubjectConfigs = savedConfigs ? JSON.parse(savedConfigs) : {};
            
            let initialSubjects: string[];
            if (isScheduleAvailable) {
                const scheduleSubjects = Object.values(fullSchedule).flat().map(c => c.subject);
                const uniqueScheduleSubjects = [...new Set(scheduleSubjects)];
                initialSubjects = uniqueScheduleSubjects;
            } else {
                initialSubjects = [];
            }
            
            const savedSubjects = Object.keys(parsedConfigs);
            const allSubjects = [...new Set([...initialSubjects, ...savedSubjects])];

            setSubjects(allSubjects);

            if (allSubjects.length > 0) {
                const firstSubject = allSubjects[0];
                setActiveSubject(firstSubject);
                // Ensure a default config exists for all subjects if they are new
                const updatedConfigs = {...parsedConfigs};
                allSubjects.forEach(sub => {
                    if (!updatedConfigs[sub]) {
                        updatedConfigs[sub] = { grades: [{ id: Date.now(), title: "", grade: "", weight: "" }], desiredGrade: "5", result: null };
                    }
                });
                 setAllConfigs(updatedConfigs);
            } else {
                 setAllConfigs({});
            }

        } catch (error) {
            console.error("Failed to load or parse grade configurations from localStorage", error);
            setAllConfigs({});
            setSubjects([]);
        }
    }, [isScheduleAvailable, isOpen, storageKey]);

    // Save to localStorage whenever configs change
    useEffect(() => {
        if (!isOpen) return;
        try {
            if (Object.keys(allConfigs).length > 0) {
              localStorage.setItem(storageKey, JSON.stringify(allConfigs));
            }
        } catch (error) {
            console.error("Failed to save grade configurations to localStorage", error);
        }
    }, [allConfigs, isOpen, storageKey]);
    
    const activeConfig = useMemo(() => {
        return allConfigs[activeSubject] || { grades: [{ id: 1, title: "", grade: "", weight: "" }], desiredGrade: "5", result: null };
    }, [allConfigs, activeSubject]);

    const updateActiveConfig = (newConfig: Partial<SubjectConfig>) => {
        if (!activeSubject) return;
        setAllConfigs(prev => ({
            ...prev,
            [activeSubject]: { ...activeConfig, ...newConfig },
        }));
    };
    
    const handleSubjectChange = (subjectName: string) => {
        if (subjectName === "new-subject") {
            const defaultNewName = `Nueva Asignatura ${subjects.filter(s => s.startsWith("Nueva Asignatura")).length + 1}`;
            setSubjects(prev => [...prev, defaultNewName]);
            const newConfig = { grades: [{id: 1, title: "", grade: "", weight: ""}], desiredGrade: "5", result: null };
            setAllConfigs(prev => ({ ...prev, [defaultNewName]: newConfig }));
            setActiveSubject(defaultNewName);
        } else {
            setActiveSubject(subjectName);
            if (!allConfigs[subjectName]) {
                const newConfig = { grades: [{id: 1, title: "", grade: "", weight: ""}], desiredGrade: "5", result: null };
                setAllConfigs(prev => ({ ...prev, [subjectName]: newConfig }));
            }
        }
    };
    
    const handleRenameSubject = () => {
        if (!newSubjectName || newSubjectName === activeSubject || subjects.includes(newSubjectName)) return;
        
        const oldConfigs = {...allConfigs};
        const subjectData = oldConfigs[activeSubject];
        delete oldConfigs[activeSubject];
        
        const newConfigs = { ...oldConfigs, [newSubjectName]: subjectData };
        setAllConfigs(newConfigs);

        const newSubjects = subjects.map(s => s === activeSubject ? newSubjectName : s);
        setSubjects(newSubjects);
        setActiveSubject(newSubjectName);
    };

    const addGrade = () => {
        const newGrades = [...activeConfig.grades, { id: Date.now(), title: "", grade: "", weight: "" }];
        updateActiveConfig({ grades: newGrades, result: null });
    };

    const removeGrade = (id: number) => {
        const newGrades = activeConfig.grades.filter(g => g.id !== id);
        updateActiveConfig({ grades: newGrades, result: null });
    };

    const handleGradeChange = (id: number, field: keyof Grade, value: string) => {
        const newGrades = activeConfig.grades.map(g => g.id === id ? { ...g, [field]: value } : g);
        updateActiveConfig({ grades: newGrades, result: null });
    };

    const calculateGrade = () => {
        let newResult: ResultState | null = null;
        const desired = parseFloat(activeConfig.desiredGrade.replace(',', '.'));

        if (isNaN(desired) || desired < 0 || desired > 10) {
            newResult = { status: 'error', title: "Error de Formato", description: "La nota final deseada debe ser un número entre 0 y 10." };
            updateActiveConfig({ result: newResult });
            return;
        }

        let totalWeight = 0;
        let weightedSum = 0;
        const unknownGrades = [];
        
        for (const g of activeConfig.grades) {
            const weight = parseFloat(g.weight.replace(',', '.'));
             if (isNaN(weight) || g.weight.trim() === '') {
                newResult = { status: 'error', title: "Error en Porcentaje", description: `Hay un porcentaje vacío o no válido. Todos los campos de porcentaje deben estar rellenos.` };
                updateActiveConfig({ result: newResult });
                return;
            }
            totalWeight += weight;

            if (g.grade.trim() === '') {
                unknownGrades.push(g);
            } else {
                const grade = parseFloat(g.grade.replace(',', '.'));
                if (isNaN(grade) || grade < 0 || grade > 10) {
                     newResult = { status: 'error', title: "Error en Nota", description: `La nota '${g.grade}' no es válida. Deben ser números entre 0 y 10.` };
                     updateActiveConfig({ result: newResult });
                     return;
                }
                weightedSum += (grade * weight);
            }
        }
        
        if (Math.abs(totalWeight - 100) > 0.01) {
            newResult = { status: 'error', title: "Error en la Suma", description: `La suma de los porcentajes debe ser 100%, pero es ${totalWeight.toFixed(2)}%.` };
            updateActiveConfig({ result: newResult });
            return;
        }

        if (unknownGrades.length === 1) {
            const unknownWeight = parseFloat(unknownGrades[0].weight.replace(',', '.'));
            const neededGrade = (desired * 100 - weightedSum) / unknownWeight;

            let status: ResultStatus;
            let title: string;
            let description: string;
            
            if (neededGrade > 10) {
                status = 'danger';
                title = '¡Objetivo Difícil!';
                description = `Un ${neededGrade.toFixed(2)} es un reto. ¡A por todas!`;
            } else if (neededGrade >= 7) {
                status = 'success';
                title = '¡Lo Tienes!';
                description = `Necesitas un ${neededGrade.toFixed(2)}. ¡Sigue así!`;
            } else if (neededGrade >= 5) {
                status = 'warning';
                title = '¡Casi Hecho!';
                description = `Con un ${neededGrade.toFixed(2)} es suficiente. ¡Puedes hacerlo!`;
            } else if (neededGrade >= 0) {
                 status = 'success';
                 title = '¡Fácil!';
                 description = `Solo necesitas un ${neededGrade.toFixed(2)}. ¡Pan comido!`;
            } else {
                 status = 'success';
                 title = '¡Ya Aprobaste!';
                 description = '¡Felicidades! Ya tienes tu objetivo, incluso con un 0.';
            }
            newResult = { status, title, description, grade: neededGrade };
        } 
        else if (unknownGrades.length === 0) {
            const currentAverage = weightedSum / 100;
            let status: ResultStatus;
            let title = 'Tu Media Actual';
            let description = `Tu media ponderada actual es un ${currentAverage.toFixed(2)}.`;

            if (currentAverage >= 7) status = 'success';
            else if (currentAverage >= 5) status = 'warning';
            else status = 'danger';

            newResult = { 
                status,
                title, 
                description,
                grade: currentAverage
            };
        }
        else {
             newResult = { 
                status: 'error', 
                title: 'Error de Cálculo', 
                description: "Deja solo un campo de nota en blanco para calcular, o rellena todos para ver tu media." 
            };
        }
        updateActiveConfig({ result: newResult });
    };
    
    const latestGrade = activeConfig.result?.grade;
    const latestStatus = activeConfig.result?.status;

    const getBadgeColor = (grade: number | undefined) => {
        if (grade === undefined) return "hidden";
        if (grade < 5) return "bg-red-500/80";
        if (grade < 7) return "bg-orange-500/80 text-white";
        return "bg-green-500/80";
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md w-[95vw] p-0 flex flex-col h-[90vh]">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Herramientas de Notas</DialogTitle>
                    <DialogDescription>
                        Calcula tus notas y revisa tu progreso académico.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue={openTo} className="flex flex-col flex-1 min-h-0">
                    <div className="px-6">
                        <TabsList className="grid w-full grid-cols-2 mt-4">
                            <TabsTrigger value="calculator">
                                <Calculator className="h-4 w-4 mr-2" />
                                Calculadora
                            </TabsTrigger>
                            <TabsTrigger value="report">
                                <LineChart className="h-4 w-4 mr-2" />
                                Informe
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto">
                        <TabsContent value="calculator" className="h-full mt-0">
                            <ScrollArea className="h-full">
                              <div className="px-6 space-y-6 py-4">
                                  <div className="space-y-2">
                                      <Label>Asignatura</Label>
                                      <div className="flex items-center gap-2">
                                          <Select onValueChange={handleSubjectChange} value={activeSubject}>
                                              <SelectTrigger>
                                                  <div className="flex items-center gap-2">
                                                      <BookCopy className="h-4 w-4" />
                                                      <SelectValue placeholder="Selecciona una asignatura..." />
                                                  </div>
                                              </SelectTrigger>
                                              <SelectContent>
                                                  {subjects.map(subject => (
                                                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                                  ))}
                                                  <Separator className="my-1" />
                                                  <SelectItem value="new-subject">
                                                      <span className="flex items-center gap-2 text-primary">
                                                          <Plus className="h-4 w-4"/>Crear nueva
                                                      </span>
                                                  </SelectItem>
                                              </SelectContent>
                                          </Select>
                                           {latestGrade !== undefined && latestStatus && latestStatus !== 'error' && (
                                                <Badge className={cn("text-base font-bold text-white", getBadgeColor(latestGrade))}>
                                                    {latestGrade < 0 ? "0.0" : latestGrade.toFixed(1)}
                                                </Badge>
                                            )}
                                          <Dialog>
                                              <DialogTrigger asChild>
                                                  <Button variant="ghost" size="icon" disabled={!activeSubject}><Pencil className="h-4 w-4" /></Button>
                                              </DialogTrigger>
                                              <DialogContent>
                                                  <DialogHeader>
                                                      <DialogTitle>Renombrar Asignatura</DialogTitle>
                                                  </DialogHeader>
                                                  <Input 
                                                      defaultValue={activeSubject}
                                                      onChange={(e) => setNewSubjectName(e.target.value)}
                                                      onKeyDown={(e) => e.key === 'Enter' && handleRenameSubject()}
                                                  />
                                                  <DialogFooter>
                                                      <DialogClose asChild>
                                                          <Button variant="outline">Cancelar</Button>
                                                      </DialogClose>
                                                      <DialogClose asChild>
                                                          <Button onClick={handleRenameSubject}>Guardar</Button>
                                                      </DialogClose>
                                                  </DialogFooter>
                                              </DialogContent>
                                          </Dialog>
                                      </div>
                                  </div>
                              
                                  <div className="space-y-4">
                                      {activeConfig.grades.map((g, index) => (
                                          <div key={g.id} className="p-3 border rounded-lg space-y-2">
                                              <div className="flex items-center gap-2">
                                                  <Input
                                                      id={`title-${g.id}`}
                                                      type="text"
                                                      placeholder={`Examen / Tarea ${index + 1}`}
                                                      value={g.title}
                                                      onChange={e => handleGradeChange(g.id, 'title', e.target.value)}
                                                      className="text-sm font-semibold border-0 bg-transparent px-1 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                                                  />
                                                  <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      onClick={() => removeGrade(g.id)}
                                                      disabled={activeConfig.grades.length === 1}
                                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                  >
                                                      <Trash2 className="h-4 w-4" />
                                                  </Button>
                                              </div>

                                              <div className="flex items-center gap-2">
                                                  <div className="flex-1 space-y-1">
                                                      <Label htmlFor={`grade-${g.id}`} className="text-xs">Nota</Label>
                                                      <Input
                                                          id={`grade-${g.id}`}
                                                          type="text"
                                                          placeholder="0-10"
                                                          value={g.grade}
                                                          onChange={e => handleGradeChange(g.id, 'grade', e.target.value)}
                                                      />
                                                  </div>
                                                  <div className="w-24 space-y-1">
                                                      <Label htmlFor={`weight-${g.id}`} className="text-xs">Peso %</Label>
                                                      <Input
                                                          id={`weight-${g.id}`}
                                                          type="text"
                                                          placeholder="%"
                                                          value={g.weight}
                                                          onChange={e => handleGradeChange(g.id, 'weight', e.target.value)}
                                                      />
                                                  </div>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                                  
                                  <Button variant="outline" onClick={addGrade} className="w-full border-dashed" disabled={!activeSubject}>
                                      <Plus className="mr-2 h-4 w-4" />
                                      Añadir evaluación
                                  </Button>

                                    <div className="space-y-2">
                                      <Label htmlFor="desired-grade">Nota Final Deseada</Label>
                                      <div className="relative">
                                          <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                          <Input
                                              id="desired-grade"
                                              type="text"
                                              value={activeConfig.desiredGrade}
                                              onChange={e => updateActiveConfig({ ...activeConfig, desiredGrade: e.target.value, result: null })}
                                              className="pl-10 font-bold text-base bg-muted"
                                              disabled={!activeSubject}
                                          />
                                      </div>
                                    </div>

                                    {activeConfig.result && <ResultPanel result={activeConfig.result} />}
                              </div>
                            </ScrollArea>
                        </TabsContent>
                        
                        <TabsContent value="report" className="h-full mt-0">
                           <ScrollArea className="h-full">
                              <ReportTab allConfigs={allConfigs} user={user} />
                           </ScrollArea>
                        </TabsContent>
                    </div>

                </Tabs>
                <DialogFooter className="p-6 pt-4 border-t">
                    <DialogClose asChild>
                        <Button variant="outline">Cerrar</Button>
                    </DialogClose>
                    <Button onClick={calculateGrade} disabled={!activeSubject}>Calcular</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ResultPanel({ result }: { result: ResultState }) {
    const statusConfig = {
        success: { icon: Award, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
        warning: { icon: TrendingUp, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
        danger: { icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
        info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
        error: { icon: Info, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
    };
    
    const config = statusConfig[result.status];
    const Icon = config.icon;
    
    return (
        <div className={cn("p-4 rounded-lg border flex items-start gap-4", config.bg, config.border)}>
             <div className="flex-1">
                <h3 className="font-bold flex items-center gap-2"><Icon className={cn("h-5 w-5", config.color)} />{result.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
             </div>
             {result.grade !== undefined && (
                <p className={cn("text-4xl font-bold font-mono tracking-tighter", config.color)}>
                    {result.grade < 0 ? '0.0' : result.grade.toFixed(1)}
                </p>
            )}
        </div>
    );
}

function ReportTab({ allConfigs, user }: { allConfigs: AllSubjectConfigs, user: any }) {
    const calculatedSubjects = useMemo(() => {
        return Object.entries(allConfigs)
            .map(([subject, config]) => {
                const filledGrades = config.grades.filter(g => g.grade.trim() !== '' && g.weight.trim() !== '');
                if (filledGrades.length > 0) {
                    const weightedSum = filledGrades.reduce((acc, g) => {
                        const grade = parseFloat(g.grade.replace(',', '.'));
                        const weight = parseFloat(g.weight.replace(',', '.'));
                        return acc + (grade * weight);
                    }, 0);
                    const totalWeight = filledGrades.reduce((acc, g) => acc + parseFloat(g.weight.replace(',', '.')), 0);
                    if (totalWeight > 0) {
                        const average = weightedSum / totalWeight;
                         return {
                            subject,
                            grade: average,
                        };
                    }
                } else if (config.result?.status !== 'error' && config.result?.grade !== undefined) {
                     return {
                        subject,
                        grade: config.result.grade,
                    };
                }
                return null;
            })
            .filter((item): item is { subject: string; grade: number } => item !== null);
    }, [allConfigs]);

    const overallAverage = useMemo(() => {
        if (calculatedSubjects.length === 0) return 0;
        const total = calculatedSubjects.reduce((acc, curr) => acc + Math.max(0, curr.grade), 0);
        return total / calculatedSubjects.length;
    }, [calculatedSubjects]);

    const getOverallStatus = (average: number): ResultStatus => {
        if (average >= 7) return 'success';
        if (average >= 5) return 'warning';
        return 'danger';
    };

    const getOverallFeedback = (average: number): { title: string; description: string } => {
        if (average >= 9) return { title: '¡Rendimiento Excepcional!', description: 'Estás demostrando un dominio impresionante de las materias.' };
        if (average >= 7) return { title: '¡Gran Trabajo!', description: 'Tu esfuerzo se refleja en tus notas. ¡Sigue así!' };
        if (average >= 5) return { title: 'Vas por Buen Camino', description: 'Estás aprobando. Con un poco más de empuje, puedes subir esa media.' };
        return { title: 'Ánimo, ¡Puedes Mejorar!', description: 'Algunas asignaturas necesitan más atención. Identifica tus puntos débiles y a por ellos.' };
    };

    const overallStatus = getOverallStatus(overallAverage);
    const overallFeedback = getOverallFeedback(overallAverage);
    const statusConfig = {
        success: { icon: Award, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
        warning: { icon: TrendingUp, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
        danger: { icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
    };
    const OverallIcon = statusConfig[overallStatus].icon;

    return (
        <div className="px-6 space-y-6 py-4">
            <div className="text-center">
                <h3 className="text-lg font-semibold">Informe de Notas de {user.name.split(' ')[0]}</h3>
                <p className="text-sm text-muted-foreground">Un resumen de tu progreso académico.</p>
            </div>

            <div className={cn("p-4 rounded-lg border", statusConfig[overallStatus].bg, statusConfig[overallStatus].border)}>
                <div className="flex flex-col items-center text-center gap-2">
                    <OverallIcon className={cn("h-8 w-8", statusConfig[overallStatus].color)} />
                    <div>
                        <p className="text-sm font-bold text-muted-foreground">MEDIA GLOBAL</p>
                        <p className={cn("text-5xl font-bold font-mono tracking-tighter", statusConfig[overallStatus].color)}>
                            {overallAverage.toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold">{overallFeedback.title}</h4>
                        <p className="text-xs text-muted-foreground">{overallFeedback.description}</p>
                    </div>
                </div>
            </div>

            <div>
                <h4 className="mb-2 font-semibold text-sm text-muted-foreground">DESGLOSE POR ASIGNATURAS</h4>
                {calculatedSubjects.length > 0 ? (
                    <div className="space-y-2">
                        {calculatedSubjects.map(({ subject, grade }) => {
                            const subjectStatus = getOverallStatus(grade);
                            const SubjectIcon = statusConfig[subjectStatus].icon;
                            return (
                                <div key={subject} className={cn("flex items-center p-3 rounded-md border", statusConfig[subjectStatus].bg, statusConfig[subjectStatus].border)}>
                                    <SubjectIcon className={cn("h-5 w-5 mr-3", statusConfig[subjectStatus].color)} />
                                    <p className="flex-1 font-semibold text-sm">{subject}</p>
                                    <p className={cn("font-bold text-lg font-mono", statusConfig[subjectStatus].color)}>{Math.max(0, grade).toFixed(1)}</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>Aún no has calculado ninguna nota final.</p>
                        <p>Usa la calculadora para empezar.</p>
                    </div>
                )}
            </div>
        </div>
    );
}


    