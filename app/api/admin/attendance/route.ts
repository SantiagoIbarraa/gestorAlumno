import { createAdminClient, createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

async function verifyAdmin() {
    const supabase = await createServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const adminClient = await createAdminClient()
    const { data: roleData } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("id", user.id)
        .single()

    return roleData?.role === "admin"
}

export async function GET() {
    console.log("[Attendance API] GET request received")
    if (!(await verifyAdmin())) {
        console.log("[Attendance API] Unauthorized")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()

    // Debugging: fetch without ordering to check columns
    const { data, error } = await supabase
        .from("asistencia")
        .select(`
      *,
      alumno (nombre),
      profesor (nombre)
    `)

    if (data && data.length > 0) {
        console.log("[Attendance API] First row keys:", Object.keys(data[0]))
    } else {
        console.log("[Attendance API] No data found or empty table")
    }

    if (error) {
        console.log("[Attendance API] Database error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[Attendance API] Success, count:", data?.length)
    return NextResponse.json(data)
}

export async function POST(request: Request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const supabase = await createAdminClient()

    const { data, error } = await supabase.from("asistencia").insert([body]).select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function DELETE(request: Request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

    const supabase = await createAdminClient()
    const { error } = await supabase.from("asistencia").delete().eq("id_asistencia", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
