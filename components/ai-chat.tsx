"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUser, isLoggedIn } from "@/lib/auth"
import { createClient } from "@/lib/supabase"
import {
  MessageCircle,
  Send,
  X,
  Minimize2,
  Maximize2,
  Megaphone,
  Wrench,
  CreditCard,
  Users,
  Package,
  Calendar,
  AlertTriangle,
  Settings,
  Bot,
  User,
} from "lucide-react"

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

interface QuickAction {
  title: string
  description: string
  action: () => void
  icon: React.ComponentType<{ className?: string }>
  category: string
}

export function AiChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("common")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      addBotMessage(
        "您好！我是社區管理系統的 AI 客服助手。我可以幫您快速導航到各個功能模組，或回答關於系統使用的問題。",
      )
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const addMessage = (content: string, isBot: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isBot,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const addBotMessage = (content: string) => addMessage(content, true)
  const addUserMessage = (content: string) => addMessage(content, false)

  const handleQuickAction = (action: QuickAction) => {
    addUserMessage(`[點選] ${action.title}`)

    if (!isLoggedIn()) {
      addBotMessage("請先登入後再使用此功能。我將為您導向登入頁面...")
      setTimeout(() => {
        window.location.href = `/auth?next=${encodeURIComponent(window.location.pathname)}`
      }, 1000)
      return
    }

    action.action()
  }

  const getQuickActions = (): QuickAction[] => {
    const user = getUser()
    const role = user?.role || "guest"

    const commonActions: QuickAction[] = [
      {
        title: "查看公告",
        description: "瀏覽最新社區公告",
        action: () => {
          addBotMessage("正在為您導向公告頁面...")
          setTimeout(() => (window.location.href = "/dashboard/announcements"), 500)
        },
        icon: Megaphone,
        category: "common",
      },
      {
        title: "維修申請",
        description: "查看維修狀況或申請報修",
        action: () => {
          addBotMessage("正在為您導向維修頁面...")
          setTimeout(() => (window.location.href = "/dashboard/maintenance"), 500)
        },
        icon: Wrench,
        category: "common",
      },
      {
        title: "帳務查詢",
        description: "查看繳費狀況",
        action: () => {
          addBotMessage("正在為您導向帳務頁面...")
          setTimeout(() => (window.location.href = "/dashboard/finance"), 500)
        },
        icon: CreditCard,
        category: "common",
      },
      {
        title: "住戶資訊",
        description: "查看住戶名冊",
        action: () => {
          addBotMessage("正在為您導向住戶頁面...")
          setTimeout(() => (window.location.href = "/dashboard/residents"), 500)
        },
        icon: Users,
        category: "common",
      },
      {
        title: "訪客包裹",
        description: "管理訪客與包裹",
        action: () => {
          addBotMessage("正在為您導向訪客包裹頁面...")
          setTimeout(() => (window.location.href = "/dashboard/visitors"), 500)
        },
        icon: Package,
        category: "common",
      },
      {
        title: "會議活動",
        description: "查看會議與活動安排",
        action: () => {
          addBotMessage("正在為您導向會議活動頁面...")
          setTimeout(() => (window.location.href = "/dashboard/meetings"), 500)
        },
        icon: Calendar,
        category: "common",
      },
    ]

    const residentActions: QuickAction[] = [
      {
        title: "申請報修",
        description: "快速提交維修申請",
        action: async () => {
          const equipment = prompt("請輸入需要維修的設備：")
          if (!equipment) return

          const item = prompt("請描述維修項目：")
          if (!item) return

          try {
            const supabase = createClient()
            await supabase.from("maintenance").insert({
              equipment,
              item,
              handler: "",
              cost: 0,
              note: "住戶透過 AI 客服申請報修",
              status: "open",
              assignee: "",
              logs: [
                {
                  time: new Date().toISOString(),
                  text: "住戶申請報修",
                  by: user?.email || "住戶",
                },
              ],
            })

            addBotMessage("報修申請已成功提交！您可以到維修頁面查看處理進度。")
          } catch (error) {
            addBotMessage("報修申請提交失敗，請稍後再試或直接聯絡管委會。")
          }
        },
        icon: Wrench,
        category: "resident",
      },
      {
        title: "編輯個人資料",
        description: "更新您的聯絡資訊",
        action: async () => {
          if (!user?.email) {
            addBotMessage("需要登入帳號才能編輯個人資料。")
            return
          }

          try {
            const supabase = createClient()
            const { data: residents } = await supabase.from("residents").select("*").ilike("email", user.email).single()

            if (!residents) {
              addBotMessage("找不到您的住戶資料，請聯絡管委會建立。")
              return
            }

            const name = prompt("姓名：", residents.name || "")
            if (name === null) return

            const phone = prompt("電話：", residents.phone || "")
            if (phone === null) return

            await supabase.from("residents").update({ name, phone }).eq("id", residents.id)

            addBotMessage("個人資料已更新成功！")
          } catch (error) {
            addBotMessage("更新失敗，請稍後再試。")
          }
        },
        icon: Settings,
        category: "resident",
      },
    ]

    const emergencyActions: QuickAction[] = [
      {
        title: "救護車 119",
        description: "緊急醫療救護",
        action: async () => {
          if (user?.role === "vendor") {
            addBotMessage("此功能僅限住戶與管委會使用。")
            return
          }

          try {
            const supabase = createClient()
            await supabase.from("emergencies").insert({
              type: "救護車 119",
              note: "緊急醫療救護呼叫",
              by: user?.email || "未知使用者",
            })

            // Simulate TTS
            if ("speechSynthesis" in window) {
              const utterance = new SpeechSynthesisUtterance("緊急狀況，已呼叫救護車")
              utterance.lang = "zh-TW"
              speechSynthesis.speak(utterance)
            }

            addBotMessage("已建立救護車緊急紀錄並模擬撥號 119。請確保有人在現場協助。")
          } catch (error) {
            addBotMessage("緊急呼叫失敗，請直接撥打 119。")
          }
        },
        icon: AlertTriangle,
        category: "emergency",
      },
      {
        title: "報警 110",
        description: "緊急報警服務",
        action: async () => {
          if (user?.role === "vendor") {
            addBotMessage("此功能僅限住戶與管委會使用。")
            return
          }

          try {
            const supabase = createClient()
            await supabase.from("emergencies").insert({
              type: "報警 110",
              note: "緊急報警呼叫",
              by: user?.email || "未知使用者",
            })

            if ("speechSynthesis" in window) {
              const utterance = new SpeechSynthesisUtterance("緊急狀況，已報警")
              utterance.lang = "zh-TW"
              speechSynthesis.speak(utterance)
            }

            addBotMessage("已建立報警緊急紀錄並模擬撥號 110。請保持冷靜並等待警方到達。")
          } catch (error) {
            addBotMessage("緊急呼叫失敗，請直接撥打 110。")
          }
        },
        icon: AlertTriangle,
        category: "emergency",
      },
      {
        title: "AED 設備",
        description: "請求 AED 設備支援",
        action: async () => {
          if (user?.role === "vendor") {
            addBotMessage("此功能僅限住戶與管委會使用。")
            return
          }

          try {
            const supabase = createClient()
            await supabase.from("emergencies").insert({
              type: "AED",
              note: "請求 AED 設備支援",
              by: user?.email || "未知使用者",
            })

            if ("speechSynthesis" in window) {
              const utterance = new SpeechSynthesisUtterance("請警衛立即攜帶自動體外電擊去顫器前往指定樓層")
              utterance.lang = "zh-TW"
              speechSynthesis.speak(utterance)
            }

            addBotMessage("已通知警衛攜帶 AED 設備前往現場。")
          } catch (error) {
            addBotMessage("AED 請求失敗，請直接聯絡警衛室。")
          }
        },
        icon: AlertTriangle,
        category: "emergency",
      },
    ]

    const adminActions: QuickAction[] =
      role === "committee"
        ? [
            {
              title: "管理後台",
              description: "進入管理控制台",
              action: () => {
                addBotMessage("正在為您導向管理後台...")
                setTimeout(() => (window.location.href = "/admin"), 500)
              },
              icon: Settings,
              category: "admin",
            },
          ]
        : []

    return [...commonActions, ...residentActions, ...emergencyActions, ...adminActions]
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue("")
    addUserMessage(userMessage)
    setIsLoading(true)

    // Simple rule-based responses
    setTimeout(() => {
      const response = generateResponse(userMessage)
      addBotMessage(response)
      setIsLoading(false)
    }, 500)
  }

  const generateResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("登入") || lowerMessage.includes("login")) {
      return "您可以點擊右上角的登入按鈕進行登入。登入後即可使用所有功能模組。"
    }

    if (lowerMessage.includes("公告") || lowerMessage.includes("投票")) {
      return "公告功能可以讓您查看最新的社區公告並參與投票。您可以使用上方的「查看公告」快捷按鈕直接前往。"
    }

    if (lowerMessage.includes("維修") || lowerMessage.includes("報修")) {
      return "維修功能讓您可以查看維修狀況或申請報修。住戶可以直接使用「申請報修」快捷功能提交維修申請。"
    }

    if (lowerMessage.includes("繳費") || lowerMessage.includes("帳務") || lowerMessage.includes("管理費")) {
      return "帳務功能可以讓您查看繳費狀況和管理費明細。點擊「帳務查詢」即可前往查看。"
    }

    if (lowerMessage.includes("住戶") || lowerMessage.includes("名冊")) {
      return "住戶功能提供社區住戶名冊查詢。您也可以使用「編輯個人資料」來更新您的聯絡資訊。"
    }

    if (lowerMessage.includes("訪客") || lowerMessage.includes("包裹")) {
      return "訪客包裹功能可以管理訪客登記和包裹收發。點擊「訪客包裹」前往查看。"
    }

    if (lowerMessage.includes("會議") || lowerMessage.includes("活動")) {
      return "會議活動功能讓您查看社區會議安排和活動資訊。使用「會議活動」快捷按鈕前往。"
    }

    if (lowerMessage.includes("緊急") || lowerMessage.includes("119") || lowerMessage.includes("110")) {
      return "緊急服務提供快速的緊急呼叫功能。您可以使用緊急分頁中的按鈕進行緊急呼叫，系統會自動建立紀錄。"
    }

    if (lowerMessage.includes("管理") || lowerMessage.includes("後台")) {
      const user = getUser()
      if (user?.role === "committee") {
        return "您可以使用「管理後台」功能進入管理控制台，進行公告、維修、住戶等各項管理作業。"
      } else {
        return "管理後台僅限管委會成員使用。如需管理權限，請聯絡現任管委會。"
      }
    }

    if (lowerMessage.includes("幫助") || lowerMessage.includes("說明") || lowerMessage.includes("怎麼用")) {
      return "您可以使用上方的快捷功能按鈕快速前往各個模組，或直接詢問我關於系統功能的問題。我會盡力為您解答！"
    }

    // Default response
    return "我了解您的問題。您可以使用上方的快捷功能按鈕前往相關頁面，或者告訴我您想了解哪個功能的詳細資訊。"
  }

  const quickActions = getQuickActions()
  const actionsByCategory = {
    common: quickActions.filter((action) => action.category === "common"),
    resident: quickActions.filter((action) => action.category === "resident"),
    emergency: quickActions.filter((action) => action.category === "emergency"),
    admin: quickActions.filter((action) => action.category === "admin"),
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 z-50 glass-card transition-all duration-300 ${
        isMinimized ? "h-16 w-80" : "h-[600px] w-96"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-accent" />
            <CardTitle className="text-lg">AI 客服</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} className="h-8 w-8 p-0">
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {!isMinimized && (
          <CardDescription className="text-muted-foreground">社區功能快捷導航與問題解答</CardDescription>
        )}
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-[calc(100%-80px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="common" className="text-xs">
                常用
              </TabsTrigger>
              <TabsTrigger value="resident" className="text-xs">
                住戶
              </TabsTrigger>
              <TabsTrigger value="emergency" className="text-xs">
                緊急
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 flex flex-col min-h-0">
              <TabsContent value="common" className="flex-1 mt-0">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {actionsByCategory.common.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action)}
                      className="h-auto p-2 flex flex-col items-center text-xs border-border hover:bg-accent hover:text-accent-foreground"
                    >
                      <action.icon className="h-4 w-4 mb-1" />
                      <span className="text-center leading-tight">{action.title}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="resident" className="flex-1 mt-0">
                <div className="space-y-2 mb-4">
                  {actionsByCategory.resident.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action)}
                      className="w-full justify-start h-auto p-3 border-border hover:bg-accent hover:text-accent-foreground"
                    >
                      <action.icon className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium text-xs">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="emergency" className="flex-1 mt-0">
                <div className="space-y-2 mb-4">
                  {actionsByCategory.emergency.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action)}
                      className="w-full justify-start h-auto p-3 border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      <action.icon className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium text-xs">{action.title}</div>
                        <div className="text-xs opacity-70">{action.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </TabsContent>

              {/* Chat Messages */}
              <div className="flex-1 min-h-0 border-t border-border pt-4">
                <div className="h-full overflow-y-auto space-y-3 pr-2">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          message.isBot ? "bg-muted text-foreground" : "bg-accent text-accent-foreground"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.isBot ? (
                            <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          ) : (
                            <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="leading-relaxed">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-foreground p-3 rounded-lg text-sm">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                            <div
                              className="w-2 h-2 bg-current rounded-full animate-pulse"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-current rounded-full animate-pulse"
                              style={{ animationDelay: "0.4s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="flex space-x-2 pt-4 border-t border-border">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="輸入您的問題..."
                  className="flex-1 bg-input border-border"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Tabs>
        </CardContent>
      )}
    </Card>
  )
}
