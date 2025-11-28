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

        // Fetch users with 'preceptor' role from user_roles
        const { data: userRoles, error: rolesError } = await supabase
            .from("user_roles")
            .select("id, role")
            .eq("role", "preceptor")

        if (rolesError) throw rolesError

        // Get user details from auth.users for each preceptor
        const preceptors = []
        for (const userRole of userRoles || []) {
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userRole.id)

            if (!userError && userData.user) {
                preceptors.push({
                    id: userData.user.id,
                    email: userData.user.email,
                    nombre: userData.user.user_metadata?.nombre || userData.user.email,
                    genero: userData.user.user_metadata?.genero || "",
                    direccion: userData.user.user_metadata?.direccion || "",
                    telefono: userData.user.user_metadata?.telefono || null,
                })
            }
        }

        return NextResponse.json(preceptors)
    } catch (error: any) {
        console.error("Error fetching preceptors:", error)
        return NextResponse.json(
            { error: error.message || "Error fetching preceptors", details: error },
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
        const { nombre, email, genero, direccion, telefono, password } = body

        // Create auth user with all metadata
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                nombre,
                genero,
                direccion,
                telefono,
                role: 'preceptor'
            }
        })

        if (authError) throw authError

        // Assign role in user_roles
        await supabase
            .from("user_roles")
            .update({ role: 'preceptor' })
            .eq("id", authData.user.id)

        return NextResponse.json({
            id: authData.user.id,
            email: authData.user.email,
            nombre,
            genero,
            direccion,
            telefono
        })
    } catch (error: any) {
        console.error("Error creating preceptor:", error)
        return NextResponse.json(
            { error: error.message || "Error creating preceptor" },
            { status: 500 }
        )
    }
}
