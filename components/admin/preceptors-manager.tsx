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
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"
import { toast } from "sonner"

interface Preceptor {
    id: string  // UUID from auth.users
    nombre: string
    email: string
    genero: string
    direccion: string
    telefono: number | null
}

export function PreceptorsManager() {
    const [preceptors, setPreceptors] = useState<Preceptor[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchData = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/admin/preceptors")
            if (!response.ok) throw new Error("Failed to fetch")
            const data = await response.json()
            setPreceptors(data || [])
        } catch (error) {
            console.error("Error fetching preceptors:", error)
            toast.error("Error al cargar preceptores")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Filter preceptors based on search term
    const filteredPreceptors = preceptors.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
                <h3 className="text-lg font-medium">Preceptores del Sistema</h3>
                <p className="text-sm text-gray-500">
                    Los preceptores se gestionan desde la sección de Usuarios asignando el rol correspondiente
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Dirección</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPreceptors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                    {searchTerm ? "No se encontraron preceptores" : "No hay preceptores registrados"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPreceptors.map((preceptor) => (
                                <TableRow key={preceptor.id}>
                                    <TableCell className="font-medium">{preceptor.nombre}</TableCell>
                                    <TableCell>{preceptor.email}</TableCell>
                                    <TableCell>{preceptor.telefono || "-"}</TableCell>
                                    <TableCell>{preceptor.direccion || "-"}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
