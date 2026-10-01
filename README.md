# MEAX Merchant Portal

A high-performance, enterprise-grade merchant web portal for the **MEAX** food and grocery delivery platform. Built with **React 19**, **Vite**, **Redux Toolkit**, **React Router v7**, and **Axios**.

---

## 🔒 Security & Authentication Architecture

The MEAX Merchant Portal implements an enterprise **Zero-localStorage Token Policy** to defend against Cross-Site Scripting (XSS) and token exfiltration attacks:

### 1. HttpOnly Secure Cookies
- **Zero Web Storage**: Neither `accessToken` nor `refreshToken` is ever saved in `localStorage` or `sessionStorage`.
- **Automatic Browser Handling**: All requests use Axios with `withCredentials: true`. The browser securely stores and attaches HttpOnly cookies to cross-origin API requests.
- **Short-Lived Access Tokens**: 15-minute access tokens minimize the window of vulnerability.

### 2. Silent Refresh Token Rotation
- When an API request returns `401 Unauthorized` due to access token expiry, an Axios response interceptor intercepts the failure.
- A concurrent request queue pauses in-flight calls and triggers `POST /api/v1/auth/refresh`.
- The browser attaches the HttpOnly `refreshToken` cookie, the backend issues new rotated cookies, and all queued requests retry seamlessly without logging the merchant out.

### 3. Session Hydration & RBAC
- On page refresh, the application calls `GET /api/v1/auth/me` to rehydrate the merchant session and verify permissions.
- **Role-Based Access Control (RBAC)**: Route guards (`ProtectedRoute`) enforce that only accounts with `MERCHANT` or `ADMIN` roles can access dashboard, orders, menu, and store settings.

---

## 🚀 Key Features

- **Store Dashboard**: Real-time kitchen metrics, revenue summaries, order volume graphs, and active status controls.
- **Live Orders**: Real-time incoming, in-kitchen, and completed orders with delivery partner status.
- **Menu Management**: Categories, pricing, modifier configuration, and item availability toggles.
- **Store Settings**: Operating hours, delivery zones, profile details, and payout configuration.
- **Error Boundary**: Top-level fault isolation with instant page reload and dashboard recovery options.
- **Code-Splitting**: Route-level dynamic imports with React Suspense for optimal bundle performance.

---

## 📂 Project Structure

```
src/
├── assets/             # Brand logos, icons, and illustrations
├── components/
│   ├── common/         # ErrorBoundary, LoadingSpinner, and generic UI components
│   ├── features/       # Feature-specific components (e.g. auth/LoginForm)
│   └── layout/         # Shell layout (Header, Sidebar, Footer, MainLayout)
├── context/            # Dynamic Header context and UI state
├── hooks/              # Custom hooks (useAuth, useHeader)
├── pages/              # Lazy-loaded route views (Dashboard, Orders, Menu, Settings, Login)
├── routes/             # AppRoutes with RBAC ProtectedRoute and Suspense
├── services/           # Axios API client and domain services (authService)
├── store/              # Redux Toolkit store and slices (authSlice)
├── styles/             # Global CSS and layout styling
└── utils/              # Constants, validators, and helper utilities
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** (v20+ recommended)
- **MEAX Backend API** running on `http://localhost:5000`

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_APP_NAME="Meax Merchant Portal"
VITE_APP_ENV="development"
VITE_API_BASE_URL="http://localhost:5000/api/v1"
VITE_ENABLE_ANALYTICS=false
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🧪 Default Test Credentials

For local development and testing:
- **Merchant Account 1**: `merchant@meax.com` / `Merchant@123456`
- **Merchant Account 2**: `dana@lonestarpizza.com` / `password123`
