"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"

export function StudentView() {
    const [attendance, setAttendance] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAttendance = async () => {
            const supabase = createClient()

            const { data } = await supabase.from("asistencia").select("*").limit(20)

            if (data) {
                setAttendance(data)
            }
            setLoading(false)
        }

        fetchAttendance()
    }, [])

    const filteredAttendance = attendance.filter((a) => a.fecha?.includes(search))

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Barra de búsqueda */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h3 className="font-bold text-lg mb-4">Buscar</h3>
                        <Input
                            placeholder="Buscar fecha..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Mi Asistencia</h2>

                        {loading ? (
                            <p className="text-gray-600">Cargando...</p>
                        ) : filteredAttendance.length === 0 ? (
                            <p className="text-gray-600">No hay registros de asistencia</p>
                        ) : (
                            <div className="space-y-4">
                                {filteredAttendance.map((record, idx) => (
                                    <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-gray-800">{record.fecha}</h4>
                                                {record.justificacion && (
                                                    <p className="text-sm text-gray-600">Justificación: {record.justificacion}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-white font-bold ${record.presente ? "bg-green-500" : "bg-red-500"
                                                        }`}
                                                >
                                                    {record.presente ? "Presente" : "Ausente"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
