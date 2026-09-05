<!-- current_1.0.md — Role inventory + full audit snapshot. Generated 2026-09-06. -->

# VerticalGate — Current State Report & Audit (v1.0)

**Date:** 2026-09-06
**Scope:** Role model, per-role dashboards, backend correctness, permission model, UI/UX.
**Codebase:** `main` @ `61ab0b9`

Severity legend: 🔴 Critical (broken / security) · 🟠 High (wrong data or missing guard) · 🟡 Medium (fragile / inconsistent) · 🔵 Low (polish)

---

## PART 1 — Role & Dashboard Inventory

### 1.1 How many roles

**4 roles**, defined in `app/models/user.py` (`UserRole` enum), mirrored in `frontend/types/index.ts`:

| Enum value | UI name(s) | Intended count | Landing route | Frontend page |
|---|---|---|---|---|
| `super_admin` | Super Admin | 1 | `/admin` | `app/(dashboard)/admin/page.tsx` |
| `super_teacher` | Super Teacher / Venture Director / "Council" | ~5 | `/super-teacher` | `app/(dashboard)/super-teacher/page.tsx` |
| `lead_teacher` | Lead Teacher / Shift Supervisor | 8–10 | `/lead-teacher` | `app/(dashboard)/lead-teacher/page.tsx` |
| `elite_user` | Elite User / Assistant Teacher / Elite Scout | ~110 | `/elite` | `app/(dashboard)/elite/page.tsx` |

`Member` (student proposing a domain idea) is a **DB entity, not a login role**. `BatchType` = `morning | afternoon | evening` (shift), stored on `User`, only meaningful for `elite_user` and `lead_teacher`.

Backend access is **hierarchical / additive** (`app/core/dependencies.py`):

- `require_super_admin` → `super_admin`
- `require_super_teacher` → `super_admin`, `super_teacher`
- `require_lead_teacher` → `super_admin`, `super_teacher`, `lead_teacher`
- `require_elite_user` → all four

### 1.2 What each role sees

#### 🟤 Elite User (Assistant Teacher) — `/elite`
- **APIs:** `GET /members`, `GET /evaluations` — **scoped to their own records** (`member_service.get_my_members`, forced for `ELITE_USER` in `members_router.list_members`).
- **Sees:** header "Scout Terminal · Assistant Teacher" + shift badge; KPI strip (*My Candidates*, *AI Evaluated*, *Good to Go*, *Evaluation Throughput %*); search + status filter pills (All / Eligible / Service Domain / Parked / Pending); candidate cards (grid/list) with domain, experience, phone, screen/tests scores, beachhead line; actions — **Quick Intake** dialog, **Run AI** per candidate, delete, open dossier; link to Leaderboard.
- **Gate:** redirected to `/select-batch` if `batch` unset.
- **Nav:** Home, Candidates, Add Candidate, Leaderboard.

#### 🟢 Lead Teacher (Shift Supervisor) — `/lead-teacher`
- **APIs:** `GET /users` (all users), `GET /members` (**all members**), `GET /evaluations`, `POST /ai/query`.
- **Sees:** "Cohort Oversight Portal"; **"Ask Cohort AI Assistant"** NL query card (rate-limited); cohort stats (*Supervised Elite Users*, *Total Members Collected*, *Avg Members per Elite*); searchable **accordion of every `elite_user`**, each expandable to that scout's candidate profiles + eval scores/outcomes; links to "All Candidates Registry" (`/elite`) and "Teacher Leaderboard".
- **Gate:** also redirected to `/select-batch` if `batch` unset.
- **Nav:** Home, Candidates, Add Candidate, Leaderboard, **Teacher Portal**.
- ⚠️ Shows **all** elite users and **all** members — no filtering to an assigned cohort/shift (see ROLE-1).

