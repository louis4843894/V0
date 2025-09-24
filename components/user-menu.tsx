"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getUser, logout, ROLE_LABELS, type User } from "@/lib/auth"
import { UserIcon, LogOut, Settings, Shield } from "lucide-react"

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)

    const handleAuthChange = (event: CustomEvent) => {
      setUser(event.detail)
    }

    window.addEventListener("auth-change", handleAuthChange as EventListener)
    return () => window.removeEventListener("auth-change", handleAuthChange as EventListener)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleAdminAccess = () => {
    if (user?.role === "committee") {
      router.push("/admin")
    }
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        onClick={() => router.push("/auth")}
        className="border-border hover:bg-accent hover:text-accent-foreground"
      >
        <UserIcon className="h-4 w-4 mr-2" />
        登入
      </Button>
    )
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-accent text-accent-foreground">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-card border-border" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <p className="text-xs leading-none text-accent">{ROLE_LABELS[user.role]}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        {user.role === "committee" && (
          <DropdownMenuItem onClick={handleAdminAccess} className="hover:bg-accent hover:text-accent-foreground">
            <Shield className="mr-2 h-4 w-4" />
            <span>管理後台</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground">
          <Settings className="mr-2 h-4 w-4" />
          <span>設定</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem onClick={handleLogout} className="hover:bg-destructive hover:text-destructive-foreground">
          <LogOut className="mr-2 h-4 w-4" />
          <span>登出</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
