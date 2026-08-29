# AGENT.md — VerticalGate Development Instructions

> This file is the single source of truth for any AI agent working on this project.
> Read this file **first** before doing anything else.

---

## 📋 Mandatory Pre-Work Reading Order

Before writing a single line of code, the agent MUST read these files in this exact order:

1. **`STORY.md`** — Understand the full product story, roles, hierarchy, and user flows
2. **`REQUIREMENT.md`** — Read every requirement, constraint, and out-of-scope item carefully
3. **`artitecture.md`** — Study the folder structure, DB schema, API routes, and AI agent design
4. **`progress.md`** — Check what has already been done and what is in progress

Only after reading all four files above should the agent begin any implementation.

---

## 🗂️ File & Folder Rules

### Root-level files (stay in root — do NOT move):
- `AGENT.md` — This file
- `REQUIREMENT.md` — Product requirements
- `progress.md` — Milestone progress tracker
- `.env` / `.env.example` — Environment variables

### Docs folder (all architecture/planning docs go here):
- `docs/` — All markdown documentation files
  - `docs/STORY.md` — Product story reference
  - `docs/architecture.md` — Full architecture specification
  - `docs/api.md` — API documentation
  - `docs/VERTICAL.md` — "Choosing Your Vertical" framework content
  - Any other planning or reference documents

---

## 🏗️ Development Phases

### Phase 1 — Backend (DO THIS FIRST)

**Step 1: Read all docs** (see Mandatory Pre-Work above)

**Step 2: Create the full folder structure** for the entire app as defined in `artitecture.md`:
- Create all backend folders and placeholder files
- Create all frontend folders and placeholder files
- Move all MD docs (except AGENT.md, REQUIREMENT.md, progress.md) to `docs/` folder
- Create `pyproject.toml`, `.env.example`, `docker-compose.yml`, `backend.Dockerfile`

**Step 3: Implement the backend** in this priority order:
1. Database models (SQLAlchemy ORM) — all 6 tables
2. Database connection (`db/` folder) — Supabase PostgreSQL cloud connection
3. Pydantic schemas
4. CRUD operations
5. Core utilities (settings, security/JWT, exceptions, dependencies)
6. Services layer (auth, user, member, evaluation, leaderboard, rate limit, AI)
7. AI Agents (vertical evaluation agent + data query agent)
8. API routers (auth, users, members, evaluations, leaderboard, admin, AI)
9. Middleware (rate limiter, request logger, auth middleware)
10. Alembic migrations setup
11. Main FastAPI app entrypoint

**Step 4: Code review** — After all backend code is written, check every file for:
- Import errors / missing dependencies
- Correct Supabase PostgreSQL cloud connection string usage
- JWT auth working end-to-end
- Role-based access control on every protected route
- AI agent properly loading the "Choosing Your Vertical" content from `docs/VERTICAL.md`
- Rate limiting logic correct
- Sentry integration
- All routers registered in `main_router.py`

**Step 5: Push to main** — After backend is complete and verified from every perspective:
```bash
git add .
git commit -m "feat: complete backend implementation - Phase 1"
git push origin main
```

---

### Phase 2 — Frontend (START AFTER BACKEND IS PUSHED)

**Technology:** Next.js 14 (App Router) + Tailwind CSS + **shadcn/ui**

**Key rules for frontend:**
- Use **shadcn/ui** components — fast, production-quality UI
- Mobile-first design at all times
- Light color palette — clean, professional, modern (NOT generic/AI-looking)
- Consistent visual language across all role dashboards
- Role-based route protection via `middleware.ts`
- Force `/select-batch` screen for Elite Users and Lead Teachers if batch not set

**Frontend implementation order:**
1. Project setup (Next.js + Tailwind + shadcn/ui init)
2. Auth pages (login, register)
3. Batch selection screen
4. Elite User dashboard + Member cards + Member detail with AI Analysis
5. Elite Leaderboard
6. Lead Teacher dashboard + Elite User overview
7. Super Teacher dashboard
8. Super Admin panel (user management + settings)
9. Shared components (sidebar, navbar, role-based layout)

---

## 🗄️ Database: Supabase Cloud (PostgreSQL)

**CRITICAL:** Use **Supabase Cloud** (not local Postgres, not SQLite) for:
- PostgreSQL database (connection via `DATABASE_URL` from Supabase dashboard)
- Supabase Auth (email verification for v1)
- Row-level security (RLS) can be used optionally

**Connection string format:**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

Store in `.env` as `DATABASE_URL`. Never hardcode credentials.

---

## 📝 Progress Tracking (MANDATORY)

Update `progress.md` at **every milestone completion**. A milestone is:
- Folder structure created
- Backend models complete
- Backend schemas complete
- Backend CRUD + services complete
- AI agents implemented
- API routers wired up
- Backend pushed to main
- Frontend setup complete
- Each frontend role dashboard complete
- Full app tested and deployed

Format for progress entries:
```markdown
## Done
- YYYY-MM-DD: [milestone name] — [brief description]

## In Progress
- [current work item]

## Blocked / Needs Human
- [any blocker that requires user input]
```

---

## 🔑 Environment Variables Required

The following env vars must be in `.env` (and listed in `.env.example`):

```env
# Supabase
DATABASE_URL=postgresql://...
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...

# Auth
SECRET_KEY=...             # JWT secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Providers
OPENAI_API_KEY=...
GEMINI_API_KEY=...         # Fallback

# Sentry
SENTRY_DSN=...

# App
APP_ENV=development
```

---

## 🤖 AI Agent Rules

The `vertical_evaluation_agent.py` MUST:
1. Load the full "Choosing Your Vertical" framework from `docs/VERTICAL.md` as its system knowledge
2. Apply the THREE RULES first (Launch rule, First-job test, Order rule)
3. Execute the FIVE STEPS in order (Name → Screen → Eight Tests → Beachhead → Validation)
4. Enforce Test 3 override (expert availability failure = end evaluation immediately)
5. Return structured JSON with: outcome (`eligible`|`service_domain`|`parked`), scores, evidence sentences, beachhead recommendation
6. Every score MUST have a written evidence sentence — no feeling-based scores
7. Primary provider + automatic fallback handled in `agents/config.py`
8. All AI calls logged to `ai_usage` table + Sentry

---

## ⚡ Hard Rules (Never Break These)

1. **Read STORY.md → REQUIREMENT.md → artitecture.md → progress.md before coding**
2. **Use Supabase Cloud PostgreSQL — never local or SQLite**
3. **Update progress.md at every milestone**
4. **Push backend to main before starting frontend**
5. **Frontend uses shadcn/ui — no generic component libraries**
6. **Every AI score needs written evidence — no feelings-only scoring**
7. **Role hierarchy is: Super Admin → Super Teacher → Lead Teacher → Elite User → Member**
8. **Batch selection (Morning/Afternoon/Evening) is mandatory for Elite Users and Lead Teachers**
9. **AI rate limits must be configurable from Super Admin panel**
10. **No hardcoded secrets — all from .env**

---

## 🚀 Current Phase

**Phase 1: Backend Implementation**

Status: Starting — read docs, create folder structure, implement backend, push to main.
