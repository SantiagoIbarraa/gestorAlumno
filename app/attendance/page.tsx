"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { HeaderUser } from "@/components/header-user"
import { PreceptorView } from "./preceptor-view"
import { StudentView } from "./student-view"
import { PendingApprovalView } from "./pending-view"

export default function AttendancePage() {
    const router = useRouter()
    const [role, setRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                router.push("/auth/login")
                return
            }

            try {
                const response = await fetch("/api/auth/get-role", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userId: user.id }),
                })

                if (response.ok) {
                    const data = await response.json()
                    setRole(data.role)
                }
            } catch (error) {
                console.error("Error fetching role:", error)
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [router])

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <HeaderUser />

            {role === "preceptor" || role === "admin" ? (
                <PreceptorView />
            ) : role === "student" ? (
                <StudentView />
            ) : (
                <PendingApprovalView />
            )}
        </div>
    )
}
