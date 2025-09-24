"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase"
import { getUser } from "@/lib/auth"
import { Megaphone, Search, ThumbsUp, ThumbsDown, Eye } from "lucide-react"

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

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

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

  const handleVote = async (announcementId: string, option: string) => {
    const user = getUser()
    if (!user) return

    try {
      const supabase = createClient()
      const announcement = announcements.find((a) => a.id === announcementId)
      if (!announcement) return

      const currentVote = announcement.voters[user.email] || null
      const newVotes = { ...announcement.votes }
      const newVoters = { ...announcement.voters }

      // Remove previous vote if exists
      if (currentVote && newVotes[currentVote] > 0) {
        newVotes[currentVote]--
      }

      // Add new vote
      if (currentVote !== option) {
        newVotes[option] = (newVotes[option] || 0) + 1
        newVoters[user.email] = option
      } else {
        // Remove vote if clicking same option
        delete newVoters[user.email]
      }

      const { error } = await supabase
        .from("announcements")
        .update({ votes: newVotes, voters: newVoters })
        .eq("id", announcementId)

      if (error) throw error

      // Update local state
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === announcementId ? { ...a, votes: newVotes, voters: newVoters } : a)),
      )
    } catch (error) {
      console.error("Failed to vote:", error)
    }
  }

  const markAsRead = async (announcementId: string) => {
    const user = getUser()
    if (!user) return

    try {
      const supabase = createClient()
      const announcement = announcements.find((a) => a.id === announcementId)
      if (!announcement) return

      const newReads = { ...announcement.reads, [user.email]: true }

      const { error } = await supabase.from("announcements").update({ reads: newReads }).eq("id", announcementId)

      if (error) throw error

      setAnnouncements((prev) => prev.map((a) => (a.id === announcementId ? { ...a, reads: newReads } : a)))
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const user = getUser()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-4"></div>
          <div className="h-10 bg-muted rounded w-full mb-6"></div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">公告 / 投票</h1>
          <p className="text-muted-foreground">瀏覽社區公告並參與投票</p>
        </div>
        <Badge variant="secondary" className="bg-accent/10 text-accent">
          {filteredAnnouncements.length} 則公告
        </Badge>
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

      {/* Announcements */}
      <div className="space-y-6">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement) => {
            const userVote = user ? announcement.voters[user.email] : null
            const hasRead = user ? announcement.reads[user.email] : false

            return (
              <Card key={announcement.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2">
                        <Megaphone className="h-5 w-5 text-accent" />
                        <span>{announcement.title}</span>
                        {!hasRead && (
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                            新
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {announcement.author} • {new Date(announcement.time).toLocaleString()}
                      </CardDescription>
                    </div>
                    {!hasRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(announcement.id)}
                        className="border-border hover:bg-accent hover:text-accent-foreground"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        標記已讀
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed mb-6">{announcement.content}</p>

                  {/* Voting */}
                  {announcement.options && announcement.options.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">投票選項：</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {announcement.options.map((option) => {
                          const voteCount = announcement.votes[option] || 0
                          const isSelected = userVote === option
                          const totalVotes = Object.values(announcement.votes).reduce((sum, count) => sum + count, 0)
                          const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0

                          return (
                            <Button
                              key={option}
                              variant={isSelected ? "default" : "outline"}
                              className={`justify-between h-auto p-4 ${
                                isSelected
                                  ? "bg-accent text-accent-foreground"
                                  : "border-border hover:bg-accent hover:text-accent-foreground"
                              }`}
                              onClick={() => handleVote(announcement.id, option)}
                            >
                              <div className="flex items-center space-x-2">
                                {option === "同意" ? (
                                  <ThumbsUp className="h-4 w-4" />
                                ) : option === "反對" ? (
                                  <ThumbsDown className="h-4 w-4" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full bg-current opacity-50" />
                                )}
                                <span>{option}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{voteCount}</div>
                                <div className="text-xs opacity-70">{percentage}%</div>
                              </div>
                            </Button>
                          )
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        總投票數：{Object.values(announcement.votes).reduce((sum, count) => sum + count, 0)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Megaphone className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground text-center">
                {searchTerm ? "沒有找到符合條件的公告" : "目前沒有公告"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
