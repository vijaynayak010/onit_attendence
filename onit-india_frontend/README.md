# OnIT India – Workforce Management Platform

A modern, production-ready SaaS frontend for employee attendance tracking, work updates, and admin management.

## Tech Stack

- **React 18** – UI framework
- **Vite 5** – Build tool & dev server
- **Tailwind CSS 3** – Utility-first styling
- **React Router 6** – Client-side routing
- **Axios** – HTTP client
- **Lucide React** – Icon library

## Project Structure

```
src/
├── services/
│   └── api.js              # All API calls (axios instance + endpoints)
├── context/
│   ├── AuthContext.jsx     # Auth state management
│   └── ToastContext.jsx    # Toast notification system
├── components/
│   ├── Button.jsx          # Reusable button (5 variants)
│   ├── Card.jsx            # Reusable card wrapper
│   ├── Input.jsx           # Reusable input with validation display
│   ├── Layout.jsx          # App shell layout
│   ├── Navbar.jsx          # Top navigation bar
│   ├── ProtectedRoute.jsx  # Auth & role guards
│   └── Sidebar.jsx         # Left sidebar navigation
└── pages/
    ├── Login.jsx           # Authentication page
    ├── Dashboard.jsx       # Employee dashboard (attendance + work cards)
    ├── Attendance.jsx      # Full attendance management page
    ├── WorkUpdates.jsx     # Work update submission page
    ├── Profile.jsx         # User profile editor
    └── AdminDashboard.jsx  # Admin attendance table + stats
```

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

App runs at **http://localhost:3000**

### 3. Build for production

```bash
npm run build
npm run preview
```

## API Configuration

Backend base URL is configured in `src/services/api.js`:

```js
const BASE_URL = 'http://127.0.0.1:5000';
```

Change this to your backend URL. All endpoints:

| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| POST   | `/login`           | Authenticate user        |
| POST   | `/check-in`        | Employee check-in        |
| POST   | `/check-out`       | Employee check-out       |
| POST   | `/add-work`        | Submit work update       |
| GET    | `/all-attendance`  | Get all attendance (admin) |
| POST   | `/complete-profile`| Update user profile      |

### Expected API response format

**POST /login**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "name": "Vijay Kumar",
    "email": "vijay@onitindia.com",
    "role": "admin",
    "phone": "9876543210"
  }
}
```

**GET /all-attendance**
```json
{
  "attendance": [
    {
      "id": 1,
      "name": "Vijay Kumar",
      "date": "2024-01-15",
      "check_in": "09:02",
      "check_out": "18:15",
      "total_hours": "9h 13m",
      "status": "present"
    }
  ]
}
```

## Role-Based Access

- **Employee** – Dashboard, Attendance, Work Updates, Profile
- **Admin** – All employee pages + Admin Dashboard (set `role: "admin"` in login response)

## Color Palette

| Token     | Hex       | Usage                    |
|-----------|-----------|--------------------------|
| Primary   | `#16A34A` | Buttons, active states   |
| Accent    | `#22C55E` | Highlights, badges       |
| Dark      | `#0F172A` | Sidebar background       |
| Background| `#F8FAFC` | Page background          |

## Features

- ✅ JWT auth with localStorage persistence
- ✅ Auto-redirect on 401 (token expiry)
- ✅ Toast notifications (success & error)
- ✅ Form validation with error states
- ✅ Loading states on all async actions
- ✅ Responsive sidebar with mobile overlay
- ✅ Role-based route protection
- ✅ Admin attendance table with search & filter
- ✅ Profile completion progress indicator
- ✅ Empty states for all data views
