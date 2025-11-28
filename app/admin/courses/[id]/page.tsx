"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { HeaderUser } from "@/components/header-user"
import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ChevronLeft, Loader2, User, Users, BookOpen, UserPlus, Trash2, Search } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface Student {
    id_alumno: number
    nombre: string
    email: string
    genero: string
}

interface Subject {
    id_materia: number
    nombre: string
    descripcion: string
    carga_horaria: string
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const [courseId, setCourseId] = useState<string>("")
    const [course, setCourse] = useState<Course | null>(null)
    const [students, setStudents] = useState<Student[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [allPreceptors, setAllPreceptors] = useState<any[]>([])
    const [allStudents, setAllStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [selectedPreceptor, setSelectedPreceptor] = useState<string>("null")

    // New state for tabs and search
    const [activeTab, setActiveTab] = useState<"enrolled" | "available">("enrolled")
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        params.then(p => {
            setCourseId(p.id)
        })
    }, [params])

    const fetchData = async () => {
        if (!courseId) return
        setLoading(true)
        try {
            const [courseRes, studentsRes, subjectsRes, preceptorsRes, allStudentsRes] = await Promise.all([
                fetch(`/api/admin/courses/${courseId}`),
                fetch(`/api/admin/courses/${courseId}/students`),
                fetch(`/api/admin/subjects?courseId=${courseId}`),
                fetch("/api/admin/preceptors"),
                fetch("/api/admin/students")
            ])

            if (!courseRes.ok || !studentsRes.ok || !subjectsRes.ok || !preceptorsRes.ok || !allStudentsRes.ok) {
                throw new Error("Failed to fetch data")
            }

            const courseData = await courseRes.json()
            const studentsData = await studentsRes.json()
            const subjectsData = await subjectsRes.json()
            const preceptorsData = await preceptorsRes.json()
            const allStudentsData = await allStudentsRes.json()

            setCourse(courseData)
            setStudents(studentsData || [])
            setSubjects(subjectsData || [])
            setAllPreceptors(preceptorsData || [])
            setAllStudents(allStudentsData || [])

            if (courseData.id_preceptor) {
                setSelectedPreceptor(courseData.id_preceptor)
            }
        } catch (error) {
            console.error("Error fetching course data:", error)
            toast.error("Error al cargar datos del curso")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [courseId])

    const handleUpdatePreceptor = async () => {
        if (!course) return
        setSubmitting(true)
        try {
            const response = await fetch("/api/admin/courses", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_curso: course.id_curso,
                    id_preceptor: selectedPreceptor === "null" ? null : selectedPreceptor
                }),
            })

            if (!response.ok) throw new Error("Failed to update preceptor")

