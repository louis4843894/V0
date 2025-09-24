"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
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
import { Megaphone, Plus, Edit, Trash2, Search, Eye } from "lucide-react"

interface Announcement {
  id: string
  title: string
  content: string
  time: string
  author: string
  options: string[]
  votes: Record<string, number>
  voters: Record<string, string>
  reads: Record<string, boolean>
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("announcements").select("*").order("time", { ascending: false })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error("Failed to load announcements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const optionsText = formData.get("options") as string
    const options = optionsText
      .split(",")
      .map((opt) => opt.trim())
      .filter(Boolean)

    if (!title || !content) return

    try {
      const supabase = createClient()
      const user = getUser()

      if (editingAnnouncement) {
        // Update existing announcement
        const { error } = await supabase
          .from("announcements")
          .update({
            title,
            content,
            options: options.length > 0 ? options : ["同意", "反對"],
          })
          .eq("id", editingAnnouncement.id)

        if (error) throw error
      } else {
        // Create new announcement
        const { error } = await supabase.from("announcements").insert({
          title,
          content,
          author: user?.name || "管理員",
          options: options.length > 0 ? options : ["同意", "反對"],
          votes: Object.fromEntries((options.length > 0 ? options : ["同意", "反對"]).map((opt) => [opt, 0])),
          voters: {},
          reads: {},
        })

        if (error) throw error
      }

      setIsDialogOpen(false)
      setEditingAnnouncement(null)
      loadAnnouncements()
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error("Failed to save announcement:", error)
      alert("儲存失敗，請稍後再試")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這則公告嗎？")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("announcements").delete().eq("id", id)

      if (error) throw error
      loadAnnouncements()
    } catch (error) {
      console.error("Failed to delete announcement:", error)
      alert("刪除失敗，請稍後再試")
    }
  }

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTotalVotes = (votes: Record<string, number>) => {
    return Object.values(votes).reduce((sum, count) => sum + count, 0)
  }

  const getTotalReads = (reads: Record<string, boolean>) => {
    return Object.values(reads).filter(Boolean).length
  }

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
          <h1 className="text-3xl font-bold text-foreground mb-2">公告管理</h1>
          <p className="text-muted-foreground">管理社區公告與投票</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              新增公告
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-foreground">{editingAnnouncement ? "編輯公告" : "新增公告"}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {editingAnnouncement ? "修改公告內容" : "建立新的社區公告"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">
                    標題 *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingAnnouncement?.title}
                    placeholder="請輸入公告標題"
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-foreground">
                    內容 *
                  </Label>
                  <Textarea
                    id="content"
                    name="content"
                    defaultValue={editingAnnouncement?.content}
                    placeholder="請輸入公告內容"
                    rows={4}
                    required
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="options" className="text-foreground">
                    投票選項
                  </Label>
                  <Input
                    id="options"
                    name="options"
                    defaultValue={editingAnnouncement?.options?.join(", ")}
                    placeholder="例：同意, 反對, 棄權 (用逗號分隔，留空則使用預設選項)"
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground">留空將使用預設選項：同意, 反對</p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setEditingAnnouncement(null)
                  }}
                  className="border-border hover:bg-accent hover:text-accent-foreground"
                >
                  取消
                </Button>
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {editingAnnouncement ? "更新" : "建立"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜尋公告..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-input border-border"
        />
      </div>

      {/* Announcements Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Megaphone className="h-5 w-5 text-accent" />
            <span>公告列表</span>
          </CardTitle>
          <CardDescription>共 {filteredAnnouncements.length} 則公告</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAnnouncements.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">標題</TableHead>
                    <TableHead className="text-muted-foreground">作者</TableHead>
                    <TableHead className="text-muted-foreground">發布時間</TableHead>
                    <TableHead className="text-muted-foreground">投票數</TableHead>
                    <TableHead className="text-muted-foreground">閱讀數</TableHead>
                    <TableHead className="text-muted-foreground">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnnouncements.map((announcement) => (
                    <TableRow key={announcement.id} className="border-border">
                      <TableCell className="font-medium text-foreground">
                        <div>
                          <div className="font-semibold">{announcement.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">{announcement.content}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{announcement.author}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(announcement.time).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-accent/10 text-accent">
                          {getTotalVotes(announcement.votes)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-border">
                          <Eye className="h-3 w-3 mr-1" />
                          {getTotalReads(announcement.reads)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingAnnouncement(announcement)
                              setIsDialogOpen(true)
                            }}
                            className="hover:bg-accent hover:text-accent-foreground"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(announcement.id)}
                            className="hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">{searchTerm ? "沒有找到符合條件的公告" : "尚未建立任何公告"}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
