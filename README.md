# OnIT India - Attendance Tracking System

A full-stack modern attendance tracking platform for employees and administrators.

## 🚀 Quick Start (Development)

### 🔙 Backend
```bash
cd backend
npm install
npm run dev
```

### 🎨 Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🛠️ Production Readiness Guide

The application has been hardened for production with the following features:
- **Security Check**: `helmet`, `rate-limiting`, `cors` hardening, and `express-validator`.
- **Performance**: `compression` (Gzip) and `morgan` logging.
- **Resilience**: Frontend `ErrorBoundary`.

### 1. Build the Frontend
```bash
cd frontend
npm run build
```
This will generate a `dist` folder. If you're using Vercel, this is handled automatically.

### 2. Configure Environment Variables
Ensure the following are set in your production environment (e.g., Vercel Dashboard, AWS, or Heroku):
- `NODE_ENV=production`
- `MONGO_URI`: Your production MongoDB connection string.
- `JWT_SECRET`: A long, unique random string (MUST change from development).
- `FRONTEND_URL`: Your live domain (e.g., `https://on-it.in`).

### 3. Server-Side Deployment
If you are deploying the backend separately:
- Use `npm start` (not `npm run dev`).
- Ensure the port matches your environment setup.

### 4. Vercel Deployment Note
- **Frontend**: Points to the `frontend` directory with the `npm run build` command and `dist` output.
- **Backend**: You can deploy the `backend` as a Vercel function by adding a `vercel.json` and reorganizing slightly if needed, but a VPS (Render, Railway, or Heroku) is often preferred for long-running Node.js processes.

---

## 👨‍💻 Admin Credentials (Initial)
- **Email**: `admin@onitindia.com`
- **Password**: `admin123` (Change this immediately upon first login for production).
