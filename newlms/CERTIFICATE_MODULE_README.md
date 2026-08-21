# Certificate Module — Setup Notes

This upgrade extends the existing LMS in place. No new project was created.

## 1. Install new backend dependencies
```
cd backend
npm install
```
(pdfkit, qrcode, bwip-js and their types were added to backend/package.json.)

## 2. Apply the schema changes
The Prisma schema (`backend/prisma/schema.prisma`) was extended with:
`Certificate`, `CertificateSequence`, `CertificateVerificationLog`,
`CertificateDownloadLog`, `CertificateAuditLog`, plus relations on `User`
and `ExamResult`.

Run, with network access to your MongoDB Atlas cluster:
```
npx prisma generate
npx prisma db push
```
(This sandbox had no network access to Prisma's binary CDN, so this could
not be executed here — the schema is hand-verified for syntax correctness
and follows the same conventions as the existing models.)

## 3. Environment variables (backend/.env — already added)
```
CERT_SECRET=change-this-certificate-signing-secret-in-production
CERT_VERIFY_BASE_URL=http://localhost:5173/verify-certificate
API_PUBLIC_BASE_URL=http://localhost:5001
ORGANIZATION_NAME=NewLMS Academy
```
Change `CERT_SECRET` to a strong random value in production — it's the
HMAC key that signs every certificate's tamper-detection fingerprint.

## 4. How it fits into the existing architecture
The codebase has two parallel systems:
- A JSON-cache-backed course/tutor/admin content manager (no real auth).
- A Prisma + MongoDB + JWT-based HR/CANDIDATE assessment system
  (`/api/auth`, `/api/hr`, `/api/candidate`), with `ExamResult` as the only
  concrete "course completion" signal in the codebase.

Certificates are issued automatically the moment an `ExamResult` is created
with `passFail = PASS` (hooked into both `/api/candidate/exam/submit` and
`/api/candidate/exam/auto-submit`). `Test.title` is treated as the
course/assessment name and the HR user who created the test is the trainer.

## 5. New/changed backend endpoints
- `GET  /api/certificates/my` (CANDIDATE) — list my certificates
- `GET  /api/certificates/:id` (CANDIDATE) — certificate detail
- `GET  /api/certificates/:id/download` (CANDIDATE) — download PDF, logs the download
- `GET  /api/verify/:certificateId?fp=...` (public) — verify a certificate
- `GET  /api/admin/certificates/stats` (HR) — dashboard totals
- `GET  /api/admin/certificates` (HR) — search/filter/paginate
- `GET  /api/admin/certificates/verification-logs` (HR)
- `GET  /api/admin/certificates/download-logs` (HR)
- `GET  /api/admin/certificates/:id` (HR) — detail + audit trail
- `POST /api/admin/certificates/generate/:examResultId` (HR) — manual/backfill issuance
- `PUT  /api/admin/certificates/:id/revoke` (HR)

## 6. Frontend
- `frontend/student/src/pages/student/Certificates.jsx` — real API-backed
  student certificate list, view, and download (was previously mocked).
- `frontend/student/src/pages/public/VerifyCertificate.jsx` — public
  verification page at `/verify-certificate/:certificateId`, matching the
  QR code embedded in every certificate.
- `frontend/admin/src/pages/admin/CertificatesAdmin.jsx` — Admin Dashboard
  tab at `/admin/certificates`: stats, search/filter, verification logs,
  download logs, revoke action.

**Auth note:** the existing student/admin frontends use a mock, non-JWT
auth context — there is no CANDIDATE/HR login screen wired into the UI yet.
The new pages expect a JWT under `localStorage['lms_candidate_token']`
(student) or `localStorage['lms_hr_token']` (admin), obtained from
`POST /api/auth/login`. Until a real login screen is added, you can set
these manually in the browser console for testing, or wire them into
whatever login flow you build next. Both pages detect a missing token and
show a clear "sign in required" state rather than failing silently.

## 7. Verified in this sandbox
- Backend TypeScript compiles cleanly (`npx tsc --noEmit`) — no errors in
  any new certificate file.
- `frontend/student` and `frontend/admin` both `npm run build` successfully
  with all new/changed files included.
- `node_modules` and `dist` folders were removed before zipping to keep the
  download small — run `npm install` in `backend/`, `frontend/student/`,
  and `frontend/admin/` before running the app.
