"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle2, Clock } from "lucide-react"

export function PendingApprovalView() {
    const [requested, setRequested] = useState(false)

    const handleRequest = async () => {
        try {
            const response = await fetch("/api/user/request-admin", {
                method: "POST",
            })

            if (response.ok) {
                setRequested(true)
            }
        } catch (error) {
            console.error("Error requesting admin:", error)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        {requested ? (
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        ) : (
                            <Clock className="w-8 h-8 text-yellow-600" />
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        {requested ? "Solicitud Enviada" : "Cuenta Pendiente"}
                    </CardTitle>
                    <CardDescription>
                        {requested
                            ? "Tu solicitud ha sido enviada correctamente. Te notificaremos cuando tu cuenta sea aprobada."
                            : "Tu cuenta necesita ser aprobada por un administrador para acceder al sistema."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!requested ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Para agilizar el proceso, puedes enviar una solicitud de revisión.
                            </p>
                            <Button onClick={handleRequest} className="w-full bg-blue-600 hover:bg-blue-700">
                                Enviar Solicitud
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-800">
                                Por favor, espera a que un administrador active tu cuenta.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
