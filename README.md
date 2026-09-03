# 🚀 Pravesh Kumar — Developer Portfolio Monorepo

A modern, full-stack personal portfolio platform built with a modular architecture. It features a public-facing website, a secure admin dashboard for content management (CMS/CRM), and a robust backend API.

🔗 **Live Site:** [View Portfolio](https://my-portfolio-seven-delta-80.vercel.app/)

---

## 🏛️ Project Architecture

This repository is organized as a monorepo containing three distinct applications:

1. **`frontend/`** (Public Portfolio)
   - Built with **React 19**, **Vite**, and **Framer Motion**.
   - Showcases live projects, technical skills, and acts as the main user touchpoint.
2. **`admin/`** (Admin Dashboard)
   - A secure React SPA for managing content (Projects, Blogs, Media Library) and CRM (Leads, Contact Messages).
   - Powered by Tailwind CSS and Recharts for analytics.
3. **`backend/`** (Node.js API)
   - Built with **Express.js** and **Neon PostgreSQL**.
   - Serves dynamic content, handles JWT authentication, Backblaze B2 media storage, and email notifications.

---

## ✨ Key Features

- **Dynamic CMS:** Complete content management for projects, blogs, and case studies.
- **Media Library:** Fully integrated Backblaze B2 S3-compatible cloud storage for handling large video presentations and assets.
- **CRM System:** Integrated contact and lead management with email notifications.
- **Animated UI:** Smooth page transitions and scroll animations via Framer Motion.
- **Role-Based Access Control:** Secure JWT authentication on the backend.

---

## 🛠️ Tech Stack

- **Frontend / Admin:** React 19, Vite, Tailwind CSS, Vanilla CSS, Framer Motion, Lucide React, Recharts.
- **Backend:** Node.js, Express, Neon Serverless PostgreSQL.
- **Storage:** Backblaze B2 (AWS SDK v3 for S3 compatibility).

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Neon PostgreSQL database
- Backblaze B2 account (for media storage)

### 1. Setup Backend

```bash
cd backend
npm install
# Copy .env.example to .env and fill in your database and B2 credentials
cp .env.example .env
# Start the backend server (runs on port 5000)
npm run dev
```

### 2. Setup Frontend (Public Site)

```bash
cd frontend
npm install
# Start the frontend dev server (runs on port 5173)
npm run dev
```

### 3. Setup Admin Dashboard

```bash
cd admin
npm install
# Start the admin dev server (runs on port 5174)
npm run dev
```

---

## 📬 Contact

- **GitHub:** [github.com/kumar-pravesh](https://github.com/kumar-pravesh)
- **LinkedIn:** [linkedin.com/in/pravesh-kumar-38b1422a7](https://www.linkedin.com/in/pravesh-kumar-38b1422a7)

> Built with ❤️ by Pravesh Kumar
