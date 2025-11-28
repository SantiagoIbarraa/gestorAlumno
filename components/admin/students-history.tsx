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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, FileText, Search, RefreshCw, Eye, Download } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface HistoryRecord {
    id_historial: number
    tipo_cambio: string
    datos_anteriores: any
    datos_nuevos: any
    motivo: string
    documento_url: string
    created_at: string
    usuario_email: string
    usuario_nombre: string
    id_alumno: number
}

export function StudentsHistory() {
    const [history, setHistory] = useState<HistoryRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState<string>("all")

    // Preview Modal State
    const [previewOpen, setPreviewOpen] = useState(false)
    const [selectedDoc, setSelectedDoc] = useState<{ url: string, type: string } | null>(null)

    const fetchHistory = async () => {
        setLoading(true)
        try {
            const response = await fetch("/api/admin/students/history")
            if (!response.ok) throw new Error("Failed to fetch history")
            const data = await response.json()
            console.log("[History] Fetched records:", data)
            setHistory(data)
        } catch (error) {
            console.error("Error fetching history:", error)
            toast.error("Error al cargar el historial")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHistory()
    }, [])

    const getStudentName = (record: HistoryRecord) => {
        return record.datos_nuevos?.nombre || record.datos_anteriores?.nombre || "Desconocido"
    }

    const handlePreview = (url: string) => {
        // Determine type based on extension
        const extension = url.split('.').pop()?.toLowerCase()
        const type = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '') ? 'image' : 'pdf'

        setSelectedDoc({ url, type })
        setPreviewOpen(true)
    }

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url)
            const blob = await response.blob()
            const link = document.createElement('a')
            link.href = window.URL.createObjectURL(blob)
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error("Error downloading file:", error)
            toast.error("Error al descargar el archivo")
        }
    }

    const filteredHistory = history.filter(record => {
        const matchesSearch =
            getStudentName(record).toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.motivo?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesType = filterType === "all" || record.tipo_cambio === filterType

        return matchesSearch && matchesType
    })

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Historial de Movimientos</h3>
                <Button variant="outline" size="sm" onClick={fetchHistory} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Actualizar
                </Button>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Buscar por nombre o motivo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        <SelectItem value="alta">Altas</SelectItem>
                        <SelectItem value="baja">Bajas</SelectItem>
                        <SelectItem value="modificacion">Modificaciones</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Alumno</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Motivo</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead className="text-right">Documento</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredHistory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    No se encontraron registros
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredHistory.map((record) => (
                                <TableRow key={record.id_historial}>
                                    <TableCell className="whitespace-nowrap">
                                        {format(new Date(record.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {getStudentName(record)}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${record.tipo_cambio === 'alta' ? 'bg-green-100 text-green-800' :
                                            record.tipo_cambio === 'baja' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                            {record.tipo_cambio.toUpperCase()}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={record.motivo}>
                                        {record.motivo || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {record.usuario_nombre || record.usuario_email || 'Sistema'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {record.documento_url ? (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handlePreview(record.documento_url)}
                                                    title="Ver documento"
                                                    className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDownload(record.documento_url, `documento_${record.id_historial}`)}
                                                    title="Descargar"
                                                    className="h-8 w-8 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Document Preview Modal */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Vista Previa del Documento</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center p-4">
                        {selectedDoc?.type === 'image' ? (
                            <img
                                src={selectedDoc.url}
                                alt="Documento"
                                className="max-w-full max-h-full object-contain"
                            />
                        ) : (
                            <iframe
                                src={selectedDoc?.url}
                                className="w-full h-full border-0"
                                title="PDF Preview"
                            />
                        )}
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={() => setPreviewOpen(false)}>Cerrar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
