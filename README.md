# 🚆 Railway Operations & Compliance Management System

A centralized **MERN Stack** web application designed to digitize railway operational workflows, replacing manual paperwork with a secure, role-based digital platform.

The system enables railway personnel to manage driver information, circular acknowledgements, trainings, road learning records, abnormality reports, issue tracking, compliance monitoring, and operational dashboards through a unified interface.

---

# ✨ Features

## 🔐 Authentication & Authorization

* Secure JWT-based authentication
* Role-Based Access Control (RBAC)
* Protected routes
* Persistent login sessions
* Secure API authorization

---

## 👥 User Roles

### 🚉 Administrator

* Manage users
* Manage depots
* View operational dashboards
* Monitor compliance status
* Track overdue trainings
* Track LR (Road Learning) expiry
* Circular management
* Issue management
* Abnormality monitoring
* Reports & analytics

---

### 👨‍💼 Depot Manager

* Manage drivers within assigned depot
* Monitor acknowledgements
* View depot dashboard
* Track pending activities
* Review abnormalities
* Review operational issues

---

### 🚆 Driver

* Update profile
* View assigned circulars
* Acknowledge circulars
* Maintain Road Learning (LR)
* Update training records
* Report abnormalities
* View personal dashboard

---

# 📊 Modules

* User Management
* Authentication
* Driver Profile Management
* Circular Management
* Circular Acknowledgement
* Training Management
* Road Learning (LR)
* Operational Dashboard
* Depot Dashboard
* Issue Tracking
* Abnormality Reporting
* Overdue Monitoring
* PDF Viewer
* Notifications
* Reports

---

# 🛠 Tech Stack

## Frontend

* React 19
* Vite 7
* Tailwind CSS 4
* React Router DOM
* Axios
* SweetAlert2
* Lucide React
* React PDF Viewer
* Vite PWA

---

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcryptjs
* Multer
* Cloudinary
* Multer Storage Cloudinary
* Axios
* CORS
* Dotenv

---

# 📁 Project Structure

```
Railways-backend/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

# ⚙️ Prerequisites

Before running the application, ensure the following are installed:

* Node.js (v18 or later recommended)
* npm
* MongoDB
* Cloudinary Account (for file storage)

---

# 🚀 Installation

## 1. Clone Repository

```bash
git clone <repository-url>
cd Railways-backend
```

---

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

# 🔧 Environment Configuration

Both frontend and backend include a `.env.example` file.

Copy them before running the application.

Backend

```bash
cd backend
cp .env.example .env
```

Frontend

```bash
cd frontend
cp .env.example .env
```

Fill in your own credentials and configuration values.

> **Do not commit your ****`.env`**** files to version control.**

---

# ▶️ Running the Project

## Backend

```bash
cd backend
npm run dev
```

---

## Frontend

```bash
cd frontend
npm run dev
```

---

The application will be available on your configured frontend URL (typically `http://localhost:5173` during development).

---

# 📦 Available Scripts

## Frontend

```bash
npm run dev
```

Runs the development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run preview
```

Previews the production build.

```bash
npm run lint
```

Runs ESLint.

---

## Backend

```bash
npm run dev
```

Starts the backend server.

---

# 🔐 Security Features

* JWT Authentication
* Password Hashing using bcrypt
* Protected API Routes
* Role-Based Authorization
* Secure File Uploads
* Environment Variable Configuration
* CORS Protection

---

# ☁️ File Storage

The application supports secure document and file uploads using:

* Cloudinary
* Multer
* Multer Storage Cloudinary

---

# 📄 PDF Support

The frontend includes integrated PDF viewing capabilities for operational documents and circulars.

---

# 📱 Progressive Web App (PWA)

The frontend is configured with Vite PWA support, allowing installation on supported devices for an improved user experience.

---

# 📈 Core Functionalities

* Driver Management
* Depot Management
* Circular Distribution
* Circular Acknowledgement Tracking
* Training Compliance
* Road Learning Records
* Operational Issue Tracking
* Abnormality Reporting
* Dashboard Analytics
* Role-Based Access
* Secure Document Storage

---

# 🧪 Development Workflow

1. Start MongoDB
2. Configure environment variables
3. Start backend server
4. Start frontend server
5. Login with appropriate role
6. Access role-specific dashboards and modules

---

# 🚀 Future Enhancements

* Email Notifications
* SMS Notifications
* Real-time Alerts
* Audit Logs
* Advanced Analytics
* Mobile Application
* Offline Support
* Multi-language Support
* Export Reports (PDF/Excel)
* Push Notifications

---

# 🤝 Contributing

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push the branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📄 License

This project is intended for educational and organizational use. Add an appropriate license if you plan to distribute it publicly.
Currently authorized with Indian Railways & Indian Tower Wagon Management System.

---

# 👨‍💻 Author

**Sudharshan R**

Full Stack MERN Developer

* React.js
* Node.js
* Express.js
* MongoDB

---

## ⭐ If you found this project useful, consider giving it a star on GitHub.
 