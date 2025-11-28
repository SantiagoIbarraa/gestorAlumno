"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export function PreceptorView() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [courses, setCourses] = useState<any[]>([])
    const [selectedCourse, setSelectedCourse] = useState<string>("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchCourses = async () => {
            const supabase = createClient()
            const { data } = await supabase.from("cursos").select("*")
            if (data) setCourses(data)
        }
        fetchCourses()
    }, [])

    const handleSave = async () => {
        setLoading(true)
        // Implement save logic here
        console.log("Saving attendance for", selectedCourse, date)
        setTimeout(() => setLoading(false), 1000) // Mock delay
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Gestión de Asistencia</h2>
                <p className="text-gray-500">Registra y gestiona la asistencia de todos los cursos</p>
            </div>

            <Tabs defaultValue="registrar" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="registrar">Registrar Asistencia</TabsTrigger>
                    <TabsTrigger value="historial">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="registrar" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registrar Asistencia</CardTitle>
                            <CardDescription>Selecciona el curso y la fecha para tomar asistencia</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Curso
                                    </label>
                                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona un curso" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((course) => (
                                                <SelectItem key={course.id} value={course.id}>
                                                    {course.anio}º {course.division}º - {course.especialidad}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Fecha
                                    </label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={handleSave}
                                disabled={loading || !selectedCourse || !date}
                            >
                                {loading ? "Guardando..." : "Guardar Asistencias"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="historial">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Asistencias</CardTitle>
                            <CardDescription>Visualiza los registros de asistencia pasados</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">Funcionalidad de historial próximamente...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
