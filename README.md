# VerticalGate

**Elite Member Collection & AI-powered Domain/Vertical Evaluation Platform**

Built with: FastAPI + SQLAlchemy + Supabase Cloud PostgreSQL + Next.js 14 + shadcn/ui

---

## Quick Start

### Backend

```bash
# 1. Install dependencies
pip install uv
uv sync

# 2. Copy and fill in env vars
cp .env.example .env
# Edit .env with your Supabase credentials and API keys

# 3. Run migrations (after setting DATABASE_URL in .env)
uv run alembic upgrade head

# 4. Create Super Admin
uv run python -m app.runner create-super-admin

# 5. Start development server
uv run uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

---

## Architecture

See [docs/architecture.md](docs/architecture.md) for full details.

### Role Hierarchy & Visibility
```
Super Admin (1) → Super Teachers (~5) → Lead Teachers (~8–10) → Elite Users (~110) → Members
```
- **Super Admin (1):** Full system governance, user CRUD, AI rate limit controls, and audit logs.
- **Super Teachers (~5):** High-level academic & venture directors. Oversee all Lead Teachers, compare shift performance, view which verticals are "Good to Go" (Eligible), inspect all Elite leaderboards, and run global AI data queries.
- **Lead Teachers (~8–10):** Shift supervisors (Morning / Afternoon / Evening). View all assigned Elite Users, all members collected by them, member AI evaluations, their shift-timing Elite leaderboard, and the global Elite leaderboard.
- **Elite Users (~110):** Field collectors (Morning / Afternoon / Evening). Add Members, trigger AI evaluations, view their own member cards/detail, and view shift and global leaderboards.

### Batch Types
- Morning | Afternoon | Evening
- Required selection for Elite Users and Lead Teachers after login

### Leaderboards (Public Across Roles)
1. **Global Elite Leaderboard:** Ranks all ~110 Elite Users across all shifts by collection volume, authentic domains, and evaluation throughput.
2. **Shift Elite Leaderboard:** Filters rankings by specific shift (Morning, Afternoon, Evening).
3. **Lead Teacher / Shift Leaderboard:** Compares shifts and Lead Teachers by active Elite count, total collection, and qualified "Eligible" verticals.

---

## API Documentation

Start the backend, then visit: http://localhost:8000/docs

---

## Environment Variables

See [.env.example](.env.example) for all required variables.
