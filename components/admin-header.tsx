"use client"

import { UserMenu } from "@/components/user-menu"
import { Building2, Shield } from "lucide-react"

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-accent" />
          <h1 className="text-xl font-bold gradient-text">管理後台</h1>
          <Shield className="h-5 w-5 text-accent" />
        </div>

        <div className="flex items-center space-x-4">
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
