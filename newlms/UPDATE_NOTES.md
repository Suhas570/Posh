# NewLMS Academy — Update Notes (July 2026)

## 1. Certificate watermark — fixed
`backend/src/services/certificatePdfRenderer.ts`

- Removed the big centered **"VERIFIED BY NEWLMS ACADEMY"** watermark.
- The diagonal tiled watermark that repeats the **full Certificate ID**
  (e.g. `LMS-2026-JAVA-000001`) across the entire page is now the certificate's
  only watermark, and it's slightly bolder/denser so it's clearly visible.

No frontend changes were needed for this — the PDF is generated entirely on
the backend.

## 2. Common home page + role-based login — new

There's now a single entry point for everyone: **`frontend/home`** (a new
small app, runs on **port 5169**).

- It shows a landing page with a **Login** button.
- The login form calls the existing `POST /api/auth/login` endpoint.
- Based on the `role` the backend returns, it redirects the browser straight
  into the correct dashboard app:
  - `ADMIN` → Admin app (port 5175)
  - `TUTOR` / `HR` → Tutor app (port 5174)
  - `STUDENT` / `CANDIDATE` → Student app (port 5173)
- The session (JWT + user info) is handed off via a one-time `/auth/callback`
  URL that each target app reads and stores in its own `localStorage`
  (`token` / `user` keys — the same keys the Student/Tutor API clients
  already expected).

Each dashboard app now has:
- `src/pages/auth/AuthCallback.jsx` — receives and stores the session.
- `src/components/auth/ProtectedRoute.jsx` — if there's no valid session,
  it sends the visitor back to `http://localhost:5169/login` instead of
  showing a fake default user.
- A real `AuthContext` — no more hardcoded "Manoj / Instructor" mock user.
  `logout()` now actually clears the session and returns you to the home app.

The **Admin app** previously had no login/auth wiring at all — that's been
added from scratch, plus a bug fix: most admin pages were calling the API on
port `5000` while the backend actually runs on `5001` (see `backend/.env`),
so those calls were silently failing. All admin API calls are now
authenticated and hit the correct port.

## 3. Demo accounts (seeded automatically on backend startup)

| Role    | Email               | Password   | Lands on        |
|---------|----------------------|------------|------------------|
| Admin   | admin@test.com        | password   | Admin app (5175) |
| Tutor   | hr@test.com            | password   | Tutor app (5174) |
| Student | candidate@test.com     | password   | Student app (5173) |

The home page login form has one-tap buttons that fill these in for you.

## 4. Running everything locally

```bash
# 1. Backend (port 5001)
cd newlms/backend
npm install
npm run dev

# 2. Each frontend, in its own terminal
cd newlms/frontend/home    && npm install && npm run dev   # http://localhost:5169
cd newlms/frontend/admin   && npm install && npm run dev   # http://localhost:5175
cd newlms/frontend/tutor   && npm install && npm run dev   # http://localhost:5174
cd newlms/frontend/student && npm install && npm run dev   # http://localhost:5173
```

Then open **http://localhost:5169** — that's the one link you give out.
Everyone logs in there and gets routed to their own dashboard.

> Note: `newlms/frontend` (root, port 5172) is the original combined
> tutor+student prototype that predates the admin/tutor/student split. It
> still works standalone but isn't part of the new login flow — the
> `tutor`, `student`, and `admin` folders are the ones to use going forward.

## 5. Deploying beyond localhost

If you move off localhost ports, set these Vite env vars per app instead of
editing code:
- `frontend/home`: `VITE_API_BASE_URL`, `VITE_ADMIN_URL`, `VITE_TUTOR_URL`, `VITE_STUDENT_URL`
- `frontend/{admin,tutor,student}`: `VITE_HOME_URL`
