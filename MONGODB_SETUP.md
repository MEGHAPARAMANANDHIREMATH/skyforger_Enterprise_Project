# MongoDB Connection Guide - Enterprise Project

Complete step-by-step guide to connect MongoDB to your MERN application.

---

## ✅ STEP 1: Verify Prerequisites

Ensure you have installed:

- **Node.js v18+** → [Download](https://nodejs.org)
- **npm** (comes with Node.js)

Check versions:
```powershell
node --version
npm --version
```

---

## 📦 STEP 2: Install MongoDB Community Server

### Option A: Local MongoDB (Recommended for Development)

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Select your OS (Windows)
   - Click **Download**

2. **Run the Installer**
   - Execute the `.msi` file
   - Select **Complete** installation
   - Check "Install MongoDB Compass" (optional GUI tool)
   - Let it install to default path: `C:\Program Files\MongoDB\Server\`

3. **Configure Data Directory**
   - Create folder: `C:\data\db`
   - MongoDB will store data here

4. **Verify Installation**
   ```powershell
   mongod --version
   ```

### Option B: Using MongoDB Atlas (Cloud - Optional for Production)

If you prefer cloud hosting instead of local MongoDB:

1. Go to: https://mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a cluster (M0 free tier is sufficient)
4. Get connection string (copy from "Connect" → "Drivers")
5. Replace `MONGO_URI` in Step 5 with your Atlas connection string

---

## ▶️ STEP 3: Start MongoDB Server

### Method 1: Windows Service (Recommended - Runs in Background)

```powershell
net start MongoDB
```

To verify it's running:
```powershell
Get-Service MongoDB
```

### Method 2: Manual Start

```powershell
mongod --dbpath "C:\data\db"
```

**Expected Output:**
```
[initandlisten] waiting for connections on port 27017
```

Leave this terminal running while developing.

### Verify Connection

Open **new PowerShell terminal** and test:
```powershell
mongosh
```

You should enter MongoDB shell. Type `exit` to quit.

---

## 📝 STEP 4: Create Backend Environment File

Your backend needs a `.env` file with MongoDB connection details.

### Create `.env` File in Backend Folder

**Path:** `backend/.env`

Copy this content:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/enterprise_workforce_management
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

**Explanation:**
- `PORT=5000` → Backend server port
- `MONGO_URI=mongodb://localhost:27017/enterprise_workforce_management` → Local MongoDB connection
  - `localhost:27017` → MongoDB default address & port
  - `enterprise_workforce_management` → Database name (auto-created)
- `JWT_SECRET` → Change to a strong secret key for production
- `JWT_EXPIRE=7d` → JWT token expiration
- `CLIENT_URL=http://localhost:5173` → Frontend URL for CORS

### For MongoDB Atlas (Cloud Alternative)

If using MongoDB Atlas instead of local, use this format:

```env
MONGO_URI=mongodb+srv://username:password@cluster-name.mongodb.net/enterprise_workforce_management
```

Replace:
- `username` → Your MongoDB Atlas username
- `password` → Your MongoDB Atlas password
- `cluster-name` → Your cluster name from Atlas

---

## 🔧 STEP 5: Backend Installation & Setup

### Install Dependencies

```powershell
cd backend
npm install
```

**What gets installed:**
- `mongoose` → MongoDB object modeling
- `express` → Web framework
- `dotenv` → Environment variable loader
- Other dependencies (see backend/package.json)

### Verify MongoDB Connection

Test connection without seeding:

```powershell
npm run dev
```

**Expected output in terminal:**
```
MongoDB Connected: localhost
Server running on port 5000
```

If you see this ✅, MongoDB is connected successfully!

**Stop server:** Press `Ctrl+C`

---

## 🌱 STEP 6: Seed Sample Data (Optional but Recommended)

Populate the database with demo data (users, employees, projects, tasks, etc.)

```powershell
npm run seed
```

**Expected output:**
```
Database seeded successfully!
```

**Demo Credentials After Seeding:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@enterprise.com | Admin@123 |
| Manager | manager@enterprise.com | Manager@123 |
| Employee | employee@enterprise.com | Employee@123 |

---

## 🚀 STEP 7: Start the Full Application

### Terminal 1 - MongoDB (Keep Running)

```powershell
mongod --dbpath "C:\data\db"
```

Or if installed as service, ensure it's running:
```powershell
net start MongoDB
```

### Terminal 2 - Backend Server

```powershell
cd backend
npm run dev
```

Expected:
```
MongoDB Connected: localhost
Server running on port 5000
```

### Terminal 3 - Frontend Development Server

```powershell
cd frontend
npm install  # First time only
npm run dev
```

Expected:
```
  VITE v[version] ready in [time] ms

  ➜  Local:   http://localhost:5173/
```

---

## ✔️ STEP 8: Verify Complete Setup

### Check All Services Running

1. **MongoDB** → `mongosh` should connect without error
2. **Backend** → http://localhost:5000/api/health (if endpoint exists)
3. **Frontend** → http://localhost:5173 should load in browser

### Login to Application

1. Open browser → http://localhost:5173
2. Click Login
3. Use demo credentials:
   - Email: `admin@enterprise.com`
   - Password: `Admin@123`

If you see the dashboard ✅, **MongoDB is fully connected!**

---

## 🔍 Troubleshooting

### Problem: "MongoDB Connection Failed"

**Solution 1:** Ensure MongoDB is running
```powershell
Get-Service MongoDB  # Check status
net start MongoDB     # Start if not running
```

**Solution 2:** Check `MONGO_URI` in `.env`
- Should be: `mongodb://localhost:27017/enterprise_workforce_management`
- Verify MongoDB port is 27017 (default)

**Solution 3:** Check Windows Firewall
- MongoDB needs to communicate on port 27017
- Add MongoDB to Windows Firewall exceptions

### Problem: "EADDRINUSE :::5000" (Port 5000 in use)

Kill the process using port 5000:
```powershell
Get-Process | Where-Object { $_.Handles -match "5000" }
# Kill it:
Stop-Process -Id [PID] -Force
```

Or change PORT in `.env` to 5001, 5002, etc.

### Problem: "Cannot find module 'mongoose'"

Ensure you ran `npm install` in backend folder:
```powershell
cd backend
npm install
```

### Problem: "MONGO_URI is undefined"

Verify `.env` file exists at `backend/.env` with correct `MONGO_URI` line.

### Problem: Data doesn't persist after restart

Check that MongoDB data directory exists:
```powershell
Test-Path "C:\data\db"
```

If not, create it:
```powershell
New-Item -Path "C:\data\db" -ItemType Directory
```

---

## 📚 Additional Commands

| Command | Purpose |
|---------|---------|
| `mongosh` | Open MongoDB interactive shell |
| `mongosh --eval "db.version()"` | Check MongoDB version |
| `npm run seed` | Reset and reseed database |
| `npm run dev` | Start backend with hot-reload |
| `npm start` | Start backend (production) |

---

## ✨ Next Steps

After MongoDB is connected:

1. ✅ Create admin account & log in
2. ✅ Create departments
3. ✅ Add employees
4. ✅ Create projects & assign teams
5. ✅ Create tasks & track progress
6. ✅ View analytics & generate reports

---

**MongoDB Setup Complete!** 🎉

For issues or questions, check the main [README.md](README.md) file.
