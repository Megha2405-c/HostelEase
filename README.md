# HostelEase — AI-Powered Student Complaint & Support Management System

A full-stack mini-project based on your PPT: student login, admin/staff login, complaint submission and tracking, explainable category/priority suggestions, duplicate warning, department routing, in-app notifications, overdue escalation, analytics and student FAQ assistant.

## Tech stack
React + Vite, Node.js + Express, MongoDB + Mongoose, JWT authentication.

## Requirements
Node.js 18+ and MongoDB (local or MongoDB Atlas).

## Start backend
1. Open a terminal in `backend`.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and update MongoDB URI, JWT secret and admin bootstrap key.
4. Run `npm run dev` (API: http://localhost:5000).

## Create the first admin
Use Postman or Thunder Client:
`POST http://localhost:5000/api/auth/bootstrap-admin`
```json
{"name":"Hostel Admin","email":"admin@hostelease.local","password":"Admin@12345","bootstrapKey":"change-this-bootstrap-key"}
```
Use the same bootstrap key in `.env`. Change the demo password after first login.

## Start frontend
1. Open another terminal in `frontend`.
2. Run `npm install` then `npm run dev`.
3. Open the Vite URL, normally http://localhost:5173.

Students can register from the login page. Admins can create staff/warden accounts from Team Management. Admin/staff updates create student notifications.

## Important project note
The built-in classifier is a transparent keyword/NLP-style baseline that works without a paid API key. It suggests category, priority and department; it is not a trained machine-learning model. Duplicate detection is a simple text-overlap baseline. In-app notifications and automatic overdue escalation are implemented. Email/SMS/push notifications, image uploads and multilingual AI are future integrations. For real deployment, add email verification, rate limiting, stronger validation, backups and HTTPS.
