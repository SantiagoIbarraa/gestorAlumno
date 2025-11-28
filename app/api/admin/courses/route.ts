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

    try {
        const supabase = await createAdminClient()

        const { data: courses, error } = await supabase
            .from("curso")
            .select("*")
            .order("id_curso", { ascending: true })

        if (error) throw error

        return NextResponse.json(courses)
    } catch (error) {
        console.error("Error fetching courses:", error)
        return NextResponse.json(
            { error: "Error fetching courses" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const supabase = await createAdminClient()

        const body = await request.json()
        const { nombre, nivel, año, id_preceptor } = body

        const { data, error } = await supabase
            .from("curso")
            .insert([{ nombre, nivel, año, id_preceptor }])
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error("Error creating course:", error)
        return NextResponse.json(
            { error: "Error creating course" },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const supabase = await createAdminClient()

        const body = await request.json()
        const { id_curso, id_preceptor } = body

        console.log("[API] Updating course:", id_curso, "with preceptor:", id_preceptor)

        const { data, error } = await supabase
            .from("curso")
            .update({ id_preceptor })
            .eq("id_curso", id_curso)
            .select()
            .single()

        if (error) {
            console.error("[API] Supabase error:", error)
            throw error
        }

        console.log("[API] Update successful:", data)
        return NextResponse.json(data)
    } catch (error: any) {
        console.error("Error updating course:", error)
        console.error("Error details:", error.message, error.details, error.hint)
        return NextResponse.json(
            { error: error.message || "Error updating course", details: error },
            { status: 500 }
        )
    }
}
