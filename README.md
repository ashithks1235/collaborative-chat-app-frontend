<h1 align="center">CodeTalk</h1>

<p align="center">
  A real-time collaboration platform built with the MERN stack, combining team chat, threaded messaging, Kanban task management, file sharing, notifications, and admin analytics in one product.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Framework-Express-black?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/Database-MongoDB-10aa50?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Realtime-Socket.IO-black?style=for-the-badge&logo=socket.io" />
  <img src="https://img.shields.io/badge/Styling-TailwindCSS-38bdf8?style=for-the-badge&logo=tailwindcss" />
</p>

<p align="center">
  <a href="https://collaborative-chat-app-frontend.vercel.app">Live Demo</a> •
  <a href="https://collaborative-chat-app-backend.onrender.com">Backend API</a>
</p>

---

## Overview

CodeTalk is a full-stack real-time collaboration system designed to simplify communication and task execution for teams. It merges Slack-style messaging with Trello-style project tracking into one application.

Users can:
- collaborate in channels
- reply in threads
- assign and manage tasks
- upload and organize files
- receive real-time notifications
- monitor activity through role-based admin tools

---

## Features

### Real-Time Collaboration
- Live channel messaging with Socket.IO
- Threaded replies
- Online user presence
- Real-time task synchronization
- Real-time notifications

### Task & Project Management
- Project-based Kanban boards
- Drag-and-drop task workflow
- Assignees, due dates, and priorities
- Task comments and subtasks
- Message-to-task conversion
- Comment-to-subtask conversion

### File Sharing
- Upload images, videos, and documents in channel chat
- Personal file library
- Download and preview uploaded files
- User-specific library delete behavior

### Authentication & Roles
- JWT authentication
- Protected routes
- Session restore
- Role-based access control
- Admin / Moderator / Member workflow

### Admin Tools
- Admin dashboard
- User management
- Channel management
- Analytics view
- Live system updates

---

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Socket.IO Client
- Framer Motion
- Chart.js
- DnD Kit

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- Socket.IO
- JWT
- Multer
- bcryptjs
- sanitize-html
- express-rate-limit
- Helmet

---

## Project Structure

```bash
front-end/
├── src/
│   ├── api/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── layout/
│   ├── pages/
│   ├── services/
│   └── utils/

backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
└── index.js
