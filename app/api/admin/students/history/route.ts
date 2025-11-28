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

export async function GET(request: Request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id_alumno = searchParams.get("id_alumno")

    // if (!id_alumno) {
    //     return NextResponse.json({ error: "Missing id_alumno" }, { status: 400 })
    // }

    try {
        const supabase = await createAdminClient()

        let query = supabase
            .from("historial_alumnos")
            .select("*")
            .order("created_at", { ascending: false })

        if (id_alumno) {
            query = query.eq("id_alumno", id_alumno)
        }

        const { data, error } = await query

        if (error) throw error

        console.log(`[API] Fetched ${data?.length} history records`)
        return NextResponse.json(data)
    } catch (error: any) {
        console.error("Error fetching student history:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
