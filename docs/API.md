# REST API Documentation

**Base URL:** `http://localhost:5000/api`

**Authentication:** Bearer token in header: `Authorization: Bearer <token>`

---

## Authentication

### POST `/auth/register`
Register a new user.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "employee"
}
```

### POST `/auth/login`
Login and receive JWT token.

**Body:**
```json
{
  "email": "admin@enterprise.com",
  "password": "Admin@123"
}
```

### POST `/auth/forgot-password`
Request password reset token.

**Body:** `{ "email": "user@example.com" }`

### PUT `/auth/reset-password/:token`
Reset password with token.

**Body:** `{ "password": "newpassword123" }`

### GET `/auth/me` 🔒
Get current user profile.

### PUT `/auth/profile` 🔒
Update profile. Supports multipart for avatar.

### PUT `/auth/change-password` 🔒
**Body:** `{ "currentPassword": "...", "newPassword": "..." }`

### GET `/auth/users` 🔒 Admin
List all users. Query: `?search=&role=`

### PUT `/auth/users/:id` 🔒 Admin
Update user.

### DELETE `/auth/users/:id` 🔒 Admin
Delete user.

---

## Employees

### GET `/employees` 🔒 Admin/Manager
List employees. Query: `?search=&department=&status=`

### GET `/employees/:id` 🔒
Get employee with tasks.

### GET `/employees/:id/metrics` 🔒
Get employee productivity metrics.

### POST `/employees` 🔒 Admin
Create employee (also creates user account).

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@enterprise.com",
  "position": "Developer",
  "department": "<departmentId>",
  "phone": "+1-555-0100",
  "salary": 75000,
  "skills": "React, Node.js",
  "password": "Employee@123"
}
```

### PUT `/employees/:id` 🔒 Admin
Update employee.

### DELETE `/employees/:id` 🔒 Admin
Delete employee and associated user.

---

## Departments

### GET `/departments` 🔒
List departments. Query: `?search=`

### GET `/departments/:id` 🔒
Get department with employees.

### POST `/departments` 🔒 Admin
**Body:** `{ "name": "Engineering", "description": "...", "budget": 500000, "location": "Building A" }`

### PUT `/departments/:id` 🔒 Admin
Update department.

### DELETE `/departments/:id` 🔒 Admin
Delete department (must have no employees).

---

## Projects

### GET `/projects` 🔒
List projects. Employees see only assigned projects.
Query: `?search=&status=&department=`

### GET `/projects/:id` 🔒
Get project with tasks.

### GET `/projects/:id/timeline` 🔒
Get project timeline data.

### POST `/projects` 🔒 Admin/Manager
**Body:**
```json
{
  "name": "New Project",
  "description": "...",
  "status": "planning",
  "priority": "high",
  "startDate": "2025-01-01",
  "endDate": "2025-06-30",
  "department": "<departmentId>",
  "budget": 100000,
  "teamMembers": ["<employeeId>"]
}
```

### PUT `/projects/:id` 🔒 Admin/Manager
Update project.

### DELETE `/projects/:id` 🔒 Admin/Manager
Delete project and all tasks.

### PUT `/projects/:id/team` 🔒 Admin/Manager
**Body:** `{ "teamMembers": ["<employeeId>"] }`

---

## Tasks

### GET `/tasks` 🔒
List tasks. Employees see only assigned tasks.
Query: `?search=&status=&priority=&project=&assignedTo=`

### GET `/tasks/:id` 🔒
Get task details.

### POST `/tasks` 🔒 Admin/Manager
**Body:**
```json
{
  "title": "Implement feature",
  "description": "...",
  "project": "<projectId>",
  "assignedTo": "<employeeId>",
  "status": "todo",
  "priority": "high",
  "dueDate": "2025-03-15"
}
```

### PUT `/tasks/:id` 🔒
Update task.

### PATCH `/tasks/:id/status` 🔒
**Body:** `{ "status": "in-progress", "order": 0 }`

### DELETE `/tasks/:id` 🔒 Admin/Manager
Delete task.

### GET `/tasks/kanban/:projectId` 🔒
Get Kanban board columns for a project.

### PUT `/tasks/kanban/:projectId/bulk` 🔒
Bulk update task positions after drag-and-drop.

**Body:**
```json
{
  "updates": [
    { "id": "<taskId>", "status": "in-progress", "order": 0 }
  ]
}
```

---

## Task Comments

### GET `/tasks/:taskId/comments` 🔒
List comments for a task.

### POST `/tasks/:taskId/comments` 🔒
**Body:** `{ "content": "Comment text" }`

### DELETE `/tasks/:taskId/comments/:id` 🔒
Delete comment.

---

## Notifications

### GET `/notifications` 🔒
List notifications. Query: `?unreadOnly=true`

### PUT `/notifications/:id/read` 🔒
Mark notification as read.

### PUT `/notifications/read-all` 🔒
Mark all as read.

### DELETE `/notifications/:id` 🔒
Delete notification.

---

## Files

### GET `/files` 🔒
List files. Query: `?category=&relatedModel=&relatedId=`

### POST `/files/upload` 🔒
Upload file (multipart/form-data).

**Fields:** `file`, `category` (profile|project|document|task), `taskId`, `relatedModel`, `relatedId`

### DELETE `/files/:id` 🔒
Delete file.

---

## Dashboard

### GET `/dashboard/stats` 🔒
Get dashboard statistics and chart data.

### GET `/dashboard/employee` 🔒
Get employee-specific dashboard data.

---

## Reports

### GET `/reports` 🔒 Admin/Manager
List generated reports.

### POST `/reports/employee` 🔒 Admin/Manager
Generate employee performance PDF report.

### POST `/reports/project` 🔒 Admin/Manager
Generate project status PDF report.

### POST `/reports/productivity` 🔒 Admin/Manager
Generate productivity PDF report.

### DELETE `/reports/:id` 🔒 Admin/Manager
Delete report.

---

## Health Check

### GET `/api/health`
Returns API status.

---

## Socket.io Events

**Connect:** `io('http://localhost:5000')`

**Client → Server:**
- `join` — Join user room: `socket.emit('join', userId)`

**Server → Client:**
- `notification` — Real-time notification object

---

## Response Format

**Success:**
```json
{
  "success": true,
  "data": {},
  "count": 10,
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

🔒 = Requires authentication
