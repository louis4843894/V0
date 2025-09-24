"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Megaphone,
  Wrench,
  CreditCard,
  Users,
  Package,
  Calendar,
  AlertTriangle,
  Home,
  ChevronLeft,
  Menu,
} from "lucide-react"

const sidebarItems = [
  {
    title: "首頁",
    href: "/",
    icon: Home,
  },
  {
    title: "公告 / 投票",
    href: "/dashboard/announcements",
    icon: Megaphone,
  },
  {
    title: "維修 / 客服",
    href: "/dashboard/maintenance",
    icon: Wrench,
  },
  {
    title: "帳務 / 收費",
    href: "/dashboard/finance",
    icon: CreditCard,
  },
  {
    title: "住戶 / 人員",
    href: "/dashboard/residents",
    icon: Users,
  },
  {
    title: "訪客 / 包裹",
    href: "/dashboard/visitors",
    icon: Package,
  },
  {
    title: "會議 / 活動",
    href: "/dashboard/meetings",
    icon: Calendar,
  },
  {
    title: "緊急紀錄",
    href: "/dashboard/emergency",
    icon: AlertTriangle,
  },
]

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div
      className={cn(
        "sticky top-16 h-[calc(100vh-4rem)] bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="w-full justify-start">
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4 mr-2" />}
            {!collapsed && "收合選單"}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn("w-full justify-start", collapsed && "px-2")}
              onClick={() => router.push(item.href)}
            >
              <item.icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
              {!collapsed && item.title}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  )
}
