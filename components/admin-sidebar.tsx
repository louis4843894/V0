"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Megaphone,
  Wrench,
  CreditCard,
  Users,
  Package,
  Calendar,
  AlertTriangle,
  Settings,
  BarChart3,
  ChevronLeft,
  Menu,
} from "lucide-react"

const sidebarItems = [
  {
    title: "總覽",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "公告管理",
    href: "/admin/announcements",
    icon: Megaphone,
  },
  {
    title: "維修管理",
    href: "/admin/maintenance",
    icon: Wrench,
  },
  {
    title: "帳務管理",
    href: "/admin/finance",
    icon: CreditCard,
  },
  {
    title: "住戶管理",
    href: "/admin/residents",
    icon: Users,
  },
  {
    title: "訪客管理",
    href: "/admin/visitors",
    icon: Package,
  },
  {
    title: "會議管理",
    href: "/admin/meetings",
    icon: Calendar,
  },
  {
    title: "緊急紀錄",
    href: "/admin/emergency",
    icon: AlertTriangle,
  },
  {
    title: "統計報表",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    title: "系統設定",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
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
