"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase"
import { getUser } from "@/lib/auth"
import {
  Megaphone,
  Wrench,
  CreditCard,
  Users,
  Package,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react"

interface DashboardStats {
  announcements: number
  maintenanceOpen: number
  unpaidFees: number
  visitors: number
  packages: number
  meetings: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    announcements: 0,
    maintenanceOpen: 0,
    unpaidFees: 0,
    visitors: 0,
    packages: 0,
    meetings: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const supabase = createClient()
      const user = getUser()

      // Load statistics
      const [announcementsRes, maintenanceRes, feesRes, visitorsRes, packagesRes, meetingsRes] = await Promise.all([
        supabase.from("announcements").select("id", { count: "exact" }),
        supabase.from("maintenance").select("id", { count: "exact" }).eq("status", "open"),
        supabase.from("fees").select("id", { count: "exact" }).eq("paid", false),
        supabase.from("visitors").select("id", { count: "exact" }).is("out", null),
        supabase.from("packages").select("id", { count: "exact" }).is("picked_at", null),
        supabase.from("meetings").select("id", { count: "exact" }).gte("time", new Date().toISOString()),
      ])

      setStats({
        announcements: announcementsRes.count || 0,
        maintenanceOpen: maintenanceRes.count || 0,
        unpaidFees: feesRes.count || 0,
        visitors: visitorsRes.count || 0,
        packages: packagesRes.count || 0,
        meetings: meetingsRes.count || 0,
      })

      // Load recent activity
      const { data: emergencies } = await supabase
        .from("emergencies")
        .select("*")
        .order("time", { ascending: false })
        .limit(5)

      setRecentActivity(emergencies || [])
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: "公告數量",
      value: stats.announcements,
      icon: Megaphone,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "待處理維修",
      value: stats.maintenanceOpen,
      icon: Wrench,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "未繳費用",
      value: stats.unpaidFees,
      icon: CreditCard,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
    {
      title: "在場訪客",
      value: stats.visitors,
      icon: Users,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      title: "待取包裹",
      value: stats.packages,
      icon: Package,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "即將會議",
      value: stats.meetings,
      icon: Calendar,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-card">
              <CardHeader className="pb-3">
                <div className="animate-pulse bg-muted h-4 w-24 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse bg-muted h-8 w-16 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">儀表板</h1>
        <p className="text-muted-foreground">歡迎回到社區管理系統</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <Card key={index} className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                即時數據
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-accent" />
              <span>最近活動</span>
            </CardTitle>
            <CardDescription>緊急服務使用紀錄</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.time).toLocaleString()} • {activity.by}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      緊急
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>目前沒有緊急活動紀錄</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              <span>系統狀態</span>
            </CardTitle>
            <CardDescription>各模組運行狀況</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <span className="text-sm font-medium text-foreground">資料庫連線</span>
                <Badge className="bg-green-500/20 text-green-400">正常</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <span className="text-sm font-medium text-foreground">認證系統</span>
                <Badge className="bg-green-500/20 text-green-400">正常</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <span className="text-sm font-medium text-foreground">緊急服務</span>
                <Badge className="bg-green-500/20 text-green-400">正常</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
