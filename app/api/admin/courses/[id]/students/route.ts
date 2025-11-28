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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params
        const supabase = await createAdminClient()

        const { data: students, error } = await supabase
            .from("alumno_curso")
            .select(`
                id_alumno,
                alumno:alumno(*)
            `)
            .eq("id_curso", id)

        if (error) throw error

        // Transform data to return just the student objects
        const formattedStudents = students.map((item: any) => item.alumno)

        return NextResponse.json(formattedStudents)
    } catch (error: any) {
        console.error("Error fetching course students:", error)
        return NextResponse.json(
            { error: error.message || "Error fetching course students" },
            { status: 500 }
        )
    }
}
