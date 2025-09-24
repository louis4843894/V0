# 社區管理系統

一個現代化的社區管理系統，使用 HTML + JavaScript + Material UI 構建，整合 Supabase 作為後端服務。

## 功能特色

### 🏠 住戶功能
- **用戶認證**: 註冊、登入、密碼重設
- **公告查看**: 瀏覽社區公告和參與投票
- **設備報修**: 線上報修設備故障
- **管理費查詢**: 查看繳費狀況和帳單
- **訪客登記**: 預約和管理訪客
- **包裹查詢**: 查看包裹收發狀況
- **活動參與**: 報名社區活動

### 👥 管理功能
- **用戶管理**: 管理住戶資料和權限
- **公告管理**: 發布和管理社區公告
- **維修管理**: 處理和追蹤維修請求
- **財務管理**: 管理費收支記錄
- **活動管理**: 組織和管理社區活動
- **統計報表**: 查看各項數據統計

### 🤖 AI 客服
- **智能對話**: 24/7 AI 助手服務
- **快速回應**: 常見問題自動回答
- **功能導航**: 快速跳轉到相關功能
- **緊急協助**: 緊急情況處理指南

## 技術架構

### 前端技術
- **HTML5**: 語義化標記
- **CSS3**: 現代化樣式和動畫
- **JavaScript (ES6+)**: 原生 JavaScript
- **Material UI**: Google Material Design
- **響應式設計**: 支援各種設備

### 後端服務
- **Supabase**: 
  - PostgreSQL 資料庫
  - 即時訂閱
  - 用戶認證
  - 行級安全 (RLS)
  - 檔案儲存

### 資料庫設計
- **users**: 用戶資料
- **announcements**: 公告資料
- **votes**: 投票記錄
- **maintenance_requests**: 維修請求
- **events**: 活動資料
- **financial_records**: 財務記錄
- **visitors**: 訪客記錄
- **packages**: 包裹記錄

## 安裝和設定

### 1. 克隆專案
\`\`\`bash
git clone <repository-url>
cd community-management-system
\`\`\`

### 2. 設定 Supabase
1. 在 [Supabase](https://supabase.com) 創建新專案
2. 執行 `scripts/01-create-tables.sql` 創建資料表
3. 執行 `scripts/02-seed-data.sql` 插入範例資料
4. 更新各 HTML 檔案中的 Supabase 配置：
   \`\`\`javascript
   const SUPABASE_URL = "your-supabase-url";
   const SUPABASE_KEY = "your-supabase-anon-key";
   \`\`\`

### 3. 啟動服務
使用任何 HTTP 伺服器提供靜態檔案服務：

\`\`\`bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js (http-server)
npx http-server

# 使用 Live Server (VS Code 擴充)
# 右鍵點擊 index.html -> Open with Live Server
\`\`\`

### 4. 訪問系統
開啟瀏覽器訪問 `http://localhost:8000`

## 檔案結構

\`\`\`
community-management-system/
├── index.html              # 首頁
├── auth.html              # 登入/註冊頁面
├── dashboard.html         # 用戶儀表板
├── admin.html            # 管理後台
├── ai-chat.html          # AI 客服頁面
├── scripts/              # 資料庫腳本
│   ├── 01-create-tables.sql
│   └── 02-seed-data.sql
└── README.md             # 專案說明
\`\`\`

## 用戶角色

### 住戶 (resident)
- 查看公告和投票
- 報修設備
- 查詢管理費
- 登記訪客
- 參與活動

### 委員會 (committee)
- 住戶所有功能
- 管理公告
- 處理維修請求
- 管理活動
- 查看統計

### 管理員 (admin)
- 所有系統功能
- 用戶管理
- 系統設定
- 完整權限

### 廠商 (vendor)
- 查看相關維修請求
- 更新維修狀態
- 基本系統功能

## 安全特性

### 認證和授權
- Supabase Auth 用戶認證
- JWT Token 管理
- 角色基礎存取控制

### 資料安全
- 行級安全 (RLS) 政策
- SQL 注入防護
- XSS 防護
- CSRF 防護

### 隱私保護
- 個人資料加密
- 存取日誌記錄
- 資料最小化原則

## 瀏覽器支援

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 開發指南

### 新增功能
1. 設計資料庫結構
2. 建立 RLS 政策
3. 實作前端介面
4. 整合 Supabase API
5. 測試功能

### 樣式指南
- 使用 CSS 變數定義顏色
- 遵循 Material Design 原則
- 保持響應式設計
- 使用語義化 HTML

### JavaScript 規範
- 使用 ES6+ 語法
- 錯誤處理和驗證
- 非同步操作使用 async/await
- 模組化程式碼

## 部署

### Vercel 部署
1. 連接 GitHub 儲存庫
2. 設定環境變數
3. 自動部署

### Netlify 部署
1. 拖拽檔案到 Netlify
2. 設定自訂網域
3. 啟用 HTTPS

## 維護和更新

### 定期維護
- 資料庫備份
- 安全更新
- 效能監控
- 錯誤日誌檢查

### 功能更新
- 用戶回饋收集
- 新功能開發
- 介面優化
- 效能改善

## 支援和聯絡

如有問題或建議，請聯絡系統管理員。

## 授權

本專案採用 MIT 授權條款。