            toast.success("Preceptor actualizado correctamente")
            fetchData()
        } catch (error) {
            console.error("Error updating preceptor:", error)
            toast.error("Error al actualizar preceptor")
        } finally {
            setSubmitting(false)
        }
    }

    const handleEnrollStudent = async (studentId: number) => {
        if (!course) return
        setSubmitting(true)
        try {
            const response = await fetch("/api/admin/students/assign-course", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_curso: course.id_curso,
                    id_alumno: studentId
                }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || "Failed to enroll student")

            toast.success("Alumno inscrito correctamente")
            fetchData()
        } catch (error: any) {
            console.error("Error enrolling student:", error)
            toast.error(error.message || "Error al inscribir alumno")
        } finally {
            setSubmitting(false)
        }
    }

    const handleRemoveStudent = async (studentId: number) => {
        if (!course || !confirm("¿Estás seguro de que deseas eliminar a este alumno del curso?")) return

        try {
            const response = await fetch("/api/admin/students/assign-course", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_curso: course.id_curso,
                    id_alumno: studentId
                }),
            })

            if (!response.ok) throw new Error("Failed to remove student")

            toast.success("Alumno eliminado del curso correctamente")
            fetchData()
        } catch (error: any) {
            console.error("Error removing student:", error)
            toast.error(error.message || "Error al eliminar alumno")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <HeaderUser />
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </div>
        )
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50">
                <HeaderUser />
                <div className="max-w-7xl mx-auto p-6">
                    <p className="text-center text-gray-500">Curso no encontrado</p>
                    <Link href="/admin" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-4">
                        <ChevronLeft className="w-5 h-5" />
                        Volver al Panel de Admin
                    </Link>
                </div>
            </div>
        )
    }

    // Filter students who are not yet enrolled
    const availableStudents = allStudents.filter(
        s => !students.some(enrolled => enrolled.id_alumno === s.id_alumno)
    )

    // Filter for search
    const filteredAvailableStudents = availableStudents.filter(s =>
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredEnrolledStudents = students.filter(s =>
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <HeaderUser />

            <div className="max-w-7xl mx-auto p-6">
                <Link href="/admin" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
                    <ChevronLeft className="w-5 h-5" />
                    Volver al Panel de Admin
                </Link>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">{course.nombre}</h1>
                    <div className="flex gap-4 mt-2 text-gray-600">
                        <span>Nivel: {course.nivel}</span>
                        <span>•</span>
                        <span>Año: {course.año}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Preceptor Card */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-semibold">Preceptor Asignado</h2>
                        </div>

                        <div className="space-y-4">
                            {course.preceptor ? (
                                <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                                    <p className="text-lg font-medium text-blue-900">{course.preceptor.nombre}</p>
                                    <p className="text-sm text-blue-700">{course.preceptor.email}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic p-4 bg-gray-50 rounded-md border">Sin preceptor asignado</p>
                            )}

                            <div className="flex gap-2 items-end">
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Cambiar Preceptor</label>
                                    <Select value={selectedPreceptor} onValueChange={setSelectedPreceptor}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar Preceptor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="null">Sin asignar</SelectItem>
                                            {allPreceptors.map((p) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleUpdatePreceptor} disabled={submitting}>
                                    Actualizar
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <span className="text-gray-600">Alumnos inscritos:</span>
                                <span className="text-2xl font-bold text-blue-600">{students.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <span className="text-gray-600">Materias:</span>
                                <span className="text-2xl font-bold text-green-600">{subjects.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students Section */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            <h2 className="text-xl font-semibold">Gestión de Alumnos</h2>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-6 border-b">
                        <button
                            className={cn(
                                "px-4 py-2 font-medium text-sm transition-colors relative",
                                activeTab === "enrolled"
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                            onClick={() => {
                                setActiveTab("enrolled")
                                setSearchTerm("")
                            }}
                        >
                            Alumnos Inscritos ({students.length})
                        </button>
                        <button
                            className={cn(
                                "px-4 py-2 font-medium text-sm transition-colors relative",
                                activeTab === "available"
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                            onClick={() => {
                                setActiveTab("available")
                                setSearchTerm("")
                            }}
                        >
                            Inscribir Alumnos ({availableStudents.length})
                        </button>
                    </div>

                    <div className="mb-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder={activeTab === "enrolled" ? "Buscar en inscritos..." : "Buscar alumnos para inscribir..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 max-w-md"
                        />
                    </div>

                    {activeTab === "enrolled" ? (
                        filteredEnrolledStudents.length > 0 ? (
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Género</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredEnrolledStudents.map((student) => (
                                            <TableRow key={student.id_alumno}>
                                                <TableCell className="font-medium">{student.nombre}</TableCell>
                                                <TableCell>{student.email}</TableCell>
                                                <TableCell>{student.genero}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveStudent(student.id_alumno)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        title="Eliminar del curso"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-md border border-dashed">
                                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No se encontraron alumnos inscritos</p>
                            </div>
                        )
                    ) : (
                        filteredAvailableStudents.length > 0 ? (
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Género</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAvailableStudents.map((student) => (
                                            <TableRow key={student.id_alumno}>
                                                <TableCell className="font-medium">{student.nombre}</TableCell>
                                                <TableCell>{student.email}</TableCell>
                                                <TableCell>{student.genero}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleEnrollStudent(student.id_alumno)}
                                                        disabled={submitting}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <UserPlus className="h-4 w-4 mr-2" />
                                                        Inscribir
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-md border border-dashed">
                                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No se encontraron alumnos disponibles</p>
                            </div>
                        )
                    )}
                </div>

                {/* Subjects Table */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <h2 className="text-xl font-semibold">Materias</h2>
                    </div>
                    {subjects.length > 0 ? (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Carga Horaria</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subjects.map((subject) => (
                                        <TableRow key={subject.id_materia}>
                                            <TableCell className="font-medium">{subject.nombre}</TableCell>
                                            <TableCell>{subject.descripcion}</TableCell>
                                            <TableCell>{subject.carga_horaria}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No hay materias asignadas a este curso</p>
                    )}
                </div>
            </div>
        </div>
    )
}
