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

### Role Hierarchy
```
Super Admin → Super Teacher → Lead Teacher → Elite User → Member
```

### Batch Types
- Morning | Afternoon | Evening
- Required for Elite Users and Lead Teachers after login

---

## API Documentation

Start the backend, then visit: http://localhost:8000/docs

---

## Environment Variables

See [.env.example](.env.example) for all required variables.
