<!-- progress.md — the loop's memory between runs -->

# VerticalGate — Development Progress

## Done

- **2026-08-29: Backend Foundation & Architecture**:
  - Full project folder hierarchy and specifications created (`STORY.md`, `artitecture.md`, `VERTICAL.md`).
  - 6 SQLAlchemy Async Models: `User`, `Member`, `Evaluation`, `AIUsage`, `TeacherAssignment`, `ActivityLog`.
  - Supabase Cloud PostgreSQL async connection with `asyncpg` and PgBouncer transaction pooler support.
  - Complete Pydantic schemas, CRUD layer, security utilities (Bcrypt + JWT access & refresh tokens), and custom HTTP exceptions.
  - AI Evaluation & Data Query Agents with LiteLLM fallback routing and OpenAI Agents SDK integration (`openai-agents[litellm]`).
  - Full FastAPI routers: `auth`, `users`, `members`, `evaluations`, `leaderboard`, `admin`, `ai`.

- **2026-09-01: Product Truth & Role Alignment**:
  - Authored schema-1 `PRODUCT.md` and updated `REQUIREMENT.md`, `README.md`, `docs/architecture.md`, `artitecture.md`, and `STORY.md`.
  - Encoded precise role counts and visibility hierarchy:
    - **Super Admin (1)**: System governance, user CRUD, AI rate limit controls.
    - **Super Teachers (~5)**: Executive council oversight, cross-shift comparison, "Good to Go" vertical tracking, and global AI queries.
    - **Lead Teachers (8–10)**: Shift supervisors (Morning, Afternoon, Evening), managing assigned Assistant Teachers and viewing shift leaderboards.
    - **Assistant Teachers (~110 Elite Users)**: Field scouts capturing student startup ideas, triggering AI evaluations, and competing on leaderboards.
    - **Members**: Students proposing domain startup concepts.

- **2026-09-01: High-Craft UI Stack & Libraries Integration**:
  - Installed and wired curated high-performance packages:
    - `@number-flow/react` (`^0.6.2`) — smooth physical digit-rolling animations for scores & KPI strips.
    - `recharts` (`^3.10.1`) — shift intake, evaluation, and conversion comparison visuals.
    - `react-virtuoso` (`^4.18.12`) — 60fps virtualization for 110+ scout entries.
    - `cmdk` (`^1.1.1`) — universal ⌘K Command Palette.
    - `zustand` (`^5.0.15`) — fast local UI state.
    - `sonner` (`^2.0.8`) — global rich toast notifications.

- **2026-09-01: All 4 Core UI Surfaces Delivered & Polished**:
  - **Surface 1: `elite-dashboard` (`/elite`)**: Mobile-first scouting workspace, sub-30s Quick Intake modal dialog (`<QuickIntakeDialog />`), `@number-flow/react` KPI cards, status filter pills (Eligible, Service, Parked, Pending), and one-tap AI evaluation triggers.
  - **Surface 2: `evaluation-detail` (`/elite/members/[id]`)**: Full dossier view with Decision Hero Banner, Step 2 (6 Selling Screens with evidence), Step 3 (8 Fatal Tests with **Test 3 Non-Negotiable Override Callout**), Step 4 (Beachhead recommendation), and Step 5 (4 Validation Gates: Sponsor, Twin, Builder, Slice).
  - **Surface 3: Multi-Tier `leaderboard` (`/elite/leaderboard`)**: Multi-tier tabbed rankings (Global Elite, Morning Shift, Afternoon Shift, Evening Shift, and Lead Teacher / Shift standings) with Top 3 Gold/Silver/Bronze podium cards and `react-virtuoso` virtualization.
  - **Surface 4: `super-teacher-dashboard` (`/super-teacher`)**: Executive KPI strip, `recharts` Shift Comparison visual, searchable "Good to Go" Qualified Verticals tracker, Lead Teacher cohort rankings, and Natural Language AI Data Query console.

- **2026-09-01: MCP Server Integration & Auth Resilience**:
  - Global MCP configuration in `~/.gemini/config/mcp_config.json`:
    - **Context7** (`@upstash/context7-mcp`)
    - **Magic UI** (`@magicuidesign/mcp@latest`)
  - Enhanced auth lifecycle: Eliminated `user.role` undefined race conditions, secured `fetchWithAuth` refresh handling, and added password visibility toggles (`<Eye />` / `<EyeOff />`) on Login and Register forms.
  - Cleaned all stray temporary patch scripts (`frontend/app/*.js`).
  - Successfully verified Next.js production build (`15/15` routes compiled with zero errors).

## In Progress

- Pushing clean commit to remote git repository.

## Open / Needs Human

- Production environment deployment and live API key provisioning for Gemini & OpenRouter.
