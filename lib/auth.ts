"use client"

import { createClient } from "./supabase"
import type { Database } from "./supabase"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

const AUTH_KEY = "community_auth_user"

export interface User {
  id: string
  email: string
  name: string
  role: "resident" | "committee" | "vendor"
  phone?: string
  room?: string
}

export const ROLE_LABELS = {
  resident: "住戶",
  committee: "管委會",
  vendor: "廠商",
} as const

// Client-side auth functions
export function getUser(): User | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(AUTH_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function setUser(user: User | null) {
  if (typeof window === "undefined") return

  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(AUTH_KEY)
  }

  // Dispatch event for other components to listen
  window.dispatchEvent(new CustomEvent("auth-change", { detail: user }))
}

export function isLoggedIn(): boolean {
  return getUser() !== null
}

export function getRole(): string {
  return getUser()?.role || "guest"
}

export function hasRole(...roles: string[]): boolean {
  return roles.includes(getRole())
}

export function logout() {
  setUser(null)
}

// Auth API functions
export async function login(email: string, password: string): Promise<User> {
  const supabase = createClient()

  // Find user by email (case insensitive)
  const { data, error } = await supabase.from("profiles").select("*").ilike("email", email).single()

  if (error || !data) {
    throw new Error("帳號或密碼錯誤")
  }

  if (data.password !== password) {
    throw new Error("帳號或密碼錯誤")
  }

  const user: User = {
    id: data.id,
    email: data.email,
    name: data.display_name || data.email,
    role: data.role,
    phone: data.phone || undefined,
    room: data.room || undefined,
  }

  setUser(user)
  return user
}

export async function register(userData: {
  email: string
  password: string
  name: string
  phone: string
  room: string
  role: "resident" | "committee" | "vendor"
}): Promise<void> {
  const supabase = createClient()

  // Check if email already exists
  const { data: existing } = await supabase.from("profiles").select("id").ilike("email", userData.email).single()

  if (existing) {
    throw new Error("這個 Email 已註冊過了")
  }

  // Insert new profile
  const { error } = await supabase.from("profiles").insert({
    email: userData.email,
    password: userData.password,
    display_name: userData.name,
    role: userData.role,
    phone: userData.phone,
    room: userData.room,
  })

  if (error) {
    throw new Error("註冊失敗：" + error.message)
  }
}

export async function resetPassword(email: string, newPassword: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from("profiles").update({ password: newPassword }).ilike("email", email)

  if (error) {
    throw new Error("密碼重設失敗：" + error.message)
  }
}
