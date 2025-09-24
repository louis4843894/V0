"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserMenu } from "@/components/user-menu"
import { AiChat } from "@/components/ai-chat"
import { getUser, isLoggedIn } from "@/lib/auth"
import { createClient } from "@/lib/supabase"
import {
  Building2,
  Megaphone,
  Wrench,
  CreditCard,
  Users,
  Package,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  time: string
  author: string
}

export default function HomePage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadAnnouncements()
  }, [])

  // Auto-play carousel
  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [announcements.length])

  const loadAnnouncements = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("time", { ascending: false })
        .limit(5)

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error("Failed to load announcements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProtectedNavigation = (path: string) => {
    if (!isLoggedIn()) {
      router.push(`/auth?next=${encodeURIComponent(path)}`)
    } else {
      router.push(path)
    }
  }

  const handleEmergencyAction = async (type: string) => {
    if (!isLoggedIn()) {
      router.push(`/auth?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    const user = getUser()
    if (user?.role === "vendor") {
      alert("此功能僅限住戶與管委會使用")
      return
    }

    try {
      const supabase = createClient()
      await supabase.from("emergencies").insert({
        type,
        note: `${type}緊急呼叫`,
        by: user?.email || "未知使用者",
      })

      // Simulate TTS and phone call
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(`緊急狀況，已呼叫${type}`)
        utterance.lang = "zh-TW"
        speechSynthesis.speak(utterance)
      }

      alert(`已建立${type}緊急紀錄並模擬撥號`)
    } catch (error) {
      console.error("Emergency action failed:", error)
      alert("緊急呼叫失敗，請直接撥打緊急電話")
    }
  }

  const nextAnnouncement = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length)
  }

  const prevAnnouncement = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)
  }

  const moduleCards = [
    {
      title: "公告 / 投票",
      description: "瀏覽社區公告與參與投票",
      icon: Megaphone,
      path: "/dashboard/announcements",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      title: "維修 / 客服",
      description: "設備維護與客服單管理",
      icon: Wrench,
      path: "/dashboard/maintenance",
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    },
    {
      title: "帳務 / 收費",
      description: "管理費與收支查詢",
      icon: CreditCard,
      path: "/dashboard/finance",
      color: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    {
      title: "住戶 / 人員",
      description: "住戶與社區人員資訊",
      icon: Users,
      path: "/dashboard/residents",
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    {
      title: "訪客 / 包裹",
      description: "訪客登記與包裹管理",
      icon: Package,
      path: "/dashboard/visitors",
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
    {
      title: "會議 / 活動",
      description: "議程與社區活動",
      icon: Calendar,
      path: "/dashboard/meetings",
      color: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    },
  ]

  const emergencyButtons = [
    { label: "救護車 119", action: () => handleEmergencyAction("救護車 119") },
    { label: "報警 110", action: () => handleEmergencyAction("報警 110") },
    { label: "AED", action: () => handleEmergencyAction("AED") },
    { label: "跌倒偵測", action: () => handleEmergencyAction("跌倒偵測") },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold text-foreground">選單</h2>
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="space-y-2">
              {moduleCards.map((card) => (
                <Button
                  key={card.path}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    handleProtectedNavigation(card.path)
                    setMobileMenuOpen(false)
                  }}
                >
                  <card.icon className="h-4 w-4 mr-3" />
                  {card.title}
                </Button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-accent" />
              <h1 className="text-xl font-bold gradient-text">社區管理系統</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Emergency Buttons - Desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              {emergencyButtons.map((btn, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={btn.action}
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10 bg-transparent"
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {btn.label}
                </Button>
              ))}
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Announcements Carousel */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">社區公告</h2>
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              {announcements.length} 則公告
            </Badge>
          </div>

          <div className="relative">
            <Card className="glass-card overflow-hidden">
              <div className="relative h-64 md:h-48">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-pulse text-muted-foreground">載入公告中...</div>
                  </div>
                ) : announcements.length > 0 ? (
                  <div className="h-full flex items-center justify-center p-8 text-center">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-4">
                        {announcements[currentIndex]?.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{announcements[currentIndex]?.content}</p>
                      <p className="text-sm text-accent mt-4">
                        {announcements[currentIndex]?.author} •{" "}
                        {new Date(announcements[currentIndex]?.time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>目前沒有公告</p>
                    </div>
                  </div>
                )}

                {announcements.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={prevAnnouncement}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={nextAnnouncement}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {announcements.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {announcements.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? "bg-accent" : "bg-muted"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Module Cards */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">功能模組</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moduleCards.map((card) => (
              <Card
                key={card.path}
                className={`glass-card hover-lift cursor-pointer transition-all duration-200 ${card.color}`}
                onClick={() => handleProtectedNavigation(card.path)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <card.icon className="h-6 w-6" />
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{card.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Emergency Section - Mobile */}
        <section className="lg:hidden">
          <h2 className="text-2xl font-bold text-foreground mb-6">緊急服務</h2>
          <div className="grid grid-cols-2 gap-4">
            {emergencyButtons.map((btn, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={btn.action}
                className="h-16 border-red-500/20 text-red-400 hover:bg-red-500/10 bg-transparent"
              >
                <div className="text-center">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-1" />
                  <div className="text-sm">{btn.label}</div>
                </div>
              </Button>
            ))}
          </div>
        </section>

        {/* AI Chat Component */}
        <section className="mb-12">
          <AiChat />
        </section>
      </main>
    </div>
  )
}
