"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { login, register, resetPassword, isLoggedIn, ROLE_LABELS } from "@/lib/auth"
import { Building2, AlertCircle } from "lucide-react"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"login" | "register">("login")
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/"

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn()) {
      router.push(next)
    }
  }, [next, router])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const user = await login(email, password)

      // Redirect based on role
      if (user.role === "committee") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "登入失敗")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string
    const phone = formData.get("phone") as string
    const room = formData.get("room") as string
    const role = formData.get("role") as "resident" | "committee" | "vendor"

    if (!email || !password || !name || !phone || !room || !role) {
      setError("請填寫所有必填欄位")
      setIsLoading(false)
      return
    }

    try {
      await register({ email, password, name, phone, room, role })
      alert("註冊成功！請使用您的帳號密碼登入。")
      setMode("login")
    } catch (err) {
      setError(err instanceof Error ? err.message : "註冊失敗")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    const email = prompt("請輸入要重設密碼的 Email")
    if (!email) return

    const newPassword = prompt("請輸入新密碼")
    if (!newPassword) return

    try {
      await resetPassword(email, newPassword)
      alert("密碼已重設成功，請使用新密碼登入")
    } catch (err) {
      alert(err instanceof Error ? err.message : "密碼重設失敗")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-accent" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">社區管理系統</CardTitle>
          <CardDescription className="text-muted-foreground">
            {mode === "login" ? "登入您的帳號" : "建立新帳號"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">登入</TabsTrigger>
              <TabsTrigger value="register">註冊</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="請輸入您的 Email"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密碼</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="請輸入密碼"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={isLoading}
                >
                  {isLoading ? "登入中..." : "登入"}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-accent hover:text-accent/80"
                  onClick={handleForgotPassword}
                >
                  忘記密碼？
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email *</Label>
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    placeholder="請輸入 Email"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">密碼 *</Label>
                  <Input
                    id="reg-password"
                    name="password"
                    type="password"
                    placeholder="請輸入密碼"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">姓名 *</Label>
                  <Input id="name" name="name" placeholder="請輸入姓名" required className="bg-input border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">手機 *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="請輸入手機號碼"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room">住戶房號 *</Label>
                  <Input id="room" name="room" placeholder="例：A101" required className="bg-input border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">身分 *</Label>
                  <Select name="role" required>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="請選擇身分" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resident">{ROLE_LABELS.resident}</SelectItem>
                      <SelectItem value="committee">{ROLE_LABELS.committee}</SelectItem>
                      <SelectItem value="vendor">{ROLE_LABELS.vendor}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  disabled={isLoading}
                >
                  {isLoading ? "註冊中..." : "註冊"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
