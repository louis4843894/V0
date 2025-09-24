"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Wrench,
  CreditCard,
  Package,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
} from "lucide-react"

interface AdminStats {
  totalUsers: number
  totalAnnouncements: number
  openMaintenance: number
  totalRevenue: number
  unpaidFees: number
  activeVisitors: number
  upcomingMeetings: number
  emergencyCount: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAnnouncements: 0,
    openMaintenance: 0,
    totalRevenue: 0,
    unpaidFees: 0,
    activeVisitors: 0,
    upcomingMeetings: 0,
    emergencyCount: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const supabase = createClient()

      // Load comprehensive statistics
      const [
        usersRes,
        announcementsRes,
        maintenanceRes,
        feesRes,
        unpaidFeesRes,
        visitorsRes,
        meetingsRes,
        emergenciesRes,
      ] = await Promise.all([
        supabase.from("residents").select("id", { count: "exact" }),
        supabase.from("announcements").select("id", { count: "exact" }),
        supabase.from("maintenance").select("id", { count: "exact" }).eq("status", "open"),
        supabase.from("fees").select("amount").eq("paid", true),
        supabase.from("fees").select("id", { count: "exact" }).eq("paid", false),
        supabase.from("visitors").select("id", { count: "exact" }).is("out", null),
        supabase.from("meetings").select("id", { count: "exact" }).gte("time", new Date().toISOString()),
        supabase
          .from("emergencies")
          .select("id", { count: "exact" })
          .gte("time", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ])

      const totalRevenue = feesRes.data?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0

      setStats({
        totalUsers: usersRes.count || 0,
        totalAnnouncements: announcementsRes.count || 0,
        openMaintenance: maintenanceRes.count || 0,
        totalRevenue,
        unpaidFees: unpaidFeesRes.count || 0,
        activeVisitors: visitorsRes.count || 0,
        upcomingMeetings: meetingsRes.count || 0,
        emergencyCount: emergenciesRes.count || 0,
      })

      // Load recent activity from multiple sources
      const [recentEmergencies, recentMaintenance] = await Promise.all([
        supabase.from("emergencies").select("*").order("time", { ascending: false }).limit(3),
        supabase.from("maintenance").select("*").order("time", { ascending: false }).limit(2),
      ])

      const combinedActivity = [
        ...(recentEmergencies.data || []).map((item) => ({ ...item, type: "emergency", category: "緊急事件" })),
        ...(recentMaintenance.data || []).map((item) => ({ ...item, type: "maintenance", category: "維修工單" })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

      setRecentActivity(combinedActivity.slice(0, 5))
    } catch (error) {
      console.error("Failed to load admin data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: "總住戶數",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      change: "+2.5%",
      trend: "up",
    },
    {
      title: "公告數量",
      value: stats.totalAnnouncements,
      icon: Megaphone,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      change: "+12%",
      trend: "up",
    },
    {
      title: "待處理維修",
      value: stats.openMaintenance,
      icon: Wrench,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      change: "-8%",
      trend: "down",
    },
    {
      title: "本月收入",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      change: "+15%",
      trend: "up",
    },
    {
      title: "未繳費用",
      value: stats.unpaidFees,
      icon: CreditCard,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      change: "-5%",
      trend: "down",
    },
    {
      title: "在場訪客",
      value: stats.activeVisitors,
      icon: Package,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      change: "+3%",
      trend: "up",
    },
    {
      title: "即將會議",
      value: stats.upcomingMeetings,
      icon: Calendar,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      change: "0%",
      trend: "neutral",
    },
    {
      title: "本月緊急事件",
      value: stats.emergencyCount,
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      change: "-20%",
      trend: "down",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">管理總覽</h1>
          <p className="text-muted-foreground">社區管理系統控制台</p>
        </div>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Activity className="h-4 w-4 mr-2" />
          重新整理
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                {card.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-green-400" />
                ) : card.trend === "down" ? (
                  <TrendingDown className="h-3 w-3 mr-1 text-red-400" />
                ) : (
                  <Activity className="h-3 w-3 mr-1" />
                )}
                <span className={card.trend === "up" ? "text-green-400" : card.trend === "down" ? "text-red-400" : ""}>
                  {card.change}
                </span>
                <span className="ml-1">較上月</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-accent" />
              <span>最近活動</span>
            </CardTitle>
            <CardDescription>系統最新動態</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    {activity.type === "emergency" ? (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    ) : (
                      <Wrench className="h-4 w-4 text-orange-400" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.type === "emergency" ? activity.type : activity.equipment}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.time).toLocaleString()}
                        {activity.by && ` • ${activity.by}`}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.category}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>目前沒有最近活動</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LayoutDashboard className="h-5 w-5 text-accent" />
              <span>快速操作</span>
            </CardTitle>
            <CardDescription>常用管理功能</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col border-border hover:bg-accent hover:text-accent-foreground bg-transparent"
                onClick={() => (window.location.href = "/admin/announcements")}
              >
                <Megaphone className="h-6 w-6 mb-2" />
                <span className="text-sm">發布公告</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col border-border hover:bg-accent hover:text-accent-foreground bg-transparent"
                onClick={() => (window.location.href = "/admin/maintenance")}
              >
                <Wrench className="h-6 w-6 mb-2" />
                <span className="text-sm">維修管理</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col border-border hover:bg-accent hover:text-accent-foreground bg-transparent"
                onClick={() => (window.location.href = "/admin/residents")}
              >
                <Users className="h-6 w-6 mb-2" />
                <span className="text-sm">住戶管理</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col border-border hover:bg-accent hover:text-accent-foreground bg-transparent"
                onClick={() => (window.location.href = "/admin/finance")}
              >
                <CreditCard className="h-6 w-6 mb-2" />
                <span className="text-sm">帳務管理</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
