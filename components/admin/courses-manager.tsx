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
import { Plus, Loader2, Pencil } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Course {
    id_curso: number
    nombre: string
    nivel: string
    año: number
    id_preceptor: string | null
    preceptor?: {
        id: string
        nombre: string
    } | null
}

interface Preceptor {
    id: string  // UUID from auth.users
    nombre: string
}

export function CoursesManager() {
    const [courses, setCourses] = useState<Course[]>([])
    const [preceptors, setPreceptors] = useState<Preceptor[]>([])
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)

    const [formData, setFormData] = useState({
        nombre: "",
        nivel: "",
        año: new Date().getFullYear().toString(),
        id_preceptor: "null",
    })

    const fetchData = async () => {
        setLoading(true)
        try {
            const [coursesRes, preceptorsRes] = await Promise.all([
                fetch("/api/admin/courses"),
                fetch("/api/admin/preceptors")
            ])

            if (!coursesRes.ok || !preceptorsRes.ok) throw new Error("Failed to fetch data")

            const coursesData = await coursesRes.json()
            const preceptorsData = await preceptorsRes.json()

            // Manual join for preceptors
            const coursesWithPreceptors = (coursesData || []).map((course: any) => ({
                ...course,
                preceptor: preceptorsData.find((p: any) => p.id === course.id_preceptor) || null
            }))

            setCourses(coursesWithPreceptors)
            setPreceptors(preceptorsData || [])
        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Error al cargar datos. Revise la consola para más detalles.")
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
            const payload = {
                nombre: formData.nombre,
                nivel: formData.nivel,
                // año: parseInt(formData.año), // Removed as per request
                id_preceptor: formData.id_preceptor === "null" ? null : formData.id_preceptor, // Keep as string (UUID)
            }

            if (editingId) {
                const response = await fetch("/api/admin/courses", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...payload, id_curso: editingId }),
                })
                if (!response.ok) throw new Error("Failed to update")
                toast.success("Curso actualizado correctamente")
            } else {
                const response = await fetch("/api/admin/courses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
                if (!response.ok) throw new Error("Failed to create")
                toast.success("Curso creado correctamente")
            }

            setIsOpen(false)
            setEditingId(null)
            setFormData({
                nombre: "",
                nivel: "",
                año: new Date().getFullYear().toString(),
                id_preceptor: "null",
            })
            fetchData()
        } catch (error) {
            console.error("Error saving course:", error)
            toast.error("Error al guardar curso")
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (courseId: number) => {
        const course = courses.find(c => c.id_curso === courseId)
        if (course) {
            setEditingId(courseId)
            setFormData({
                nombre: course.nombre,
                nivel: course.nivel,
                año: course.año?.toString() || new Date().getFullYear().toString(),
                id_preceptor: course.id_preceptor || "null"
            })
            setIsOpen(true)
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
                <h3 className="text-lg font-medium">Gestión de Cursos</h3>
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open)
                    if (!open) {
                        setEditingId(null)
                        setFormData({
                            nombre: "",
                            nivel: "",
                            año: new Date().getFullYear().toString(),
                            id_preceptor: "null",
                        })
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Curso
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Editar Curso" : "Nuevo Curso"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre del Curso</Label>
                                <Input
                                    id="nombre"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej: 1° Año - Electrónica"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nivel">Nivel</Label>
                                <Input
                                    id="nivel"
                                    value={formData.nivel}
                                    onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                                    placeholder="Ej: Básico / Superior"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="preceptor">Preceptor Asignado</Label>
                                <Select
                                    value={formData.id_preceptor}
                                    onValueChange={(value) => setFormData({ ...formData, id_preceptor: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar Preceptor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">Sin asignar</SelectItem>
                                        {preceptors.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                            <TableHead>Curso</TableHead>
                            <TableHead>Nivel</TableHead>
                            <TableHead>Preceptor</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                    No hay cursos registrados
                                </TableCell>
                            </TableRow>
                        ) : (
                            courses.map((course) => (
                                <TableRow key={course.id_curso}>
                                    <TableCell className="font-medium">
                                        <Link
                                            href={`/admin/courses/${course.id_curso}`}
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {course.nombre}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{course.nivel}</TableCell>
                                    <TableCell>
                                        {course.preceptor ? (
                                            <span className="text-blue-600 font-medium">{course.preceptor.nombre}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">Sin asignar</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(course.id_curso)}
                                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                            title="Editar Curso"
                                        >
                                            <Pencil className="h-4 w-4" />
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
