```markdown
# VerticalGate — Full Architecture Specification

**App Name:** VerticalGate  
**Purpose:** Elite Member collection + AI-powered Domain/Vertical evaluation using the full “Choosing Your Vertical” framework.

---

## 1. High-Level Architecture

```
┌─────────────────┐      ┌──────────────────────┐      ┌─────────────────────┐
│   Next.js 14    │◄────►│   FastAPI Backend    │◄────►│  Supabase Postgres  │
│  (App Router)   │      │  (UV + Alembic)      │      │                     │
└─────────────────┘      └──────────────────────┘      └─────────────────────┘
         │                          │
         │                          ▼
         │                 ┌─────────────────────┐
         │                 │  AI Providers       │
         │                 │  (Primary + Fallback)│
         │                 └─────────────────────┘
         ▼
   Sentry (Logging & Monitoring)
```

---

## 2. Database Tables (PostgreSQL via Supabase)

We keep the schema **lean and MVP-focused**.

| #  | Table Name              | Purpose                                      | Key Fields |
|----|-------------------------|----------------------------------------------|----------|
| 1  | `users`                 | All system users                             | id, email, password_hash, full_name, role, batch, is_active, created_at |
| 2  | `members`               | Collected students (Members)                 | id, elite_user_id, name, domain, experience, phone, description, created_at |
| 3  | `evaluations`           | AI Analysis results for each Member          | id, member_id, triggered_by, status, screen_score, tests_score, outcome (eligible/service/parked), full_result (JSONB), provider_used, created_at |
| 4  | `ai_usage`              | Rate limiting & usage tracking               | id, user_id, call_count, window, created_at |
| 5  | `teacher_assignments`   | Lead Teacher ↔ Elite User mapping            | id, lead_teacher_id, elite_user_id, created_at |
| 6  | `activity_logs`         | Important user actions (optional but useful) | id, user_id, action, meta (JSONB), created_at |

**Roles (stored in `users.role`):**
- `super_admin`
- `super_teacher`
- `lead_teacher`
- `elite_user`

**Batch values:** `morning` | `afternoon` | `evening` (nullable for Super Admin & Super Teacher)

**Total core tables: 6**

---

## 3. Backend Folder Structure (FastAPI + UV)

```
VerticalGate/
│
├── app/                                      ← 🐍 Main FastAPI Backend
│   │
│   ├── main.py                               ← App entry point
│   ├── runner.py                             ← CLI task runner (optional)
│   │
│   ├── api/
│   │   ├── routers/
│   │   │   ├── main_router.py                ← Aggregates all routers
│   │   │   ├── auth_router.py
│   │   │   ├── users_router.py
│   │   │   ├── members_router.py
│   │   │   ├── evaluations_router.py
│   │   │   ├── leaderboard_router.py
│   │   │   ├── admin_router.py
│   │   │   ├── ai_router.py                  ← AI query endpoints for higher roles
│   │   │   └── v1/                           ← Versioned routes (future)
│   │   │
│   │   └── controllers/
│   │       ├── auth_controller.py
│   │       ├── users_controller.py
│   │       ├── members_controller.py
│   │       ├── evaluations_controller.py
│   │       ├── leaderboard_controller.py
│   │       ├── admin_controller.py
│   │       └── ai_controller.py
│   │
│   ├── agents/                               ← 🤖 AI Agents
│   │   ├── config.py                         ← Primary + Fallback provider config
│   │   ├── model.py
│   │   ├── vertical_evaluation_agent.py      ← Main Agent (uses Choosing Your Vertical)
│   │   ├── data_query_agent.py               ← For Teachers / Super Teacher / Admin
│   │   └── tools/
│   │       ├── evaluation_tools.py
│   │       └── data_tools.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── user_service.py
│   │   ├── member_service.py
│   │   ├── evaluation_service.py
│   │   ├── leaderboard_service.py
│   │   ├── rate_limit_service.py
│   │   └── ai_service.py
│   │
│   ├── models/                               ← SQLAlchemy ORM
│   │   ├── __init__.py
│   │   ├── common.py
│   │   ├── user.py
│   │   ├── member.py
│   │   ├── evaluation.py
│   │   ├── ai_usage.py
│   │   ├── teacher_assignment.py
│   │   └── activity_log.py
│   │
│   ├── schemas/                              ← Pydantic
│   │   ├── common.py
│   │   ├── user.py
│   │   ├── member.py
│   │   ├── evaluation.py
│   │   ├── auth.py
│   │   └── leaderboard.py
│   │
│   ├── crud/
│   │   ├── crud_user.py
│   │   ├── crud_member.py
│   │   ├── crud_evaluation.py
│   │   ├── crud_ai_usage.py
│   │   └── crud_assignment.py
│   │
│   ├── repositories/
│   │   ├── repository.py                     ← Base repository
│   │   ├── user_repository.py
│   │   ├── member_repository.py
│   │   └── evaluation_repository.py
│   │
│   ├── db/
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   └── base.py
│   │
│   ├── core/
│   │   ├── settings.py                       ← Pydantic Settings (env)
│   │   ├── security.py                       ← JWT + password hashing
│   │   ├── exceptions.py
│   │   └── dependencies.py                  ← Role-based deps
│   │
│   ├── middleware/
│   │   ├── rate_limiter.py                   ← AI call rate limiting
│   │   ├── request_logger.py
│   │   └── auth_middleware.py                ← Optional extra protection
│   │
│   ├── prompts/
│   │   ├── vertical_evaluation/
│   │   │   ├── system_prompt.md              ← Full “Choosing Your Vertical” instructions
│   │   │   └── output_schema.md
│   │   └── data_query/
│   │
│   ├── utils/
│   │   ├── logger.py
│   │   ├── sentry.py
│   │   └── helpers.py
│   │
│   └── data/                                 ← (optional seed / static)
│
├── alembic/                                  ← 🗄️ Migrations
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│
├── tests/
├── docs/
│   └── architecture.md                       ← This file
│
├── frontend/                                 ← Next.js 14 (App Router)
│   └── ... (see section 4)
│
├── docker-compose.yml
├── backend.Dockerfile
├── pyproject.toml                            ← UV managed
├── .env.example
└── README.md
```

---

## 4. Backend API Routes (FastAPI)

All routes are versioned under `/api/v1` for future safety.

### Auth
- `POST   /api/v1/auth/register`
- `POST   /api/v1/auth/login`
- `POST   /api/v1/auth/refresh`
- `GET    /api/v1/auth/me`

### Users & Roles
- `GET    /api/v1/users/me`
- `PATCH  /api/v1/users/me/batch`                  ← Select Morning/Afternoon/Evening
- `GET    /api/v1/users`                           ← Admin / Super Teacher
- `PATCH  /api/v1/users/{id}/role`                 ← Super Admin only
- `POST   /api/v1/users/assign-teacher`            ← Assign Elite → Lead Teacher

### Members (Elite User focused)
- `GET    /api/v1/members`                         ← My members
- `POST   /api/v1/members`                         ← Create Member
- `GET    /api/v1/members/{id}`
- `PATCH  /api/v1/members/{id}`
- `DELETE /api/v1/members/{id}`

### Evaluations (AI Analysis)
- `POST   /api/v1/evaluations/{member_id}/run`     ← Trigger AI Agent
- `GET    /api/v1/evaluations/{member_id}`
- `GET    /api/v1/evaluations`                     ← List my evaluations

### Leaderboard
- `GET    /api/v1/leaderboard/elite`
- `GET    /api/v1/leaderboard/teachers`

### Higher Role Dashboards
- `GET    /api/v1/teachers/my-elites`              ← Lead Teacher
- `GET    /api/v1/super-teacher/overview`
- `GET    /api/v1/admin/stats`

### AI Query (Teachers & above)
- `POST   /api/v1/ai/query`                        ← Natural language questions about data

### Rate Limit & Usage
- `GET    /api/v1/ai/usage`

**Total main route groups: 8 routers**

---

## 5. Frontend Routes (Next.js 14 — App Router)

```
frontend/
└── app/
    ├── layout.tsx
    ├── page.tsx                          ← Landing / redirect
    ├── globals.css
    │
    ├── (auth)/
    │   ├── login/page.tsx
    │   └── register/page.tsx             ← Restricted or invite-only
    │
    ├── select-batch/page.tsx             ← Forced for Elite + Lead Teacher
    │
    ├── (dashboard)/
    │   ├── layout.tsx                    ← Role-based sidebar
    │   │
    │   ├── elite/
    │   │   ├── page.tsx                  ← Elite Dashboard (Members cards)
    │   │   ├── members/
    │   │   │   ├── page.tsx
    │   │   │   ├── new/page.tsx
    │   │   │   └── [id]/page.tsx         ← Member detail + AI Analysis
    │   │   └── leaderboard/page.tsx
    │   │
    │   ├── lead-teacher/
    │   │   ├── page.tsx                  ← Overview of my Elite Users
    │   │   ├── elites/[id]/page.tsx
    │   │   └── leaderboard/page.tsx
    │   │
    │   ├── super-teacher/
    │   │   ├── page.tsx
    │   │   └── teachers/[id]/page.tsx
    │   │
    │   └── admin/
    │       ├── page.tsx                  ← Super Admin dashboard
    │       ├── users/page.tsx
    │       ├── users/[id]/page.tsx
    │       └── settings/page.tsx         ← Rate limit config etc.
    │
    └── api/                              ← Next.js route handlers (proxy if needed)
