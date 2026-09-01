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

| #  | Table Name              | Purpose                                      | Key Fields |
|----|-------------------------|----------------------------------------------|----------|
| 1  | `users`                 | All system users                             | id, email, password_hash, full_name, role, batch, is_active, created_at |
| 2  | `members`               | Collected students (Members)                 | id, elite_user_id, name, domain, experience, phone, description, created_at |
| 3  | `evaluations`           | AI Analysis results for each Member          | id, member_id, triggered_by, status, screen_score, tests_score, outcome (eligible/service/parked), full_result (JSONB), provider_used, created_at |
| 4  | `ai_usage`              | Rate limiting & usage tracking               | id, user_id, call_count, window, created_at |
| 5  | `teacher_assignments`   | Lead Teacher ↔ Elite User mapping            | id, lead_teacher_id, elite_user_id, created_at |
| 6  | `activity_logs`         | Important user actions                       | id, user_id, action, meta (JSONB), created_at |

**Roles (stored in `users.role`):**
- `super_admin` (1)
- `super_teacher` (~5)
- `lead_teacher` (~8–10)
- `elite_user` (~110)

**Batch values:** `morning` | `afternoon` | `evening` (required selection on login for Elite Users and Lead Teachers; nullable for Super Admin & Super Teacher)

---

## 3. Role Access & Visibility Matrix

| Feature / Data | Elite User (~110) | Lead Teacher (~8–10) | Super Teacher (~5) | Super Admin (1) |
|---|---|---|---|---|
| **Batch Selection** | Mandatory (M/A/E) | Mandatory (M/A/E) | Optional / Global | Optional / Global |
| **Member Intake (+)** | Own entries only | View shift members | View all members | View/Edit all |
| **Member AI Evaluation** | Trigger & view own | View all in shift | View all across shifts | View all across shifts |
| **"Good to Go" Verticals View** | Own eligible only | Shift eligible view | Dedicated system tracker | Full system view |
| **Shift Elite Leaderboard** | Yes (Public) | Yes (Public) | Yes (Public) | Yes |
| **Global Elite Leaderboard** | Yes (Public) | Yes (Public) | Yes (Public) | Yes |
| **Lead Teacher / Shift Leaderboard** | View rankings | View rankings | Detailed comparative view | Full governance |
| **AI Data Query Assistant** | No | Yes (Shift scope) | Yes (System scope) | Yes (Unrestricted) |
| **Rate Limit Management** | Subject to quota | Subject to quota | Subject to quota | Full CRUD config |

---

## 4. Leaderboards (Public Across Roles)

1. **Global Elite Leaderboard:** Ranks all ~110 Elite Users across all shifts by collection volume, verified authentic domains, and evaluation throughput.
2. **Shift Elite Leaderboard:** Filters rankings by specific shift batch (Morning, Afternoon, Evening).
3. **Lead Teacher / Shift Leaderboard:** Compares shifts and Lead Teachers by active Elite count, total collection, and qualified "Eligible" / "Good to Go" verticals.

---

## 5. AI Evaluation Engine Architecture

The AI Evaluation Agent strictly executes the "Choosing Your Vertical" framework:
1. **Launch Rules Verification:** Launch rule (domain expert committed), first-job test (repeatable/measurable), order rule (complete slice).
2. **Step 1:** Name one specific body of professional work.
3. **Step 2:** Screen for selling ease (6 questions, 0–10 scoring with written evidence, average ≥6 to continue).
4. **Step 3:** Eight Fatal-Flaw Tests (Pass=1, Partial=0.5, Fail=0, threshold ≥6.5/8) with **non-negotiable Test 3 Expert Availability Override** (failure immediately halts vertical eligibility).
5. **Step 4:** Beachhead selection for eligible domains.
6. **Step 5:** Four validation gates tracking (Sponsor, Twin, Builder, Slice) in 60–90 days.
7. **Outcomes:** `eligible` ("Good to Go"), `service_domain`, or `parked` (with revival conditions).
