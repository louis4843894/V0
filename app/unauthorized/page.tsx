import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldX, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <ShieldX className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">權限不足</CardTitle>
          <CardDescription className="text-muted-foreground">您沒有權限存取此頁面</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">請聯絡管理員或使用具有適當權限的帳號登入</p>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首頁
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
