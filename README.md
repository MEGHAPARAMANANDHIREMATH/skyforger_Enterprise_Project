# Enterprise Project & Workforce Management System

A full-stack MERN application for managing enterprise projects, workforce, tasks, and productivity — designed to run entirely on localhost with MongoDB Community Server.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, Chart.js, Framer Motion, Socket.io Client |
| Backend | Node.js, Express.js, JWT, Socket.io, Multer, Bcrypt |
| Database | MongoDB Community Server (local), Mongoose |

## Features

- **Authentication** — Register, login, logout, forgot/reset password, JWT, RBAC (Admin, Manager, Employee)
- **Employee Management** — CRUD, search, profiles, productivity metrics
- **Department Management** — CRUD with employee counts
- **Project Management** — CRUD, team assignment, timeline, progress tracking
- **Task Management** — CRUD, assignments, due dates, priorities, status updates, comments
- **Kanban Board** — Drag-and-drop across To Do, In Progress, Review, Completed
- **Dashboard** — Stats, charts, recent activities, project progress
- **Reports** — Employee, project, productivity reports with PDF export
- **Notifications** — Real-time via Socket.io (task assignments, deadlines)
- **File Management** — Local uploads (profiles, projects, documents)
- **UI/UX** — Dark/light mode, responsive layout, toast notifications, loading skeletons

## Prerequisites

1. **Node.js** v18+ — [https://nodejs.org](https://nodejs.org)
2. **MongoDB Community Server** — [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
3. **npm** (comes with Node.js)

## Installation

### 1. Clone / Open the Project

```bash
cd "Enterprise Project"
```

### 2. Start MongoDB

Ensure MongoDB Community Server is running on `localhost:27017`.

**Windows (if installed as a service):**
```powershell
net start MongoDB
```

**Or run manually:**
```bash
mongod --dbpath "C:\data\db"
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Copy environment file (already included as `.env`):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/enterprise_workforce_management
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Seed the database:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

Backend runs at: **http://localhost:5000**

### 4. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@enterprise.com | Admin@123 |
| Manager | manager@enterprise.com | Manager@123 |
| Employee | john@enterprise.com | Employee@123 |

All employee accounts use password: `Employee@123`

## Project Structure

```
Enterprise Project/
├── backend/
│   ├── config/          # Database & multer config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── seed/            # Database seed script
│   ├── uploads/         # Local file storage (gitignored)
│   ├── utils/           # Helpers
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth, Theme, Socket providers
│   │   ├── pages/       # Route pages
│   │   ├── services/    # API client
│   │   └── utils/       # Helpers
│   └── package.json
├── docs/
│   └── API.md           # REST API documentation
├── .gitignore
└── README.md
```

## MongoDB Collections

| Collection | Description |
|-----------|-------------|
| users | Authentication & roles |
| employees | Employee profiles & metrics |
| departments | Department data |
| projects | Project management |
| tasks | Task tracking |
| taskcomments | Task comments |
| reports | Generated reports |
| notifications | User notifications |
| files | Uploaded file metadata |

## File Storage

Files are stored locally in `backend/uploads/`:

```
uploads/
├── profiles/     # Profile images
├── projects/     # Project cover images
├── documents/    # Task documents & files
└── reports/      # Generated PDF reports
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/enterprise_workforce_management |
| JWT_SECRET | JWT signing secret | your_secret_key |
| JWT_EXPIRE | Token expiration | 7d |
| CLIENT_URL | Frontend URL for CORS | http://localhost:5173 |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |
| VITE_SOCKET_URL | Socket.io server URL | http://localhost:5000 |

## Scripts

### Backend
- `npm start` — Start production server
- `npm run dev` — Start with nodemon (development)
- `npm run seed` — Seed database with demo data

### Frontend
- `npm run dev` — Start Vite dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build

## License

MIT — For educational and enterprise use.
