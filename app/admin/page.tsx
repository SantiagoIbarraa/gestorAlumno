"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { HeaderUser } from "@/components/header-user"
import { StudentsManager } from "@/components/admin/students-manager"
import { GradesManager } from "@/components/admin/grades-manager"
// import { SchedulesManager } from "@/components/admin/schedules-manager"
import { CoursesManager } from "@/components/admin/courses-manager"
import { PreceptorsManager } from "@/components/admin/preceptors-manager"
import { UsersManager } from "@/components/admin/users-manager"
import { StudentsHistory } from "@/components/admin/students-history"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("students")
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      try {
        // Usar API route que bypasea RLS con service role
        const response = await fetch("/api/auth/get-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        })

        const { role } = await response.json()
        console.log("[Admin] Checking admin access:", { userId: user.id, email: user.email, role })

        if (role !== "admin") {
          router.push("/auth/login")
          return
        }

        setIsAdmin(true)
        setLoading(false)
      } catch (error) {
        console.error("[Admin] Error checking admin access:", error)
        router.push("/auth/login")
      }
    }

    checkAdmin()
  }, [router])

  if (loading) return null
  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderUser />

      <div className="max-w-7xl mx-auto p-6">


        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === "students" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          >
            Alumnos
          </button>
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === "courses" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          >
            Cursos
          </button>
          <button
            onClick={() => setActiveTab("preceptors")}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === "preceptors" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          >
            Preceptores
          </button>
          <button
            onClick={() => setActiveTab("grades")}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === "grades" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          >
            Calificaciones
          </button>
          {/* <button
            onClick={() => setActiveTab("schedules")}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === "schedules" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          >
            Horarios
          </button> */}
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === "users" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === "history" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
          >
            Historial
          </button>
        </div>

        {activeTab === "students" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <StudentsManager />
          </div>
        )}

        {activeTab === "courses" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <CoursesManager />
          </div>
        )}

        {activeTab === "preceptors" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <PreceptorsManager />
          </div>
        )}

        {activeTab === "grades" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <GradesManager />
          </div>
        )}

        {/* {activeTab === "schedules" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <SchedulesManager />
          </div>
        )} */}

        {activeTab === "users" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <UsersManager />
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white p-6 rounded-lg shadow">
            <StudentsHistory />
          </div>
        )}
      </div>
    </div>
  )
}
