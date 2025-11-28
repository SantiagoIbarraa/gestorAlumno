import { createAdminClient, createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Helper to verify admin role
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
    const id = searchParams.get("id")

    const supabase = await createAdminClient()

    // If id is provided, fetch single student with course info
    if (id) {
        const { data: student, error: studentError } = await supabase
            .from("alumno")
            .select("*")
            .eq("id_alumno", id)
            .single()

        if (studentError) {
            return NextResponse.json({ error: studentError.message }, { status: 500 })
        }

        // Fetch enrolled course
        const { data: enrollment } = await supabase
            .from("alumno_curso")
            .select("id_curso")
            .eq("id_alumno", id)
            .maybeSingle()

        console.log("[API] Enrollment data:", enrollment)

        let curso = null
        if (enrollment?.id_curso) {
            const { data: courseData, error: courseError } = await supabase
                .from("curso")
                .select("*")
                .eq("id_curso", enrollment.id_curso)
                .single()

            console.log("[API] Course data:", courseData)
            console.log("[API] Course error:", courseError)
            curso = courseData
        }

        // Combine student data with course info
        const studentWithCourse = {
            ...student,
            curso
        }

        console.log("[API] Final student with course:", studentWithCourse)

        return NextResponse.json(studentWithCourse)
    }

    // Otherwise, fetch all students with their course info
    const { data, error } = await supabase
        .from("alumno")
        .select(`
            *,
            alumno_curso (
                curso (
                    *
                )
            )
        `)
        .order("nombre")

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Transform data to flatten structure if needed, or just return as is
    // The client expects a flat list or specific structure. 
    // Let's transform it to match what the client might find easier to work with, 
    // or just return it and let the client handle the nested structure.
    // Given the current client interface 'StudentWithCourse', let's try to match that.

    const formattedData = data.map((student: any) => ({
        ...student,
        curso: student.alumno_curso?.[0]?.curso || null
    }))

    return NextResponse.json(formattedData)
}

export async function POST(request: Request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id_curso, ...studentData } = body
        const supabase = await createAdminClient()

        // 1. Create student
        console.log("[API] Creating student with data:", studentData)
        const { data: newStudent, error: createError } = await supabase
            .from("alumno")
            .insert([studentData])
            .select()
            .single()

        if (createError) {
            console.error("[API] Error creating student:", createError)
            throw createError
        }
        console.log("[API] Student created:", newStudent)

        // 2. Assign course if provided
        if (id_curso) {
            console.log("[API] Assigning course:", id_curso)
            const { error: enrollError } = await supabase
                .from("alumno_curso")
                .insert([{ id_alumno: newStudent.id_alumno, id_curso }])

            if (enrollError) {
                console.error("[API] Error enrolling student:", enrollError)
                throw enrollError
            }
        }

        // 3. Log to history
        const { data: { user } } = await supabase.auth.getUser()
        const { error: historyError } = await supabase.from("historial_alumnos").insert([{
            id_alumno: newStudent.id_alumno,
            tipo_cambio: 'alta',
            datos_nuevos: { ...newStudent, id_curso: id_curso || null },
            usuario_id: user?.id
        }])

        if (historyError) {
            console.error("[API] Error logging history:", historyError)
            // Don't throw here, as student is already created. Just log it.
        }

        return NextResponse.json(newStudent)
    } catch (error: any) {
        console.error("Error creating student:", error)
        return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id_alumno, id_curso, ...updates } = body
        const supabase = await createAdminClient()

        // 1. Fetch current data for history
        const { data: currentStudent } = await supabase
            .from("alumno")
            .select("*")
            .eq("id_alumno", id_alumno)
            .single()

        const { data: currentEnrollment } = await supabase
            .from("alumno_curso")
            .select("id_curso")
            .eq("id_alumno", id_alumno)
            .maybeSingle()

        const datosAnteriores = {
            ...currentStudent,
            id_curso: currentEnrollment?.id_curso || null
        }

        // 2. Update student data
        const { data: updatedStudent, error: updateError } = await supabase
            .from("alumno")
            .update(updates)
            .eq("id_alumno", id_alumno)
            .select()
            .single()

        if (updateError) throw updateError

        // 3. Update course enrollment if changed
        // If id_curso is undefined, it means no change intended. If null, it means remove.
        if (id_curso !== undefined) {
            // Remove existing enrollment
            await supabase
                .from("alumno_curso")
                .delete()
                .eq("id_alumno", id_alumno)

            // Add new enrollment if not null
            if (id_curso) {
                await supabase
                    .from("alumno_curso")
                    .insert([{ id_alumno, id_curso }])
            }
        }

        // 4. Log to history
        const { data: { user } } = await supabase.auth.getUser()
        await supabase.from("historial_alumnos").insert([{
            id_alumno,
            tipo_cambio: 'modificacion',
            datos_anteriores: datosAnteriores,
            datos_nuevos: { ...updatedStudent, id_curso: id_curso !== undefined ? id_curso : datosAnteriores.id_curso },
            usuario_id: user?.id
        }])

        return NextResponse.json(updatedStudent)
    } catch (error: any) {
        console.error("Error updating student:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id_alumno, motivo, documento_url } = body

        if (!id_alumno || !motivo) {
            return NextResponse.json({ error: "ID and reason are required" }, { status: 400 })
        }

        const supabase = await createAdminClient()

        // 1. Fetch current data for history
        const { data: currentStudent } = await supabase
            .from("alumno")
            .select("*")
            .eq("id_alumno", id_alumno)
            .single()

        // 2. Log to history
        const { data: { user } } = await supabase.auth.getUser()
        await supabase.from("historial_alumnos").insert([{
            id_alumno,
            tipo_cambio: 'baja',
            datos_anteriores: currentStudent,
            motivo,
            documento_url,
            usuario_id: user?.id
        }])

        console.log("[API] Logged history for deletion. Document URL:", documento_url)

        // 3. Delete related records (alumno_curso) to avoid FK constraint violations
        // Note: We should also handle calificacion, asistencia, etc. if they exist.
        // For now, we focus on alumno_curso which is known to cause issues.
        const { error: enrollmentError } = await supabase
            .from("alumno_curso")
            .delete()
            .eq("id_alumno", id_alumno)

        if (enrollmentError) {
            console.error("[API] Error deleting enrollments:", enrollmentError)
            throw enrollmentError
        }

        // 4. Delete student
        const { error } = await supabase.from("alumno").delete().eq("id_alumno", id_alumno)

        if (error) {
            console.error("[API] Error deleting student:", error)
            throw error
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Error deleting student:", error)
        return NextResponse.json({ error: error.message, details: error }, { status: 500 })
    }
}
