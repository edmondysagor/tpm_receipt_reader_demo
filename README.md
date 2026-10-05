# TPM Receipt Guard 🧾⚡

> **AI-Powered Receipt & Invoice Extraction Platform**  
> 全自動多模態 AI 單據識別、防重審核與數據導出系統。

---

## 🌟 主要功能特色 (Features)

- **📄 批量單據與 PDF 辨識**：支援 PDF、PNG、JPG 格式，自動進行圖像優化與壓縮，大幅降低 Token 消耗。
- **🤖 多模態 Vision AI**：預設採用 **Gemma 4 31B** / **Qwen VL** 視覺模型，精準提取商家名稱、日期、總金額、幣別、分類及支付方式。
- **🔍 智能重複單據檢測 (Duplicate Check)**：自動比對識別結果，標記重複單據並標示原序號。
- **🔐 雙軌驗證系統 (Auth)**：支援 **Google OAuth 2.0 (Google Identity Services)** 與原生 **Email / 密碼** 註冊登入。
- **💳 額度與支付系統 (Credits & Billing)**：整合 **Stripe Checkout** 與 Webhook 自動充值 Credits。
- **📊 即時進度與數據導出**：採用 Server-Sent Events (SSE) 即時推送 AI 分析進度，支援在線編輯與一鍵導出 CSV。

---

## 🛠️ 技術架構 (Tech Stack)

| 領域 | 技術 / 服務 |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Python 3.13, FastAPI, Uvicorn, PyMuPDF, Pillow, PyJWT, bcrypt |
| **Database** | Railway PostgreSQL |
| **AI Vision Engine** | Ollama Cloud / Multimodal Vision LLMs |
| **Authentication** | Google Identity Services (OAuth 2.0) + Native JWT |
| **Payment** | Stripe API & Webhooks |
| **Deployment** | Vercel (Frontend) + Railway (Backend & PostgreSQL) |

---

## 🚀 本機開發環境啟動 (Getting Started)

### 1. 後端 Backend

```bash
cd backend

# 建立並啟動 Python 虛擬環境
python3 -m venv venv
source venv/bin/activate  # macOS / Linux

# 安裝相依套件
pip install -r requirements.txt

# 啟動 FastAPI 伺服器 (Port 8000)
uvicorn app:app --reload --port 8000
```

### 2. 前端 Frontend

```bash
cd frontend

# 安裝 npm 套件
npm install

# 啟動 Vite 開發伺服器 (Port 3000)
npm run dev
```

---

## ⚙️ 環境變數設定 (Environment Variables)

### 後端 (`backend/.env`)
```ini
DATABASE_URL="postgresql://postgres:password@host:port/railway"
DATABASE_PUBLIC_URL="postgresql://postgres:password@host:port/railway"
JWT_SECRET="your-jwt-secret"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
OLLAMA_HOST="https://ollama.com"
OLLAMA_API_KEY="your-ollama-api-key"
MODEL_NAME="gemma4:31b"
STRIPE_API_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."
FRONTEND_URL="https://receiptguard.taipingmuntech.com"
```

### 前端 (`frontend/.env`)
```ini
VITE_GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
VITE_API_BASE="https://api-receiptguard.taipingmuntech.com" # 本機為 /api
```

---

## 📁 目錄結構 (Project Structure)

```text
├── backend/
│   ├── app.py             # FastAPI 主路由與 SSE 端點
│   ├── auth.py            # JWT 簽發、密碼加密與 Google Token 驗證
│   ├── db.py              # PostgreSQL 連線池與 CRUD (Users & Credits)
│   └── requirements.txt   # 後端依賴庫清單
├── frontend/
│   ├── src/
│   │   ├── authClient.ts  # 前端認證管理客戶端
│   │   ├── pages/
│   │   │   ├── AuthScreen.tsx   # 登入與註冊頁面 (含 Google 登入)
│   │   │   ├── Dashboard.tsx    # 控制台與單據處理中心
│   │   │   └── LandingPage.tsx  # 產品首頁
│   │   └── App.tsx        # 路由配置與 Google OAuth Provider
│   └── package.json
└── README.md
```

---

## 📄 授權 (License)

Copyright © 2026 TPM Receipt Guard. All rights reserved.
