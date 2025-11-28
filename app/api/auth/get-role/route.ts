import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] POST /api/auth/get-role - Starting")
    console.log("[v0] Service Role Key exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      console.log("[v0] No userId provided")
      return NextResponse.json({ role: "usuario" }, { status: 400 })
    }

    console.log("[v0] Fetching role for userId:", userId)

    const supabase = await createAdminClient()

    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("id", userId)
      .maybeSingle()

    if (roleError) {
      console.error("[v0] Error fetching role:", roleError) // eslint-disable-line
      return NextResponse.json({ role: "usuario" })
    }

    console.log("[v0] User role fetched:", { userId, role: userRole?.role })

    if (!userRole) {
      console.log("[v0] No role found for user, defaulting to 'usuario'")
    }

    return NextResponse.json({ role: userRole?.role || "usuario" })
  } catch (error) {
    console.error("[v0] Get role error:", error) // eslint-disable-line
    return NextResponse.json({ role: "usuario" })
  }
}
