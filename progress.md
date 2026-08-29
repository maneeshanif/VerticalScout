<!-- progress.md — the loop's memory between runs -->

# VerticalGate — Development Progress

## Done

- 2026-08-29: AGENT.md written — comprehensive dev instructions with mandatory reading order, phases, Supabase cloud rules, and progress tracking requirements
- 2026-08-29: Full folder structure created — all backend and frontend directories per architecture spec
- 2026-08-29: Docs folder organized — STORY.md, artitecture.md, VERTICAL.md copied to docs/
- 2026-08-29: Project config files — pyproject.toml, .env.example, docker-compose.yml, backend.Dockerfile, .gitignore, README.md
- 2026-08-29: Backend models complete — 6 SQLAlchemy models: User (with UserRole/BatchType enums), Member, Evaluation, AIUsage, TeacherAssignment, ActivityLog
- 2026-08-29: Database setup — Supabase Cloud PostgreSQL async connection via asyncpg, Alembic migrations configured (alembic.ini, env.py, script.py.mako)
- 2026-08-29: Pydantic schemas complete — auth, user, member, evaluation (with full EvaluationFullResult), leaderboard schemas
- 2026-08-29: CRUD layer complete — CRUDUser, CRUDMember, CRUDEvaluation, CRUDAIUsage, CRUDAssignment
- 2026-08-29: Core utilities complete — settings (Pydantic Settings), JWT security, custom HTTP exceptions, role-based dependencies
- 2026-08-29: Utilities — logger, sentry integration, helpers
- 2026-08-29: AI Agents implemented — vertical_evaluation_agent.py (full 5-step/8-test framework), data_query_agent.py, model.py (primary+fallback), config.py
- 2026-08-29: AI system prompt — complete "Choosing Your Vertical" framework encoded in prompts/vertical_evaluation/system_prompt.md
- 2026-08-29: Services layer complete — auth_service, member_service, evaluation_service, rate_limit_service, leaderboard_service, user_service, ai_service
- 2026-08-29: API routers complete — auth, users, members, evaluations, leaderboard, admin, ai — all registered in main_router.py
- 2026-08-29: Middleware — RequestLoggerMiddleware, CORS, rate limiting (via service layer)
- 2026-08-29: FastAPI main app — lifespan, Sentry init, CORS, router registration, health endpoint
- 2026-08-29: Backend Phase 1 complete — all backend code implemented and ready for push

## In Progress

- Phase 1 Push: Committing and pushing complete backend to main
- Phase 2: Frontend implementation (Next.js 14 + shadcn/ui)

## Open / Needs Human

- User must provide `.env` with: DATABASE_URL (Supabase Cloud), SECRET_KEY, OPENAI_API_KEY, GEMINI_API_KEY (optional), SENTRY_DSN (optional)
- User must run: `uv sync` then `uv run alembic upgrade head` to create DB tables
- User must run: `uv run python -m app.runner create-super-admin` to create the first Super Admin account

- 2026-08-29: **Agents SDK upgrade** — Replaced raw OpenAI/Gemini calls with OpenAI Agents SDK (`openai-agents[litellm]`):
  - `vertical_evaluation_agent.py` — Full SDK rewrite: Agent + Runner.run() + Runner.run_streamed() + trace() context manager + flush_traces()
  - `data_query_agent.py` — Full SDK rewrite with primary→fallback loop
  - `agents/model.py` — LitellmModel factory for Gemini + OpenRouter
  - `agents/config.py` — LiteLLM env var setup, PRIMARY_MODEL/FALLBACK_MODEL config
  - `utils/sentry.py` — Added `OpenAIAgentsIntegration` (sentry-sdk[openai-agents] >= 2.31.0)
  - `evaluations_router.py` — Added SSE streaming endpoint `/evaluations/{id}/run/stream`
  - `pyproject.toml` — Updated deps: `openai-agents[litellm]`, `sentry-sdk[fastapi,openai-agents]>=2.31.0`
  - `.env.example` — Updated with GEMINI_API_KEY, OPENROUTER_API_KEY, PRIMARY_MODEL, FALLBACK_MODEL

- 2026-08-29: **Phase 2 — Frontend Implementation Completed**:
  - **Framework & Tooling**: Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui component hierarchy.
  - **Color & Theme System**: Calibrated palette according to the Better Colors system with high-contrast, professional, light-mode and dark-mode tokens.
  - **Auth & Route Protection**: Complete JWT session management, automatic token refreshing (`lib/api.ts`), login & registration screens, mandatory shift selection (`/select-batch`).
  - **Elite Scouting Dashboard**: Member collection table/cards, creation modal (`/elite/members/new`), detail page with live AI evaluation visualization (`/elite/members/[id]`), and cohort leaderboard (`/elite/leaderboard`).
  - **Role-Based Hierarchy Workspaces**:
    - Lead Teacher workspace with Elite User supervision & AI data assistant (`/lead-teacher`).
    - Super Teacher global oversight dashboard (`/super-teacher`).
    - Super Admin panel with system analytics, AI rate limit controls, and user/role CRUD (`/admin`, `/admin/users`).
  - **Production Readiness**: Responsive mobile-first design, frontend Dockerfile, and environment variable configuration.
