"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export function HeaderUser() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: { nombre?: string } } | null>(null)
  const [role, setRole] = useState<string>("usuario")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)

        try {
          // Usar API route que bypasea RLS con service role
          const response = await fetch("/api/auth/get-role", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: user.id }),
          })

          if (response.ok) {
            const data = await response.json()
            console.log("[Header] Role fetched:", data)
            setRole(data.role || "usuario")
          } else {
            console.error("[Header] Error fetching role:", response.status)
          }
        } catch (err) {
          console.error("[Header] Error fetching role:", err)
        }
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  if (loading) return null

  const nombre = user?.user_metadata?.nombre || user?.email?.split("@")[0] || "Usuario"

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-blue-600">EEST1VL</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <span className="font-semibold text-gray-800">{nombre}</span>
            <span className="text-sm text-gray-600 capitalize">{role}</span>
          </div>
          {role === "admin" && (
            <Link href="/admin">
              <Button variant="ghost">Panel Admin</Button>
            </Link>
          )}
          <Button onClick={handleLogout} variant="outline">
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </nav>
  )
}
