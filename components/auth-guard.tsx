"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser, hasRole } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: string[]
  redirectTo?: string
}

export function AuthGuard({ children, requiredRoles = [], redirectTo = "/auth" }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const user = getUser()

    if (!user) {
      router.push(`${redirectTo}?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (requiredRoles.length > 0 && !hasRole(...requiredRoles)) {
      router.push("/unauthorized")
      return
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [requiredRoles, redirectTo, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <span className="text-muted-foreground">載入中...</span>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
