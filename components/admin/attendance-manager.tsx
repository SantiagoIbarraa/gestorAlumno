"use client"

import { useState, useEffect } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, Loader2, Check, X } from "lucide-react"
import { toast } from "sonner"

interface Attendance {
    id_asistencia: number
    fecha: string
    presente: boolean
    justificacion: string
    alumno: { nombre: string }
    profesor: { nombre: string }
}

interface Student {
    id_alumno: number
    nombre: string
}

interface Professor {
    id_profesor: number
    nombre: string
}

export function AttendanceManager() {
    const [attendances, setAttendances] = useState<Attendance[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [professors, setProfessors] = useState<Professor[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        fecha: new Date().toISOString().split("T")[0],
        presente: false,
        justificacion: "",
        id_alumno: "",
        id_profesor: "",
    })

    const fetchData = async () => {
        setLoading(true)
        try {
            const [attendanceRes, studentsRes, professorsRes] = await Promise.all([
                fetch("/api/admin/attendance"),
                fetch("/api/admin/students"),
                fetch("/api/admin/professors"),
            ])

            if (!attendanceRes.ok || !studentsRes.ok || !professorsRes.ok) {
                console.error("Fetch failed:", {
                    attendance: { status: attendanceRes.status, text: attendanceRes.statusText },
                    students: { status: studentsRes.status, text: studentsRes.statusText },
                    professors: { status: professorsRes.status, text: professorsRes.statusText },
                })
                throw new Error("Failed to fetch data")
            }

            const [attendanceData, studentsData, professorsData] = await Promise.all([
                attendanceRes.json(),
                studentsRes.json(),
                professorsRes.json(),
            ])

            setAttendances(attendanceData || [])
            setStudents(studentsData || [])
            setProfessors(professorsData || [])
        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Error al cargar los datos")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const response = await fetch("/api/admin/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fecha: formData.fecha,
                    presente: formData.presente,
                    justificacion: formData.justificacion,
                    id_alumno: parseInt(formData.id_alumno),
                    id_profesor: parseInt(formData.id_profesor),
                }),
            })

            if (!response.ok) throw new Error("Failed to create")

            toast.success("Asistencia registrada correctamente")
            setIsOpen(false)
            setFormData({
                fecha: new Date().toISOString().split("T")[0],
                presente: false,
                justificacion: "",
                id_alumno: "",
                id_profesor: "",
            })
            fetchData()
        } catch (error) {
            console.error("Error adding attendance:", error)
            toast.error("Error al registrar asistencia")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar este registro?")) return

        try {
            const response = await fetch(`/api/admin/attendance?id=${id}`, {
                method: "DELETE",
            })

            if (!response.ok) throw new Error("Failed to delete")

            toast.success("Registro eliminado")
            setAttendances(attendances.filter((a) => a.id_asistencia !== id))
        } catch (error) {
            console.error("Error deleting attendance:", error)
            toast.error("Error al eliminar el registro")
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Registro de Asistencias</h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Asistencia
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Registrar Asistencia</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="alumno">Alumno</Label>
                                <Select
                                    value={formData.id_alumno}
                                    onValueChange={(value) => setFormData({ ...formData, id_alumno: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar alumno" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((student) => (
                                            <SelectItem key={student.id_alumno} value={student.id_alumno.toString()}>
                                                {student.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="profesor">Profesor</Label>
                                <Select
                                    value={formData.id_profesor}
                                    onValueChange={(value) => setFormData({ ...formData, id_profesor: value })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar profesor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {professors.map((prof) => (
                                            <SelectItem key={prof.id_profesor} value={prof.id_profesor.toString()}>
                                                {prof.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fecha">Fecha</Label>
                                <Input
                                    id="fecha"
                                    type="date"
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="presente"
                                    checked={formData.presente}
                                    onCheckedChange={(checked) =>
                                        setFormData({ ...formData, presente: checked as boolean })
                                    }
                                />
                                <Label htmlFor="presente">Presente</Label>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="justificacion">Justificación (Opcional)</Label>
                                <Input
                                    id="justificacion"
                                    value={formData.justificacion}
                                    onChange={(e) => setFormData({ ...formData, justificacion: e.target.value })}
                                    placeholder="Motivo de la falta..."
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? "Guardando..." : "Guardar"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Alumno</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Justificación</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendances.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    No hay asistencias registradas
                                </TableCell>
                            </TableRow>
                        ) : (
                            attendances.map((attendance) => (
                                <TableRow key={attendance.id_asistencia}>
                                    <TableCell>{new Date(attendance.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{attendance.alumno?.nombre}</TableCell>
                                    <TableCell>
                                        {attendance.presente ? (
                                            <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                                                <Check className="h-4 w-4" /> Presente
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                                                <X className="h-4 w-4" /> Ausente
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>{attendance.justificacion || "-"}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(attendance.id_asistencia)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
