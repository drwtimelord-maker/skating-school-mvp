# Skating School MVP – Feedback Feature

## Project Overview
This project is a class MVP for I-400 Vibe / AI Programming. The app is designed for a local skating school to replace paper-based tracking and manage session feedback digitally.

This MVP focuses specifically on the **Feedback feature**.

### Core user goals
**Instructors can:**
- log in
- view assigned classes
- open a class roster
- choose a student
- complete a level-based skill checklist
- mark pass / not yet
- add comments
- save feedback

**Admins can:**
- log in
- view submitted feedback reports
- filter/search reports
- open a printable report

---

## Technical Stack
- **Frontend:** React + Vite
- **Backend / Auth / Database:** Supabase
- **Repository:** IU GitHub Enterprise
- **AI tool used for development support:** Google Antigravity

---

## Current Project Status
The project currently includes:
- a React + Vite frontend scaffold
- Supabase authentication and database connection
- seeded MVP data for levels, skills, students, classes, and enrollments
- instructor dashboard page
- admin reports page
- role-based login flow
- early end-to-end testing in progress

At the current stage:
- the instructor dashboard loads the signed-in instructor name
- the dashboard shows an empty-state message when no classes are assigned
- the admin reports page loads and shows an empty-state message when no feedback reports have been submitted yet

This means the application structure and basic data wiring are working, but more feature completion is still needed for full instructor-to-report flow.

---

## Database Schema Summary
The database currently includes the following main tables:
- `profiles`
- `levels`
- `skills`
- `students`
- `classes`
- `class_instructors`
- `class_enrollments`
- `feedback_reports`
- `feedback_skill_results`

The schema also enables Row Level Security (RLS) across these tables and includes policies for authenticated read access and feedback submission behavior.

---

## Seed Data Summary
The current seed data includes:
- 2 skating levels
- multiple skills for each level
- 4 mock students
- 2 mock classes
- class enrollment mappings between students and classes

The current seed file does **not** include `class_instructors`, which means instructors must be manually assigned to classes in Supabase before they can see classes on the dashboard. This explains why the instructor dashboard may correctly render but still display "No classes assigned right now."

---

## Phase 2 AI Task List
The following Phase 2 tasks guide the remaining build work:

1. Connect the instructor dashboard to real assigned class data from Supabase.
2. Connect the class roster page to real enrolled student data.
3. Load the correct level-based skill checklist for the selected student/class.
4. Save a full feedback report and related skill results to Supabase.
5. Allow instructors to edit and update previously submitted feedback.
6. Build the admin reports page using real report data.
7. Add filtering and search to the admin reports page.
8. Build a printable report view for one submitted feedback report.
9. Add and run at least one unit test for a core project function.
10. Use AI as a security consultant to audit risks, vulnerabilities, and fixes.

These tasks are intentionally Phase 2-specific and do not include earlier Phase 1 setup work such as initial stack choice, initial Supabase connection, schema creation, or cost forecasting.

---

## Testing Roadmap
Testing for this MVP is organized into several stages.

### 1. Database Connectivity Testing
Verify that the React + Vite app connects successfully to Supabase using local environment variables.

**Success criteria**
- no Supabase connection errors in the browser console
- at least one page loads live database data
- frontend data matches Supabase Table Editor

### 2. Authentication Testing
Verify that users can sign up and log in through Supabase Auth.

**Success criteria**
- user appears in **Authentication > Users**
- matching row appears in `public.profiles`
- valid login works
- invalid login shows a clear error message

### 3. Role-Based Redirect Testing
Verify that users are redirected correctly based on role after login.

**Success criteria**
- instructor is redirected to `/instructor`
- admin is redirected to `/admin/reports`
- users without a valid profile are blocked or shown an error

### 4. Instructor Workflow Testing
Verify the main instructor workflow:
- instructor views assigned classes
- instructor opens a class roster
- instructor selects a student
- correct level-based skills load
- instructor marks skill results, adds comments, and sets overall pass/not yet
- instructor saves feedback

**Success criteria**
- class list matches assignments in Supabase
- roster matches enrollment data
- skill checklist matches the correct level
- submitting feedback creates one row in `feedback_reports` and related rows in `feedback_skill_results`

### 5. Admin Reports Testing
Verify the admin reporting flow.

**Success criteria**
- admin can view submitted reports
- search or filter updates displayed results correctly
- printable report shows student, class, instructor, comments, overall result, and skill results

### 6. Security / Access Testing
Manually verify that access rules work correctly.

**Success criteria**
- unauthenticated users cannot access protected pages or restricted data
- instructors can create feedback
- non-logged-in users cannot submit feedback
- unauthorized actions are blocked by Supabase policies

### 7. Unit Testing
At least one unit test will be implemented for a core function.

**Planned options**
- role-to-route mapping helper
- feedback form validation helper
- skill result payload formatter

**Success criteria**
- test runs from the terminal
- test passes consistently
- screenshot of the passing test is included in the submission

### 8. End-to-End Demo Testing
The full demo flow should include:
- sign up a new instructor
- show the user in Supabase Auth
- show the matching row in `profiles`
- log in as instructor
- open assigned class
- open roster
- select a student
- submit feedback
- show saved rows in `feedback_reports` and `feedback_skill_results`
- log in as admin
- open the submitted report in admin view

**Success criteria**
- core pages work without crashing
- database changes are visible in Supabase
- the workflow proves UI, auth, and database integration

---

## Cost Analysis
The MVP cost estimate assumes:
- **Frontend Hosting:** Vercel
- **Backend / Database / Auth:** Supabase
- **Storage:** Supabase Storage

Because the MVP mainly stores text-based data rather than large media files, storage costs are expected to remain low at smaller scales. Costs could increase later if the app adds uploaded images, documents, or video feedback. The estimate assumes 10 requests per user per month.

| Metric | 500 Users | 5,000 Users | 50,000 Users |
| --- | --- | --- | --- |
| Traffic | 5,000 reqs | 50,000 reqs | 500,000 reqs |
| Frontend Hosting (Vercel) | $0 | $0–$20 | $20+ |
| Backend / DB / Auth (Supabase) | $0 | $25 | $25+ |
| Storage (Supabase Storage) | $0 | $0 | low, but could grow |
| **Estimated Total** | **$0/mo** | **$25–$45/mo** | **$45+/mo** |

---

## Current Gaps / Remaining Work
The main remaining work before the feature feels complete includes:
- assigning instructors to classes in `class_instructors`
- loading class rosters from Supabase
- loading the correct skill checklist by level
- saving feedback into `feedback_reports`
- saving skill results into `feedback_skill_results`
- populating admin reports with real submitted data
- adding printable report support
- adding at least one working unit test
- documenting security risks and fixes

---

## Security Notes
This app handles school feedback and role-based access, so it must protect:
- profile and class access
- report visibility
- feedback submission permissions

For this MVP, security checks rely mainly on:
- Supabase authentication
- role-based routing
- Supabase Row Level Security policies
- manual testing of blocked access and protected pages

A full Phase 2 security review will include realistic domain-specific risks, AI-assisted vulnerability review, and documented fixes.

---

## Local Development
Typical local commands for this project:

```bash
npm install
npm run dev
npm run build
npm run preview
```