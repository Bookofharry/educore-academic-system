# System Documentation
**Intelligent School Management System for Academic Administration**

## 1. Project Architecture
This application is designed as a fully functional, frontend-only prototype for an intelligent academic administration system. It strictly adheres to constraints that prohibit the use of traditional backends (Node.js/Express, Firebase, PostgreSQL, MongoDB, etc.).

**Core Technologies:**
- React (Vite)
- Tailwind CSS (v4)
- React Router (DOM Navigation)
- Lucide React (Iconography)
- Recharts (Data Visualization)
- jsPDF & jspdf-autotable (PDF Report Generation)
- React Hook Form (Form Validation)

## 2. Major Modules
The system is divided into sequential logic phases:
- **Core Admin (Phase 2):** Departments, Academic Sessions, Lecturers, Students, Courses.
- **Operations (Phase 3):** Course Allocation (Lecturer assignment), Course Registration (Student assignment), Attendance Management.
- **Academic Results (Phase 4):** Result Entry, Result Viewing, and Academic Records rendering based on dynamic calculations.
- **Intelligent Analytics (Phase 5):** Recharts-driven performance graphs and deterministic Risk Score engine.
- **Interventions (Phase 6):** Recommendation Engine and Printable Intervention Plans.
- **Reports (Phase 7):** PDF generation of Master Result Sheets and Risk Summaries.

## 3. Local Storage Architecture
Because the system cannot use an external database, all state persists strictly via the browser's `localStorage` API. 
The abstraction is handled by `src/services/storage.js` (`storageService`).

**Design principles applied:**
- **Entity Integrity:** Every record is assigned a `crypto.randomUUID()`.
- **Relational Mapping:** Foreign keys are used extensively. For example, a student record contains `departmentId` rather than a hard-coded department name. This allows for dynamic resolution and prevents data staleness if a department's name changes.
- **Safe Fallbacks:** If a referenced entity is deleted (e.g., a student's course is deleted), the UI safely falls back to "Unknown" or "N/A" rather than crashing.

## 4. GPA/CGPA Logic
All academic calculations execute deterministically in real-time from `src/utils/academicCalculations.js`. No values are faked.

**Grading Scale (Strict):**
- 70–100 = A = 5 points
- 60–69 = B = 4 points
- 50–59 = C = 3 points
- 45–49 = D = 2 points
- 40–44 = E = 1 point
- 0–39 = F = 0 points

**Formulas:**
- `Total Score = CA Score (max 40) + Exam Score (max 70)`
- `Quality Point (QP) = Grade Point × Course Credit Unit`
- `GPA = Total Quality Points / Total Registered Credit Units`
- `CGPA` uses the exact same formula applied across all historical semesters.

## 5. Risk Prediction Algorithm
The risk engine (`src/utils/riskEngine.js`) identifies students who are struggling. It runs purely on mathematical algorithms, bypassing "black box" AI to ensure explainability.

**Scoring Matrix (Max 100 points):**
- **CGPA Risk (Max 35 pts):** Scales based on how low the CGPA falls beneath 2.5.
- **Failed Courses (Max 25 pts):** Triggered if a student fails 1 to 4+ courses.
- **Declining GPA Trend (Max 15 pts):** Triggered if the most recent semester's GPA is significantly lower than the preceding semester.
- **Attendance Deficit (Max 15 pts):** Triggered if a student falls below the standard 75% mandate.
- **Continuous Assessment (Max 10 pts):** Triggered if average CA falls dangerously low, predicting exam failure.

**Classification:**
- **0–24**: LOW RISK
- **25–49**: MODERATE RISK
- **50–74**: HIGH RISK
- **75–100**: CRITICAL RISK

## 6. Recommendation Logic
The recommendation engine (`src/utils/recommendationEngine.js`) maps the specific triggers from the Risk Algorithm to actionable strategies.
- **CGPA/Failed Course Trigger** -> Recommendation: Probation Recovery Program & Course Retakes.
- **Attendance Trigger** -> Recommendation: Weekly Attendance Monitoring.
- **Overall Critical Level** -> Recommendation: Mandatory Academic Counseling & Credit Load Reduction.

These recommendations populate the printable Intervention Plan in the Student Detail module.

## 7. Main Application Workflow
1. **Setup:** Admin creates Departments, Lecturers, Courses, and Academic Sessions.
2. **Onboarding:** Admin adds Students and registers them to Courses.
3. **Execution:** Lecturers mark Attendance and enter Results (CA + Exam).
4. **Analysis:** The system automatically calculates CGPAs, builds trend graphs, and computes Risk Scores.
5. **Intervention:** Advisers review the Risk Analytics dashboard, isolate struggling students, and print their auto-generated Intervention Plans.
6. **Reporting:** Admin downloads official PDF reports of results and risk distributions.

## 8. Limitations of Using Local Storage
While effective for this academic prototype, relying solely on `localStorage` has inherent limitations:
- **Storage Cap:** Browsers typically limit storage to 5MB–10MB per origin, which will quickly deplete as student result records and attendance logs scale.
- **Security:** Data is stored in plain text, making it vulnerable to XSS attacks and exposing sensitive academic records to anyone with access to the browser session.
- **Volatility:** Clearing browser data/cache completely erases the database.
- **Concurrency:** It cannot sync data across multiple administrative users simultaneously; each browser instance contains an isolated silo of data.
