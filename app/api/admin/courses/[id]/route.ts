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

        const { data: course, error } = await supabase
            .from("curso")
            .select("*")
            .eq("id_curso", id)
            .single()

        if (error) throw error

        // Fetch preceptor from auth.users
        let preceptor = null
        if (course.id_preceptor) {
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(course.id_preceptor)

            if (!userError && userData.user) {
                preceptor = {
                    id: userData.user.id,
                    nombre: userData.user.user_metadata?.nombre || userData.user.email,
                    email: userData.user.email
                }
            }
        }

        return NextResponse.json({ ...course, preceptor })
    } catch (error: any) {
        console.error("Error fetching course details:", error)
        return NextResponse.json(
            { error: error.message || "Error fetching course details" },
            { status: 500 }
        )
    }
}
