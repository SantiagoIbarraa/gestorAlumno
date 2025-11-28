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
    const courseId = searchParams.get("courseId")

    const supabase = await createAdminClient()

    let query = supabase.from("materia").select("*").order("nombre")

    if (courseId) {
        query = query.eq("id_curso", courseId)
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}
