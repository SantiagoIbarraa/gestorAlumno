import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yzdksqysuglvbgtlivuz.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZGtzcXlzdWdsdmJndGxpdnV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MjUyODgsImV4cCI6MjA3ODEwMTI4OH0._jLKrv2WuyzNnlas7iD7JNOMgNq2GczV0Q4dMoK9rmc",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    },
  )
}

import { createClient } from "@supabase/supabase-js"

export async function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yzdksqysuglvbgtlivuz.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZGtzcXlzdWdsdmJndGxpdnV6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUyNTI4OCwiZXhwIjoyMDc4MTAxMjg4fQ.GXC5-mczLOtKrQSMe0Fr6AAzCwDl6lw2buGMwRm0fUk",
    process.env.SUPABASE_ANON_KEY || "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
