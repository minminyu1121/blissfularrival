# 生活進度追蹤系統 (Blissful Arrival)

記錄每一天的目標、習慣與成長，看見自己的生活進度。

## 技術架構

- **前端框架**：Next.js 16 (App Router) + React 19
- **樣式**：Tailwind CSS 4
- **資料庫 / 驗證**：Firebase Firestore + Firebase Auth
- **部署**：Vercel

## 目前功能

- ✅ Google 帳號登入
- ✅ 上導覽列（Logo、使用者資訊、登出）
- ✅ 登入保護（未登入自動導向登入頁）
- ✅ Firestore 即時同步（名字、招呼句自動儲存）
- 🔜 目標管理
- 🔜 習慣打卡
- 🔜 日記撰寫

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定 Firebase

1. 前往 [Firebase Console](https://console.firebase.google.com/) 建立新專案
2. 在專案中加入 **Web 應用程式**
3. 啟用 **Authentication > 登入方式 > Google**（填入專案支援電子郵件，按儲存）
4. 建立 **Firestore Database**（選「以測試模式啟動」）
5. 部署安全規則（建議，限制每人只能讀寫自己的資料）：

```bash
# 需先安裝 Firebase CLI：npm install -g firebase-tools
firebase login
firebase use blissfularrival1121
firebase deploy --only firestore:rules
```

或手動到 Firebase Console → Firestore → 規則，貼上 `firestore.rules` 的內容。

6. 複製 Firebase 設定值：

```bash
cp .env.local.example .env.local
```

編輯 `.env.local`，填入你的 Firebase 設定值。

### 3. 本機開發

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

### 4. 部署到 Vercel

1. 將專案推送到 GitHub
2. 在 [Vercel](https://vercel.com) 匯入此 repo
3. 在 Vercel 專案設定 > Environment Variables 中，加入 `.env.local` 裡的所有 `NEXT_PUBLIC_FIREBASE_*` 變數
4. 部署完成！

## 專案結構

```
src/
├── app/
│   ├── (app)/          # 需要登入的頁面（含上導覽）
│   │   └── dashboard/  # 主頁
│   ├── login/          # 登入頁
│   └── page.tsx        # 根路徑（自動導向）
├── components/
│   ├── auth/           # 登入相關元件
│   └── layout/         # 上導覽元件
├── contexts/
│   ├── AuthProvider.tsx         # 全域登入狀態
│   └── UserProfileProvider.tsx  # Firestore 即時同步
└── lib/
    ├── firebase.ts     # Firebase 初始化
    └── userProfile.ts  # Firestore 使用者資料
```

## Firestore 資料結構

```
users/{userId}
├── name: string          # 顯示名字
├── greetings: string[]   # 招呼句（重新整理輪播）
├── email: string         # Google 帳號 email
├── photoURL: string     # 大頭貼（選填）
├── createdAt: timestamp
└── updatedAt: timestamp
```

## 下一步開發建議

1. **目標功能** — 在 Firestore 建立 `goals` collection，支援新增、編輯、進度追蹤
2. **習慣打卡** — 每日打卡記錄，顯示連續天數
3. **日記** — 富文字編輯器，依日期瀏覽
4. **資料視覺化** — 在總覽頁加入進度圖表
