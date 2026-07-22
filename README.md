# Borrow Library Admin Portal

The official **Borrow Library Admin Portal** is a production-grade web application built for librarians and university administrators to manage catalog books, student members, borrow requests, physical checkouts/returns, analytics, QR codes, push notifications, audit trails, and system settings.

It interfaces directly with the shared **Firebase** project powering the **Borrow Mobile Application (Flutter)**.

---

## 🚀 Key Modules & System Features

1. **Dashboard & Analytics**: Real-time stats, circulation charts, daily checkout telemetry, recent activity logs.
2. **Book Inventory Management**: Book catalog CRUD, WebP cover image compression, 1-to-many physical copy tracking (`CPY-235088-001`), archiving.
3. **Borrow Request System**: Real-time request subscriber, custom loan duration approval modal, rejection reasons, push notification dispatch.
4. **Issue & Return Checkout System**: Physical copy checkout, return receipt inspection (condition rating), dynamic overdue calculation.
5. **Student Member Directory**: Registered student profiles, active loan badges, history logs, overdue alerts.
6. **Reports & Analytics**: Circulation graphs, leaderboard tables, CSV spreadsheet & PDF document export.
7. **QR Code & Barcode Engine**: SVG matrix generator, copy lookup, bulk sticker label printing, live camera QR scanner.
8. **Notifications & Announcements Center**: Broadcast composer, targeted student groups, pinned announcement banners, mobile preview mockup.
9. **Activity Logs & Audit Trail**: Immutable system audit logger (`activityLogs/`), diff drawer, timeline visualizer.
10. **Global Search Command Palette (`Ctrl + K`)**: Universal indexer querying across books, copies, students, checkouts, and logs.
11. **Library Settings & System Configuration**: Real-time settings sync (`settings/globalConfig`), loan rules, return policies, category/department managers, JSON backup/restore.
12. **Role-Based Access Control (RBAC) & Admin Management**: Three-tier roles (*Super Admin*, *Library Admin*, *Librarian*), permission guards, permission matrix.
13. **Security & Production Hardening**: Firestore security rules, storage rules, composite indexes, React Error Boundary, Network Monitor, IndexedDB offline persistence.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19.0 + Vite 6.4
- **UI Design System**: Material UI 6 (Material 3 styling with Borrow `#2563EB` color system)
- **Routing**: React Router v7
- **Database & Auth**: Firebase v11 SDK (Firestore, Auth, Storage, Cloud Messaging)
- **State & Telemetry**: React Context API, Custom Hooks, Framer Motion animations
- **Forms & Validation**: React Hook Form
- **Export Formats**: CSV Data & Printable HTML/PDF Reports

---

## 📦 Environment Setup & Installation

### 1. Prerequisites
- Node.js (v18.0 or higher)
- npm or yarn

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-org/borrow-website.git
cd borrow-website
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🔒 Deploying Firebase Security Rules & Indexes

### Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Storage Security Rules
```bash
firebase deploy --only storage
```

### Deploy Firestore Composite Indexes
```bash
firebase deploy --only firestore:indexes
```

---

## 💻 Running the Application

### Development Server
```bash
npm run dev
```

### Production Build & Preview
```bash
npm run build
npm run preview
```

### Production Login Credentials
- **Email**: `admin@borrow.com`
- **Password**: `admin123`
