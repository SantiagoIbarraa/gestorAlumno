import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
    console.log("Checking 'alumno' table schema...")
    const { data, error } = await supabase
        .from('alumno')
        .select('*')
        .limit(1)

    if (error) {
        console.error("Error accessing 'alumno' table:", error)
    } else {
        console.log("'alumno' table exists. Sample data:", data)
    }

    // Check columns using rpc if possible, or just try an insert
    console.log("Attempting test insert...")
    const testStudent = {
        nombre: "Test Schema",
        email: "test.schema@test.com",
        genero: "Masculino",
        direccion: "Test Address",
        telefono: 123456
    }

    const { data: insertData, error: insertError } = await supabase
        .from('alumno')
        .insert([testStudent])
        .select()

    if (insertError) {
        console.error("Insert failed:", insertError)
    } else {
        console.log("Insert successful:", insertData)
        // Cleanup
        await supabase.from('alumno').delete().eq('email', 'test.schema@test.com')
    }
}

checkSchema()
