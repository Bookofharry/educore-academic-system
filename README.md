# EduCore Academic Management System

![EduCore](https://img.shields.io/badge/Status-Prototype-blue) ![React](https://img.shields.io/badge/React-18.x-blue) ![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC)

EduCore is a modern, responsive, frontend-only prototype of a university academic management system. It relies entirely on browser **Local Storage** for data persistence, making it incredibly easy to demo and test without needing to set up a backend database.

## 🚀 Core Features

- **Intelligent Risk Analytics**: A deterministic engine that analyzes student performance histories to detect downward trends and generate academic risk scores (Low, Moderate, High, Critical).
- **Role-Based Access Control (RBAC)**: Distinct, secure portals tailored for **Administrators**, **Lecturers**, and **Course Advisers**. Permissions ensure data integrity across all operations.
- **Result Management**: Streamlined entry for Continuous Assessment (CA) and Exam scores. Features automatic calculations for Grades, GPA, CGPA, and pass/fail statuses.
- **Student Profiles**: A 360-degree view of every student, compiling registration data, semester histories, risk levels, and adviser recommendations.
- **Data Management (Backup/Restore)**: Because the app runs on Local Storage, Admins can export the entire database as a JSON backup file and restore it at any time.

## 🛠️ Technology Stack

- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Storage**: Browser `localStorage` (via custom `storageService`)
- **Routing**: React Router DOM

## 📦 Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Bookofharry/educore-academic-system.git
   cd educore-academic-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Login Accounts (Default Seed Data)**
   Upon first load, the system will automatically seed default accounts:
   - **Admin**: `admin@university.edu` (Pass: `admin123`)
   - **Lecturer**: `lecturer@university.edu` (Pass: `lecturer123`)
   - **Course Adviser**: `adviser@university.edu` (Pass: `adviser123`)

## 📱 Mobile Responsiveness
The UI has been rigorously designed with a "mobile-first" approach. Complex data tables feature horizontal scroll containers, forms stack perfectly, and the sidebar transitions to a smooth off-canvas drawer on smaller screens.

## ⚠️ Disclaimer
This is a frontend prototype. Data is strictly stored in the browser's `localStorage`. Clearing your browser cache or performing a "Factory Reset" from the Settings page will permanently wipe the data unless backed up.
