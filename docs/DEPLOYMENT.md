# PashuRakshak — Deployment Guide 🚀

This guide explains how to deploy **PashuRakshak** to a public live URL in the simplest possible way.

---

## 🌟 Option 1: Render.com (Recommended — 100% Free, Easiest Full-Stack)

With Render, you deploy the **entire application** (Frontend UI + Backend API + AI Engine + Database) as **1 Single Web Service** with zero configuration.

### Step 1: Sign In to Render
1. Go to [https://render.com](https://render.com) and click **Sign Up** (or Sign In with your GitHub account).

### Step 2: Create a New Web Service
1. In your Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository:
   - Search for: `SANTHOSHARULDOSS/PashuRakshak` (or select from your list).
   - Click **Connect**.

### Step 3: Configure Settings (Takes 30 seconds)
Fill in the following fields:

| Setting | Value |
| :--- | :--- |
| **Name** | `pashurakshak` (or any name you prefer) |
| **Region** | Singapore / Frankfurt / Oregon (any) |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install --include=dev && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` ($0/month) |

### Step 4: Environment Variables (Optional)
Under **Environment Variables**, you can optionally add:
- `JWT_SECRET` = `your_secure_secret_key_here`
- `NODE_ENV` = `production`

### Step 5: Click "Create Web Service"
- Render will automatically pull the code, build the React frontend, start the Express intelligence server, and seed the initial Maharashtra livestock records.
- In **2 minutes**, you will receive a live HTTPS URL like:  
  👉 **`https://pashurakshak.onrender.com`**

---

## 🚂 Option 2: Railway.app (Fastest 1-Click Deploy)

1. Go to [https://railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Select `SANTHOSHARULDOSS/PashuRakshak`.
4. Railway automatically detects Node.js and runs `npm run build` and `npm start`.
5. Under **Settings** $\rightarrow$ **Networking**, click **Generate Domain** to get your public live URL.

---

## ⚡ Option 3: Vercel (Frontend) + Render (Backend)

If you prefer hosting the React frontend on Vercel:

1. **Backend on Render:**
   - Deploy repo on Render as a Web Service.
   - Note your backend URL (e.g., `https://pashurakshak-api.onrender.com`).
2. **Frontend on Vercel:**
   - Go to [https://vercel.com](https://vercel.com), click **Add New Project**, and import `PashuRakshak`.
   - Set Environment Variable: `VITE_API_URL` = `https://pashurakshak-api.onrender.com`
   - Click **Deploy**.

---

## 🧪 Verifying Your Live Deployment

Once deployed, visit your live URL:
1. **Interactive Demo:** Use the top bar **Role Switcher** to test all 6 roles (`STATE_ADMIN`, `DISTRICT_ADMIN`, `FIELD_VET`, `LAB_TECH`, `PARA_VET`, `FARMER`).
2. **API Health Check:** Open `https://your-app-url/api/health` to confirm the backend status (`HEALTHY`).
3. **Surveillance Map:** Check the GIS tab for real-time Maharashtra disease containment rings and cluster alerts.
