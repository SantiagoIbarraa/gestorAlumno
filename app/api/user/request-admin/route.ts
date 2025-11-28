import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const supabase = await createServerClient()
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Update user_roles table
        const { error } = await supabase
            .from("user_roles")
            .update({ requested_admin: true })
            .eq("id", user.id)

        if (error) {
            console.error("Error requesting admin:", error)
            return NextResponse.json({ error: "Failed to request admin" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error in request-admin:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
