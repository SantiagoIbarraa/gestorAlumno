import { createAdminClient, createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

async function verifyAdmin() {
    const supabase = await createServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        console.log("[Professors API] No user found")
        return false
    }

    const adminClient = await createAdminClient()
    const { data: roleData, error } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (error) {
        console.log("[Professors API] Error fetching role:", error)
    }

    console.log("[Professors API] User:", user.id, "Role:", roleData?.role)
    return roleData?.role === "admin"
}

export async function GET() {
    console.log("[Professors API] GET request received")
    if (!(await verifyAdmin())) {
        console.log("[Professors API] Unauthorized access attempt")
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createAdminClient()
    const { data, error } = await supabase.from("profesor").select("*").order("nombre")

    if (error) {
        console.log("[Professors API] Database error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[Professors API] Successfully fetched professors:", data?.length)
    return NextResponse.json(data)
}