#### 🟠 Super Teacher (Council) — `/super-teacher`
- **APIs:** `GET /users`, `GET /members`, `GET /evaluations`, `GET /leaderboard/teachers`, `GET /admin/stats`.
- **Sees:** "Super Teacher Council" header; KPI strip (*Super Teachers*, *Lead Teachers*, *Assistant Teachers*, *Total Candidates*, *Good to Go rate %*); **recharts "Shift Performance Breakdown"** (Candidates / Evaluated / Eligible × Morning/Afternoon/Evening); **Lead Teacher Standings** list; **"Good to Go" Qualified Verticals tracker** (filter by shift + search, beachhead recs); **Executive AI Data Query console** with suggested prompts.
- **Nav:** Home, Candidates, Add Candidate, Leaderboard, **Super Oversight**.
- ⚠️ `GET /admin/stats` is `require_super_admin` only → Super Teacher gets **403** (see BE-2).

#### 🔴 Super Admin — `/admin` (+ `/admin/users`)
- **APIs:** `GET /admin/stats`, `GET /admin/rate-limits`; `/admin/users` uses `GET /users`, `PATCH /users/{id}/role`, `PATCH /admin/users/{id}/toggle-active`.
- **Sees on `/admin`:** "Super Admin Headquarters / Platform Control Center"; system metrics (*Registered Users*, *Active Elite Users*, *Collected Members*, *Total AI Evaluations*); **AI Agent Rate Limits** card (Elite 10/day, Lead Teacher 5/30 min); **AI Provider Failover** card (Gemini 2.0/2.5 Flash primary, OpenRouter Llama 3.1 8B fallback); "Manage Users & Roles" button.
- **Sees on `/admin/users`:** full user list (email, join date, shift), **role dropdown** (elite → lead → super_teacher → super_admin), **Suspend / Activate** toggle.
- **Nav:** Home, Candidates, Add Candidate, Leaderboard, **Admin HQ**, **Users & Roles**. Inherits every other surface.

#### Shared surfaces (all roles)
- `/elite/leaderboard` — tabs: Global Elite, Morning / Afternoon / Evening, Lead Teachers. Podium + table. Data from `/leaderboard/elite` + `/leaderboard/teachers` (queried directly, so these are correct).
- `/elite/members/[id]` — full evaluation dossier (elite limited to own).
- `/elite/members/new` — add candidate.
- `/select-batch` — shift picker (elite + lead).

---

## PART 2 — Backend Audit

