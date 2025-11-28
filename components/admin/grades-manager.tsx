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
import { Trash2, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Grade {
    id_calificacion: number
    nota: string
    fecha: string
    tipo_evaluacion: string
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

export function GradesManager() {
    const [grades, setGrades] = useState<Grade[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const [professors, setProfessors] = useState<Professor[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        nota: "",
        fecha: new Date().toISOString().split("T")[0],
        tipo_evaluacion: "",
        id_alumno: "",
        id_profesor: "",
    })

    const fetchData = async () => {
        setLoading(true)
        try {
            const [gradesRes, studentsRes, professorsRes] = await Promise.all([
                fetch("/api/admin/grades"),
                fetch("/api/admin/students"),
                fetch("/api/admin/professors"),
            ])

            if (!gradesRes.ok || !studentsRes.ok || !professorsRes.ok) {
                throw new Error("Failed to fetch data")
            }

            const [gradesData, studentsData, professorsData] = await Promise.all([
                gradesRes.json(),
                studentsRes.json(),
                professorsRes.json(),
            ])

            setGrades(gradesData || [])
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
            const response = await fetch("/api/admin/grades", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nota: formData.nota,
                    fecha: formData.fecha,
                    tipo_evaluacion: formData.tipo_evaluacion,
                    id_alumno: parseInt(formData.id_alumno),
                    id_profesor: parseInt(formData.id_profesor),
                }),
            })

            if (!response.ok) throw new Error("Failed to create")

            toast.success("Calificación agregada correctamente")
            setIsOpen(false)
            setFormData({
                nota: "",
                fecha: new Date().toISOString().split("T")[0],
                tipo_evaluacion: "",
                id_alumno: "",
                id_profesor: "",
            })
            fetchData()
        } catch (error) {
            console.error("Error adding grade:", error)
            toast.error("Error al agregar la calificación")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de eliminar esta calificación?")) return

        try {
            const response = await fetch(`/api/admin/grades?id=${id}`, {
                method: "DELETE",
            })

            if (!response.ok) throw new Error("Failed to delete")

            toast.success("Calificación eliminada")
            setGrades(grades.filter((g) => g.id_calificacion !== id))
        } catch (error) {
            console.error("Error deleting grade:", error)
            toast.error("Error al eliminar la calificación")
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
                <h3 className="text-lg font-medium">Registro de Calificaciones</h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Calificación
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Calificación</DialogTitle>
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nota">Nota</Label>
                                    <Input
                                        id="nota"
                                        value={formData.nota}
                                        onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                                        placeholder="Ej: 8"
                                        required
                                    />
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
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tipo">Tipo de Evaluación</Label>
                                <Input
                                    id="tipo"
                                    value={formData.tipo_evaluacion}
                                    onChange={(e) => setFormData({ ...formData, tipo_evaluacion: e.target.value })}
                                    placeholder="Ej: Parcial 1"
                                    required
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
                            <TableHead>Materia/Profesor</TableHead>
                            <TableHead>Evaluación</TableHead>
                            <TableHead>Nota</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {grades.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    No hay calificaciones registradas
                                </TableCell>
                            </TableRow>
                        ) : (
                            grades.map((grade) => (
                                <TableRow key={grade.id_calificacion}>
                                    <TableCell>{new Date(grade.fecha).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{grade.alumno?.nombre}</TableCell>
                                    <TableCell>{grade.profesor?.nombre}</TableCell>
                                    <TableCell>{grade.tipo_evaluacion}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {grade.nota}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(grade.id_calificacion)}
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
