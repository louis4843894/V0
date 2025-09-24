"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase"
import { getUser } from "@/lib/auth"
import { Wrench, Plus, Edit, Trash2, Search, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface MaintenanceItem {
  id: string
  equipment: string
  item: string
  time: string
  handler: string
  cost: number
  note: string
  status: "open" | "progress" | "closed"
  assignee: string
  logs: Array<{ time: string; text: string; by: string }>
}

const statusConfig = {
  open: { label: "待處理", color: "bg-red-500/20 text-red-400", icon: AlertCircle },
  progress: { label: "處理中", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  closed: { label: "已完成", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
}

export default function AdminMaintenancePage() {
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MaintenanceItem | null>(null)

  useEffect(() => {
    loadMaintenanceItems()
  }, [])

  const loadMaintenanceItems = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("maintenance").select("*").order("time", { ascending: false })

      if (error) throw error
      setMaintenanceItems(data || [])
    } catch (error) {
      console.error("Failed to load maintenance items:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const equipment = formData.get("equipment") as string
    const item = formData.get("item") as string
    const handler = formData.get("handler") as string
    const cost = Number.parseFloat(formData.get("cost") as string) || 0
    const note = formData.get("note") as string
    const status = formData.get("status") as "open" | "progress" | "closed"
    const assignee = formData.get("assignee") as string

    if (!equipment || !item) return

    try {
      const supabase = createClient()
      const user = getUser()

      if (editingItem) {
        // Update existing item
        const newLogs = [...(editingItem.logs || [])]
        if (editingItem.status !== status) {
          newLogs.push({
            time: new Date().toISOString(),
            text: `狀態更新：${statusConfig[status].label}`,
            by: user?.email || "管理員",
          })
        }

        const { error } = await supabase
          .from("maintenance")
          .update({
            equipment,
            item,
            handler,
            cost,
            note,
            status,
            assignee,
            logs: newLogs,
          })
          .eq("id", editingItem.id)

        if (error) throw error
      } else {
        // Create new item
        const { error } = await supabase.from("maintenance").insert({
          equipment,
          item,
          handler,
          cost,
          note,
          status: status || "open",
          assignee,
          logs: [
            {
              time: new Date().toISOString(),
              text: "建立工單",
              by: user?.email || "管理員",
            },
          ],
        })

        if (error) throw error
      }

      setIsDialogOpen(false)
      setEditingItem(null)
      loadMaintenanceItems()
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error("Failed to save maintenance item:", error)
      alert("儲存失敗，請稍後再試")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這個維修項目嗎？")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("maintenance").delete().eq("id", id)

      if (error) throw error
      loadMaintenanceItems()
    } catch (error) {
      console.error("Failed to delete maintenance item:", error)
      alert("刪除失敗，請稍後再試")
    }
  }

  const filteredItems = maintenanceItems.filter((item) => {
    const matchesSearch =
      item.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.handler.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-4"></div>
          <div className="h-10 bg-muted rounded w-full mb-6"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">維修管理</h1>
          <p className="text-muted-foreground">管理設備維護與客服工單</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              新增工單
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-foreground">{editingItem ? "編輯工單" : "新增工單"}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {editingItem ? "修改維修工單資訊" : "建立新的維修工單"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipment" className="text-foreground">
                      設備 *
                    </Label>
                    <Input
                      id="equipment"
                      name="equipment"
                      defaultValue={editingItem?.equipment}
                      placeholder="例：電梯、停車場"
                      required
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="handler" className="text-foreground">
                      承辦人
                    </Label>
                    <Input
                      id="handler"
                      name="handler"
                      defaultValue={editingItem?.handler}
                      placeholder="承辦人姓名"
                      className="bg-input border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item" className="text-foreground">
                    維修項目 *
                  </Label>
                  <Input
                    id="item"
                    name="item"
                    defaultValue={editingItem?.item}
                    placeholder="詳細描述維修項目"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost" className="text-foreground">
                      費用
                    </Label>
                    <Input
                      id="cost"
                      name="cost"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={editingItem?.cost}
                      placeholder="0"
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-foreground">
                      狀態
                    </Label>
                    <Select name="status" defaultValue={editingItem?.status || "open"}>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">待處理</SelectItem>
                        <SelectItem value="progress">處理中</SelectItem>
                        <SelectItem value="closed">已完成</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignee" className="text-foreground">
                    指派給
                  </Label>
                  <Input
                    id="assignee"
                    name="assignee"
                    defaultValue={editingItem?.assignee}
                    placeholder="指派的廠商或人員"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note" className="text-foreground">
                    備註
                  </Label>
                  <Textarea
                    id="note"
                    name="note"
                    defaultValue={editingItem?.note}
                    placeholder="額外說明或備註"
                    rows={3}
                    className="bg-input border-border"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setEditingItem(null)
                  }}
                  className="border-border hover:bg-accent hover:text-accent-foreground"
                >
                  取消
                </Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {editingItem ? "更新" : "建立"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋設備、項目或承辦人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-input border-border">
            <SelectValue placeholder="篩選狀態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部狀態</SelectItem>
            <SelectItem value="open">待處理</SelectItem>
            <SelectItem value="progress">處理中</SelectItem>
            <SelectItem value="closed">已完成</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Maintenance Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-accent" />
            <span>維修工單</span>
          </CardTitle>
          <CardDescription>共 {filteredItems.length} 個工單</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredItems.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">設備/項目</TableHead>
                    <TableHead className="text-muted-foreground">承辦人</TableHead>
                    <TableHead className="text-muted-foreground">費用</TableHead>
                    <TableHead className="text-muted-foreground">狀態</TableHead>
                    <TableHead className="text-muted-foreground">指派</TableHead>
                    <TableHead className="text-muted-foreground">建立時間</TableHead>
                    <TableHead className="text-muted-foreground">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const StatusIcon = statusConfig[item.status].icon
                    return (
                      <TableRow key={item.id} className="border-border">
                        <TableCell className="font-medium text-foreground">
                          <div>
                            <div className="font-semibold">{item.equipment}</div>
                            <div className="text-sm text-muted-foreground">{item.item}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">{item.handler || "未指定"}</TableCell>
                        <TableCell className="text-foreground">
                          {item.cost > 0 ? `$${item.cost.toLocaleString()}` : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig[item.status].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[item.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{item.assignee || "未指派"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(item.time).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingItem(item)
                                setIsDialogOpen(true)
                              }}
                              className="hover:bg-accent hover:text-accent-foreground"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" ? "沒有找到符合條件的工單" : "尚未建立任何工單"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
