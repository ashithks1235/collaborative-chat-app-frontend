<h1 align="center">CodeTalk</h1>

<p align="center">
  CodeTalk is a real-time collaboration platform built with the MERN stack. It combines team communication and task management in one application, allowing users to chat in channels, reply in threads, manage projects on Kanban boards, share files, and receive live notifications.

  This project was built to solve the problem of switching between separate tools for communication and execution. It brings Slack-style messaging and Trello-style task tracking together in a single workflow-driven platform.
</p>

## 💻 Technologies

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0F172A?style=for-the-badge&logo=tailwind-css&logoColor=38BDF8)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Socket.io Client](https://img.shields.io/badge/Socket.IO_Client-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-222222?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-0C2D1F?style=for-the-badge&logo=mongodb&logoColor=47A248)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens)
![Multer](https://img.shields.io/badge/Multer-FFB703?style=for-the-badge)
![Render](https://img.shields.io/badge/Render-2F80ED?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

<p align="center">
  <a href="https://collaborative-chat-app-frontend.vercel.app">Live Demo</a> •
  <a href="https://collaborative-chat-app-backend.onrender.com">Backend API</a>
</p>

---

## 🌟 Features
- JWT-based authentication and protected routes
- Real-time channel messaging with Socket.IO
- Threaded replies for focused discussions
- Unread channel and thread reply tracking
- Role-based access control for Admin, Moderator, and Member
- Project creation inside channels
- Kanban board with drag-and-drop task workflow
- Task assignees, priorities, due dates, subtasks, and comments
- Convert messages into tasks
- Convert task comments into subtasks
- Real-time notifications for task assignments, completions, and thread activity
- File uploads for images, videos, and documents
- Personal file library with filtering and download support
- Admin dashboard with analytics and user/channel management
- Personal notes, reminders, and Today Focus panel

---
## 🔄 The Process
I built this project as a real-world full-stack system instead of a basic CRUD app. The goal was to design a collaboration product where communication and task execution work together.

The process included:
- designing the MongoDB models for users, channels, messages, projects, boards, tasks, files, and notifications
- building a service-oriented Express backend with controllers, services, middleware, and reusable utilities
- implementing JWT authentication and role-based authorization
- integrating Socket.IO for real-time chat, notifications, presence, unread counts, and Kanban updates
- building a React frontend with Context API and custom hooks for auth, sockets, tasks, channels, and UI state
- handling deployment issues like API consistency, timeouts, session restore, unread count logic, file persistence, and production-specific debugging

This project was also a strong exercise in debugging real deployment problems and improving the architecture over time.

---

## 🧠 What I Learned
Through this project, I learned how to:
- structure a MERN application with a scalable frontend and backend architecture
- build real-time systems using Socket.IO rooms and events
- design MongoDB schemas for collaboration workflows
- manage global state in React using Context API and custom hooks
- handle authentication and protected APIs using JWT
- connect communication flows with execution flows, such as converting messages into tasks
- debug real deployment issues across Vercel, Render, MongoDB Atlas, sockets, CORS, and file handling
- think beyond UI and build features with real product behavior and user roles in mind

---

## 🚀 How To Improve
There are several ways this project can be improved further:
- add built-in video calling and meeting rooms to make collaboration more complete by combining chat, tasks, file sharing, and live meetings in one platform
- add automated testing for auth, messaging, tasks, and notifications
- introduce Redis for scalable Socket.IO event handling
- add advanced search across messages, tasks, and files
- improve analytics and reporting dashboards
- optimize frontend bundle size with route-based code splitting
- move large-scale file handling to a production-grade storage strategy
- add multi-workspace or team support
- improve system observability with logging and monitoring tools

---

## 📦 How To Run The Project
To run this project in your local enviornment, follow these steps:

1. Clone the repository to your local machine.
2. Run `npm install` in the project directory to install the required dependencies.
3. Run `npm run dev` or `run start` to get the project started.
4. Open `http://localhost:5173` in your web browser to view the app.

---

## 📸 Project Overview

### Dashboard (Overview)
<img width="850" alt="Screenshot 2026-03-23 at 8 34 27 PM" src="https://github.com/user-attachments/assets/8e53e06d-6577-479b-ba91-5770a8f224e1" />

Dashboard Overview – A centralized productivity hub that gives users a real-time snapshot of their workspace. It highlights recent chats, active projects, assigned tasks, notes, and performance analytics—helping users stay organized and focused throughout the day.

### Channel Chat (Real-time Messaging)
<img width="850" alt="Screenshot 2026-03-23 at 8 36 35 PM" src="https://github.com/user-attachments/assets/3489fa91-685c-4889-bd00-c012e649b22a" />
<img width="850" alt="Screenshot 2026-03-23 at 8 37 26 PM" src="https://github.com/user-attachments/assets/fe4dec07-c16a-4dd8-9dde-e9ada83bf2cd" />

Real-time Channel Chat - A real-time collaborative chat system built with Socket.io, enabling seamless team communication. Supports message reactions, threaded discussions, role-based actions, and live member presence for an interactive team experience.

### Kanban Board (Project Tasks)
<img width="850" alt="Screenshot 2026-03-23 at 8 37 50 PM" src="https://github.com/user-attachments/assets/06a29bf9-a549-4b8a-9259-f8fb4e8789ea" />
<img width="850" alt="Screenshot 2026-03-23 at 8 38 27 PM" src="https://github.com/user-attachments/assets/57d133ae-3585-4ef2-a23f-03cde54ece29" />

Kanban Task Board – Manage projects and tasks in one place with a centralized system that tracks progress, team members, and completion status. The integrated Kanban board allows users to organize tasks across workflow stages with drag-and-drop functionality, priority management, due dates, and real-time updates for seamless collaboration.

### Admin Dashboard
<img width="850" alt="Screenshot 2026-03-23 at 8 41 04 PM" src="https://github.com/user-attachments/assets/0233503d-0dd1-4fb0-ab3c-31684206a6cd" />
<img width="850" alt="Screenshot 2026-03-23 at 8 39 50 PM" src="https://github.com/user-attachments/assets/29f3790f-a4a8-4d19-9801-92ec21c3f377" />
<img width="850" alt="Screenshot 2026-03-23 at 8 40 19 PM" src="https://github.com/user-attachments/assets/07e88de2-0610-41f1-a360-cf13d22ab8b5" />

Admin Dashboard – A comprehensive admin control center designed to monitor, manage, and optimize the entire platform. The dashboard provides real-time insights into system activity, including total users, channels, tasks, and messages.
