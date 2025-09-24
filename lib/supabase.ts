import { createBrowserClient, createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = "https://oyydhfvgtmghvnbkvczr.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95eWRoZnZndG1naHZuYmt2Y3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTMwMTIsImV4cCI6MjA3MzE2OTAxMn0.fgz_Vl7bZ1rtrttOAQcTlymMgHfhiY2NDo3qEnBT1og"

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          password: string
          display_name: string | null
          role: "resident" | "committee" | "vendor"
          phone: string | null
          room: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password: string
          display_name?: string | null
          role?: "resident" | "committee" | "vendor"
          phone?: string | null
          room?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password?: string
          display_name?: string | null
          role?: "resident" | "committee" | "vendor"
          phone?: string | null
          room?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          time: string
          author: string
          options: any
          votes: any
          voters: any
          reads: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          time?: string
          author: string
          options?: any
          votes?: any
          voters?: any
          reads?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          time?: string
          author?: string
          options?: any
          votes?: any
          voters?: any
          reads?: any
          created_at?: string
          updated_at?: string
        }
      }
      maintenance: {
        Row: {
          id: string
          equipment: string
          item: string
          time: string
          handler: string
          cost: number
          note: string
          status: "open" | "progress" | "closed"
          assignee: string
          logs: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          equipment: string
          item: string
          time?: string
          handler?: string
          cost?: number
          note?: string
          status?: "open" | "progress" | "closed"
          assignee?: string
          logs?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          equipment?: string
          item?: string
          time?: string
          handler?: string
          cost?: number
          note?: string
          status?: "open" | "progress" | "closed"
          assignee?: string
          logs?: any
          created_at?: string
          updated_at?: string
        }
      }
      fees: {
        Row: {
          id: string
          room: string
          amount: number
          due: string
          paid: boolean
          paid_at: string | null
          invoice: string
          note: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room: string
          amount: number
          due: string
          paid?: boolean
          paid_at?: string | null
          invoice?: string
          note?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room?: string
          amount?: number
          due?: string
          paid?: boolean
          paid_at?: string | null
          invoice?: string
          note?: string
          created_at?: string
          updated_at?: string
        }
      }
      residents: {
        Row: {
          id: string
          name: string
          room: string
          phone: string
          email: string
          role: "resident" | "committee" | "vendor"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          room: string
          phone?: string
          email?: string
          role?: "resident" | "committee" | "vendor"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          room?: string
          phone?: string
          email?: string
          role?: "resident" | "committee" | "vendor"
          created_at?: string
          updated_at?: string
        }
      }
      visitors: {
        Row: {
          id: string
          name: string
          room: string
          in: string
          out: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          room: string
          in?: string
          out?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          room?: string
          in?: string
          out?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      packages: {
        Row: {
          id: string
          courier: string
          tracking: string
          room: string
          received_at: string
          picked_at: string | null
          picker: string
          note: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          courier?: string
          tracking?: string
          room: string
          received_at?: string
          picked_at?: string | null
          picker?: string
          note?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          courier?: string
          tracking?: string
          room?: string
          received_at?: string
          picked_at?: string | null
          picker?: string
          note?: string
          created_at?: string
          updated_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          topic: string
          time: string
          location: string
          notes: string
          minutes_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          topic: string
          time: string
          location: string
          notes?: string
          minutes_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic?: string
          time?: string
          location?: string
          notes?: string
          minutes_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      emergencies: {
        Row: {
          id: string
          type: string
          time: string
          note: string
          by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: string
          time?: string
          note?: string
          by?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          time?: string
          note?: string
          by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