```

**Key Frontend Routes Summary:**

| Path                              | Who can access              |
|-----------------------------------|-----------------------------|
| `/login`                          | Public                      |
| `/select-batch`                   | Elite + Lead Teacher        |
| `/elite`                          | Elite User                  |
| `/elite/members/new`              | Elite User                  |
| `/elite/members/[id]`             | Elite User                  |
| `/elite/leaderboard`              | Elite User                  |
| `/lead-teacher`                   | Lead Teacher                |
| `/super-teacher`                  | Super Teacher               |
| `/admin`                          | Super Admin                 |

---

## 6. Middleware & Security

### Backend Middleware
- JWT Authentication middleware
- Role-based access control (RBAC) dependencies
- AI Rate Limiter (per role, configurable)
- Request logging
- CORS
- Sentry error tracking

### Frontend Middleware (`middleware.ts`)
- Protect all dashboard routes
- Redirect unauthenticated users to `/login`
- Force `/select-batch` if batch is not set (for Elite & Lead Teacher)
- Role-based route protection

---

## 7. Alembic + UV + Docker

### UV (Python package manager)
- `pyproject.toml` + `uv.lock`
- Commands: `uv sync`, `uv run`, `uv add`

### Alembic
- Standard setup with `alembic.ini` + `alembic/env.py`
- All models imported in `env.py`
- First migration creates the 6 core tables

### Docker

**backend.Dockerfile**
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen
COPY . .
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml**
```yaml


---

## 8. AI Agent Design (Critical)

**Main Agent:** `vertical_evaluation_agent.py`

- Receives Member data (domain, experience, description…)
- Loads the full “Choosing Your Vertical” content as system knowledge
- Executes:
  1. Three Rules check
  2. Step 1 → Step 2 (6 questions + scores + evidence)
  3. Step 3 (Eight Tests) with Test 3 override
  4. Outcome decision: `eligible` | `service_domain` | `parked`
  5. Beachhead recommendation + next actions
- Returns structured JSON that is stored in `evaluations.full_result`

Primary provider + automatic fallback is handled in `agents/config.py`.

---

## 9. MVP Priority Order (2-hour spirit)

1. Auth + Roles + Batch selection
2. Member CRUD (Elite)
3. AI Evaluation endpoint + storage
4. Elite Dashboard + Member detail page
5. Basic Leaderboard
6. Lead Teacher overview
7. Super Admin user management

Everything else (advanced AI queries, rich analytics, etc.) comes after.

---

**This architecture is fully isolated, scalable, and matches the folder style you provided while staying tightly focused on VerticalGate’s real requirements.**
```