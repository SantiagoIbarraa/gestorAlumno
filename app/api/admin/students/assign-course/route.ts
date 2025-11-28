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

export async function POST(request: Request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const supabase = await createAdminClient()
        const body = await request.json()
        const { id_alumno, id_curso } = body

        const { data, error } = await supabase
            .from("alumno_curso")
            .insert([{ id_alumno, id_curso }])
            .select()
            .single()

        if (error) {
            if (error.code === '23505') { // Unique violation
                return NextResponse.json({ error: "El alumno ya está asignado a este curso" }, { status: 400 })
            }
            throw error
        }

        return NextResponse.json(data)
    } catch (error: any) {
        console.error("Error assigning student to course:", error)
        return NextResponse.json(
            { error: error.message || "Error assigning student to course" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const supabase = await createAdminClient()
        const body = await request.json()
        const { id_alumno, id_curso } = body

        const { error } = await supabase
            .from("alumno_curso")
            .delete()
            .match({ id_alumno, id_curso })

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Error removing student from course:", error)
        return NextResponse.json(
            { error: error.message || "Error removing student from course" },
            { status: 500 }
        )
    }
}