### 🔴 BE-1 · `GET /evaluations` ignores role — teacher dashboards get near-empty evaluation data
`app/services/evaluation_service.py::get_my_evaluations()` always calls `crud_member.get_by_elite_user(db, current_user.id)` regardless of role. For a `lead_teacher` / `super_teacher` that returns the members **they personally collected** (normally none), so `GET /evaluations` returns `[]`.
**Impact:** On `/lead-teacher` and `/super-teacher`: every candidate renders "Pending", *AI Evaluated* = 0, *Good to Go* = 0, the recharts *Evaluated*/*Eligible* bars are flat 0, and the "Good to Go" tracker shows its empty state. This is the single most visible break in the product.
**Fix:** branch by role — `ELITE_USER` → own members' evals; `LEAD_TEACHER` → assigned cohort's evals (via `TeacherAssignment`, once that is wired); `SUPER_TEACHER` / `SUPER_ADMIN` → all evals. Add a `crud_evaluation.get_all()` / `get_by_member_ids()` to avoid the current N+1.

### 🟠 BE-2 · `/super-teacher` calls a Super-Admin-only endpoint
`super-teacher/page.tsx` fetches `GET /admin/stats`, but `admin_router.system_stats` depends on `require_super_admin`. Super Teacher → **403** on every dashboard load (failed request + console error). The value is currently written to unused `stats` state, so the UI degrades silently, but it is still wrong.
**Fix:** either add a `require_super_teacher` stats endpoint (e.g. `GET /stats/overview`) or gate the fetch client-side by role. The KPI strip should stop relying on hardcoded `|| 5` fallbacks once a real endpoint exists.

### 🔴 BE-3 · No real email verification
`User.is_email_verified` (`default=False`) exists on the model and in the TS types but is **never checked** — not in `auth_service.login`, not in any dependency. Accounts are usable the instant they are created. Email is effectively an unverified free-text field.
**Fix:** see PART 5.

### 🔴 BE-4 · Registration trusts the client-supplied `role`
`app/schemas/auth.py::RegisterRequest.role` defaults to `ELITE_USER` but the **caller controls it**. `auth_service.register` passes it straight to `crud_user.create`. A raw `POST /api/v1/auth/register` with `{"role": "super_admin"}` creates a Super Admin. The frontend only *cosmetically* omits `super_admin` from its dropdown.
**Fix:** ignore `role` on registration (always create `elite_user` or `PENDING`), and set role only via the approval flow (PART 6) or `PATCH /users/{id}/role`.

### 🔴 BE-5 · New accounts are immediately active — no approval gate
`crud_user.create` sets `is_active=True` implicitly (model default). There is no `pending` state. Anyone who registers can log in right away.
**Fix:** see PART 6.

### 🟠 BE-6 · Secrets default to insecure dev values
`app/core/settings.py`: `SECRET_KEY = "dev-secret-change-in-production"`, `DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/db"`. If `SECRET_KEY` is not set in the deploy env, **all JWTs are forgeable**.
**Fix:** fail fast on startup if `APP_ENV == "production"` and `SECRET_KEY` is the default; document required env vars.

### 🟠 BE-7 · No throttling on `/auth/login` or `/auth/register`
`app/middleware/rate_limiter.py` is not wired in `main.py` (only `RequestLoggerMiddleware` is added). Login is open to brute force / credential stuffing.
**Fix:** add IP-based rate limiting on auth routes (slowapi / custom middleware), or rely on Supabase Auth (PART 5) which brings its own.

### 🟡 BE-8 · Broad CORS on `*.vercel.app` with credentials
`main.py`: `allow_origin_regex=r"https://.*\.vercel\.app"` + `allow_credentials=True`. Any Vercel-hosted site can make credentialed calls.
**Fix:** pin to the actual frontend domain(s); keep the regex only for preview deploys, ideally scoped to the project prefix.

### 🟡 BE-9 · N+1 queries in leaderboards and evaluations
`leaderboard_service.get_elite_leaderboard` runs ~3 count queries **per elite user** (~330 sequential queries at 110 users); `get_teacher_leaderboard` loops per-assignment; `get_my_evaluations` runs one query per member. `user_service.get_stats` pulls `get_all(limit=10000)` and does `len()` in Python instead of `SELECT count(*)`.
**Fix:** single `GROUP BY` aggregate queries; `func.count()` for totals.

### 🟡 BE-10 · Refresh-token handling is thin
`fetchWithAuth` (frontend) refreshes once on 401 but never re-checks the retried response and never redirects to `/login` on refresh failure (the comment says it should). Backend `auth_service.refresh` rotates tokens but has **no revocation list / token version**, so a leaked refresh token is valid for 7 days unless the user is deactivated.
**Fix:** add `token_version` on `User`, bump on password change / forced logout; redirect to `/login` on refresh failure.

### 🟡 BE-11 · Shift attribution is derived and mutable
Members have no `batch` of their own; shift is read live from `member.elite_user_id → user.batch`. If an Elite User changes shift (via `/select-batch`, which has no "already set" guard), **all their historical members and evaluations retroactively move shifts**, silently rewriting every shift chart and shift leaderboard.
**Fix:** snapshot `batch` onto `Member` at creation; make shift change an admin action or lock it after first set.

### 🔵 BE-12 · Minor
- `/health` returns `primary_model` / `fallback_model` names publicly (info disclosure).
- `ActivityLog` model exists but nothing writes to or reads it — no audit trail.
- `bcrypt` silently truncates passwords to 72 bytes.
- `get_current_user` does not compare the token's `role` claim to the live DB role (backend `require_roles` uses the DB value, so this is safe today, but any future code trusting the claim would be stale for up to `ACCESS_TOKEN_EXPIRE_MINUTES` = 60).

---

## PART 3 — Role & Permission Audit

### 🟠 ROLE-1 · No per-cohort / per-shift scoping anywhere
`TeacherAssignment` (lead_teacher_id ↔ elite_user_id) is used **only** by `leaderboard_service.get_teacher_leaderboard`. Dashboard data access never consults it:
- `/lead-teacher` fetches **all** users and **all** members, then filters `role === "elite_user"` **client-side**.
- `/super-teacher` also fetches all users + all members.

Net effect: **Lead Teacher and Super Teacher have identical data visibility.** The only difference is presentation. A Lead Teacher can inspect every scout in every shift, not just their assigned cohort.
**Fix:** scope `list_members` / `list_users` / evaluations by `TeacherAssignment` for `LEAD_TEACHER`; keep `SUPER_TEACHER`/`SUPER_ADMIN` global.

### 🟠 ROLE-2 · Frontend pages have no role guard
`app/(dashboard)/layout.tsx` checks only *authenticated* + *has batch*. An `elite_user` can navigate to `/super-teacher`, `/admin`, `/admin/users` and the page chrome renders. Backend 403s blank out the data, so it is not a **leak**, but the user sees a broken-looking "Super Admin Headquarters" with zeros instead of a redirect or 404.
**Fix:** add a role→allowed-routes check in the dashboard layout (or per-page), redirecting to the user's own landing route.

### 🟠 ROLE-3 · Public registration exposes elevated roles
`register/page.tsx` dropdown offers "Lead Teacher (Shift Supervisor)" and "Super Teacher (Venture Director)" as self-select options, and the backend honours them (BE-4). Directly contradicts the approval model you want.
**Fix:** PART 6.

### 🟡 ROLE-4 · `GET /users` returns everything to `lead_teacher`+
`users_router.list_users` (dep `require_lead_teacher`) returns every user's `email`, `role`, `batch`, `created_at`, `is_active` with no field filtering. Fine for an internal tool, but a Lead Teacher gets the full Super Admin / Super Teacher roster and emails.
**Fix:** return a reduced shape for non-admins, or scope to the caller's cohort (ties to ROLE-1).

### 🟡 ROLE-5 · Self-demotion / last-admin lockout
`PATCH /users/{id}/role` (super_admin) has no guard against the only Super Admin demoting themselves or being deactivated.
**Fix:** block role change / deactivate when it would leave zero active Super Admins; block self-demotion.

### 🟡 ROLE-6 · `assign-teacher` has no UI
`POST /users/assign-teacher` (super_admin) is the only way to create `TeacherAssignment` rows, and there is **no screen for it**. In practice `total_elites` / `total_members` on the Teacher Leaderboard will be 0 for everyone.
**Fix:** add an assignment UI under `/admin/users` (or a dedicated `/admin/cohorts`).

### 🔵 ROLE-7 · `select-batch` reachable after batch is set
No guard; a user can re-open it and silently change shift (ties to BE-11).

---

## PART 4 — UI / UX Audit

### 🔴 UX-1 · Lead Teacher & Super Teacher dashboards look broken (root cause: BE-1)
All-"Pending" badges, 0 eligible, flat charts, empty "Good to Go" tracker. Fixing BE-1 fixes the visible symptom.

### 🟠 UX-2 · No role redirect → confusing dead screens (root cause: ROLE-2)
`/admin` for an elite user renders the admin shell with zeroed metrics rather than sending them home.

### 🟠 UX-3 · Three visual identities in one app
- **Landing** (`app/page.tsx`): inline-style palette (`T.moss`, `T.ember`), `Syne` / `Inter`, GSAP, 3D tilt.
- **Auth** (`login`, `register`): different inline palette (`V.viridian` / `#0D6E61`), `Bricolage Grotesque` / `DM Sans`.
- **Dashboard**: Tailwind design tokens + shadcn/ui, system font.

Same product, no shared token set. Pick one system (recommend the Tailwind token layer) and refactor landing + auth onto it.

### 🟠 UX-4 · Streaming evaluation infra built but unused
Backend exposes `GET /evaluations/{id}/run/stream` (SSE, token-by-token + tool-call events). The UI (`members/[id]`, `elite/page.tsx`) calls the **blocking** `POST /evaluations/{id}/run` and shows a pulsing "Executing…" card for the full 30–60 s AI call with no progress.
**Fix:** switch the dossier "Run" button to the SSE endpoint and stream steps.

### 🟡 UX-5 · `react-virtuoso` claimed but not wired
`elite/leaderboard/page.tsx` imports `TableVirtuoso` and never uses it; the table is a plain `.map()`. `progress.md` claims "60 fps virtualization for 110+ entries". Dead import = bundle weight + false claim.
**Fix:** either wire `TableVirtuoso` or drop the import.

### 🟡 UX-6 · Duplicate `<CommandMenu />`
Rendered in `(dashboard)/layout.tsx` **and** again in `elite/page.tsx`. Two `keydown` listeners for ⌘K, two independent `open` states → flicker / double overlay on `/elite`.
**Fix:** render it once in the layout only.

### 🟡 UX-7 · Native `confirm()` / `alert()` for destructive actions
`elite/page.tsx` and `members/[id]/page.tsx` use `window.confirm` / `window.alert` for delete, inside an app that otherwise uses `sonner` toasts + Radix dialogs. Not styleable, not mobile-friendly, blockable by browsers.
**Fix:** a shared confirm dialog component.

### 🟡 UX-8 · Hardcoded counts / copy in Super Teacher dashboard
`superTeachers.length || 5`, plus baked copy "~5 Super Teachers, 8–10 Lead Teachers, ~110 Assistant Teachers". Real data can render `5` (fallback) while the DB has 2.
**Fix:** drive all counts from data; move prose to a caption, not a number.

### 🟡 UX-9 · Charts ignore theme / dark mode
`super-teacher` recharts hardcodes `stroke="#e5e7eb"`, `fill="#4F46E5"`, and a white `Tooltip.contentStyle`. In dark mode the tooltip is unreadable and the grid vanishes.
**Fix:** read CSS custom properties / pass theme-aware colors.

### 🟡 UX-10 · Inconsistent loading states
`elite/page.tsx` has proper skeletons; `/lead-teacher`, `/super-teacher`, `/admin` show a bare centered spinner or nothing.
**Fix:** shared skeleton components per surface.

### 🟡 UX-11 · Numbers disagree across a single user's screens
A Super Teacher sees `/elite` (Candidate Registry — all members, via `list_members`) **and** `/super-teacher` (counts from all members but zero evals due to BE-1). Two screens, two different totals for the same user.
**Fix:** BE-1 + a single shared stats source.

### 🔵 UX-12 · Accessibility & misc
- Icon-only buttons (refresh, grid/list toggle, delete) mostly lack `aria-label` (some have `title` only).
- ⌘K palette: no `role="dialog"`, no focus trap beyond cmdk defaults.
- Status encoded by colour alone in some badges.
- `toLocaleDateString()` with no locale/timezone → hydration mismatch risk + inconsistent formatting.
- No global error boundary — a render throw white-screens the app.
- Mobile nav drawer duplicates the role/shift badge and renders "Add Candidate" as a heavy primary row among ghost rows.

---

## PART 5 — Proposal: Replace plain email+password with verified auth

**Problem (your call-out):** email + password with no verification is loose — unverified emails, forgeable-secret risk (BE-6), no throttling (BE-7), custom JWT/refresh code to maintain (BE-10), `is_email_verified` is dead (BE-3).

Two paths — recommend **Option A** if the team can absorb the migration, **Option B** as the incremental step.

### Option A — Supabase Auth as the identity provider (recommended)
Supabase is already in the stack (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` in settings).

- **Frontend:** use `@supabase/supabase-js` — `signUp()` (sends the confirmation email automatically), `signInWithPassword()`, `resend()`. Supabase enforces "Confirm email" before a session is issued (project setting).
- **Backend:** stop minting your own JWTs. Verify the Supabase access token on each request against Supabase's JWKS (`{SUPABASE_URL}/auth/v1/keys`) in `get_current_user_payload`. Map `sub` (Supabase `auth.uid`, a UUID) → your `users` row.
- **`users` table becomes a profile table:** add `auth_uid: str (unique)`, drop `password_hash`, keep `role`, `batch`, `full_name`, `approval_status` (PART 6). Backfill via a migration + one-time link.
- **Removes:** `hash_password` / `verify_password`, `create_*_token`, `/auth/refresh`, most of `auth_service`. Brings password reset, email change, rate limiting, lockout, OAuth-later for free.
- **Keep:** `require_roles` dependencies unchanged (still read `role` from your DB row).

### Option B — Keep custom auth, bolt on verification
- Add `email_verification_token: str | None`, `email_verified_at: datetime | None`.
- `register` → create user `is_email_verified=False`, send a link (`{FRONTEND_URL}/verify?token=…`) via Supabase transactional email, Resend, or SMTP.
- New `POST /api/v1/auth/verify-email` → validates token, sets `is_email_verified=True`.
- `auth_service.login` → reject with 403 `"Email not verified"` when `is_email_verified` is false (add a "resend" endpoint).
- Still owe: fix BE-6 (secret), BE-7 (login throttle), BE-10 (refresh revocation).

### Verification + approval ordering (both options)
`register → verify email → await Super Admin approval → login allowed`. Verification and approval are independent flags; login requires **both**.

---

## PART 6 — Proposal: Registration approval workflow

**Goal (your call-out):** Super Teacher and Lead Teacher must *request* access; a Super Admin approves before they can log into their dashboard; Super Admin gets an "approvals" surface.

### 6.1 Data model
Add to `User`:

| Field | Type | Notes |
|---|---|---|
| `approval_status` | enum `PENDING` / `APPROVED` / `REJECTED` | default `PENDING` |
| `requested_role` | `UserRole` | what the applicant asked for at signup |
| `approved_by` | `int FK users.id, nullable` | which Super Admin actioned it |
| `approved_at` | `datetime, nullable` | |
| `rejection_reason` | `str, nullable` | shown to the applicant |

Keep `is_active` for post-approval suspension (separate concern). `role` holds the **effective** role and stays `elite_user` (or null) until approval promotes it to `requested_role`.

### 6.2 Registration change
- Backend `register`: ignore any client `role`; store the applicant's choice in `requested_role`; set `role = elite_user`, `approval_status = PENDING`, `is_email_verified = False`.
- Frontend `register/page.tsx`: relabel the selector "Requested role — Lead / Super Teacher require admin approval". After submit, show a "Request received — verify your email, then wait for approval" screen (not a redirect to login).

### 6.3 Decision needed — does Elite User need approval too?
| Model | Elite (~110) | Lead / Super Teacher |
|---|---|---|
| **A (recommended)** | auto-approved once email verified | Super Admin approval required |
| **B (your "same for lead teacher i guess")** | Lead Teacher approves their assigned Elites; Super Admin approves Teachers | Super Admin approval required |
| **C** | everyone needs Super Admin approval | Super Admin approval required |

A keeps ~110 scouts from bottlenecking on one admin. **Please confirm which you want** before this is built.

### 6.4 New endpoints (all `require_super_admin`, except where noted)
- `GET /api/v1/admin/pending-users` → list `approval_status == PENDING` (email, full_name, requested_role, created_at, is_email_verified).
- `POST /api/v1/admin/users/{id}/approve` — body `{ role?: UserRole }` (defaults to `requested_role`; admin can override). Sets `approval_status=APPROVED`, `role`, `approved_by`, `approved_at`; emails the applicant.
- `POST /api/v1/admin/users/{id}/reject` — body `{ reason: string }`. Sets `REJECTED`, stores reason, emails the applicant.
- (Model B only) `POST /api/v1/lead/pending-elites` + approve/reject under `require_lead_teacher`, scoped to the caller's assignments.
- `login` gains: reject unless `approval_status == APPROVED` **and** email verified — distinct error messages for each.

### 6.5 Super Admin UI
- **`/admin`:** add an **"Pending Approvals"** card with a live count badge; empty state when zero.
- **`/admin/users`:** add a **"Pending" tab/filter**; each row shows requested role + email-verified pill and **Approve** (with role-override `<select>`) / **Reject** (reason textarea) actions. Keep the existing role dropdown + suspend/activate for already-approved users.
- Optional: notify Super Admin(s) by email on each new pending request.

### 6.6 Interaction with PART 5
If Option A (Supabase Auth) is chosen: Supabase handles *email verification*; your backend still owns `approval_status` and the approval endpoints/UI above. The login gate becomes "valid Supabase session **+** `approval_status == APPROVED`".

---

## PART 7 — Prioritized fix list

| # | Item | Sev | Effort |
|---|---|---|---|
| 1 | BE-1 — role-aware `GET /evaluations` (unbreaks Lead/Super Teacher dashboards) | 🔴 | S |
| 2 | BE-4 / ROLE-3 — stop honouring client `role` at registration | 🔴 | S |
| 3 | BE-6 — fail-fast on default `SECRET_KEY` in prod | 🔴 | XS |
| 4 | PART 6 — approval workflow + Super Admin approvals UI | 🔴 | L |
| 5 | PART 5 — verified auth (Option A or B) | 🔴 | L |
| 6 | ROLE-2 / UX-2 — role guard + redirect in dashboard layout | 🟠 | S |
| 7 | BE-2 — Super-Teacher-safe stats endpoint | 🟠 | S |
| 8 | ROLE-1 — cohort scoping via `TeacherAssignment` (+ ROLE-6 assignment UI) | 🟠 | M |
| 9 | BE-7 — login/register throttling | 🟠 | S |
| 10 | UX-4 — wire the streaming evaluation endpoint | 🟠 | M |
| 11 | UX-3 — unify landing + auth onto the dashboard token system | 🟠 | M |
| 12 | BE-9 — de-N+1 leaderboards & stats | 🟡 | M |
| 13 | BE-11 / ROLE-7 — snapshot `batch` onto `Member`, lock shift change | 🟡 | S |
| 14 | UX-6 / UX-7 / UX-5 — dedupe CommandMenu, shared confirm dialog, drop dead import | 🟡 | S |
| 15 | UX-9 / UX-10 / UX-12 — theme-aware charts, shared skeletons, a11y + error boundary | 🟡 | M |
| 16 | BE-8 — tighten CORS | 🟡 | XS |
| 17 | BE-10 — refresh-token revocation + login redirect on refresh fail | 🟡 | S |

**Open questions for you:**
1. PART 5 — Option A (Supabase Auth, bigger migration, removes custom auth code) or Option B (keep custom auth, add verification only)?
2. PART 6.3 — does Elite User need approval, or auto-approve after email verification? (recommend auto-approve)
3. PART 6 — should Lead Teachers approve their own Elite scouts (Model B), or only Super Admin approves anyone above Elite (Model A)?
