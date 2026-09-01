# Product Story & User Flows

We are Assistant Teachers (Elite Users), around 110 people in total, working alongside around 8–10 Lead Teachers, approximately 5 Super Teachers, and 1 Super Admin.

Our mission is to approach students (Members) and collect their profile details—specifically which domain/vertical idea they are working in, their experience level, name, phone number, and context.

Using the authoritative "Choosing Your Vertical" framework (three rules, five steps, eight tests, beachhead selection, honest exits, and four validation gates), an AI evaluation agent analyzes each domain to determine if it is eligible ("Good to Go") for startup incubation, a service domain, or parked.

---

### Technology Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI + SQLAlchemy + Alembic
- **Database**: Supabase Cloud PostgreSQL
- **AI Engine**: Primary + Automatic Fallback (OpenAI / Gemini / Tavily)
- **Authentication**: Simple JWT / email verification for v1
- **Monitoring/Logging**: Sentry + comprehensive AI execution logs

---

### User Roles, Hierarchy & Visibility

**Super Admin (1) → Super Teachers (~5) → Lead Teachers (~8–10) → Elite Users (~110) → Members**

1. **Super Admin (1)**
   - Complete system governance, user CRUD, role management.
   - Global visibility over all Super Teachers, Lead Teachers, Elite Users, and Members.
   - Configurable AI rate limits and execution audits.

2. **Super Teachers (~5)**
   - Oversee all Lead Teachers and cohorts across all shifts.
   - Access the Lead Teacher & Shift Leaderboard (comparing shifts/leads by active Elite count, collection volume, and qualified verticals).
   - High-level vertical monitor: directly view which verticals are "Good to Go" (Eligible) vs Service vs Parked.
   - Access all Elite Leaderboards (Global and Shift-specific).
   - Run system-wide AI query assistant on student venture readiness.

3. **Lead Teachers (~8–10)**
   - Assigned to a shift (Morning / Afternoon / Evening) selected upon login.
   - View all Elite Users assigned to their shift.
   - View all Members collected by their Elite Users and inspect their full AI domain evaluations.
   - Access their own Shift-Timing Elite Leaderboard and the Global Elite Leaderboard.
   - Run AI data query assistant for their shift cohort.

4. **Elite Users (~110 Assistant Teachers)**
   - Select their shift batch (Morning / Afternoon / Evening) upon login.
   - Quick mobile intake (+ button) to register Members (Name, Domain, Experience, Phone, Description).
   - Permanently tied to their collected Members.
   - Trigger AI Domain Evaluations on collected Members.
   - View member cards, detail pages with full evaluation breakdowns, and public leaderboards (Shift & Global).

5. **Members**
   - Students whose domain concepts are collected and evaluated.

---

### Multi-Tier Public Leaderboards

Leaderboards are accessible to all roles with appropriate scopes:
1. **Global Elite Leaderboard:** Ranks all ~110 Elite Users across all shifts by total members collected, verified authentic domains, and evaluation throughput.
2. **Shift Elite Leaderboard:** Filters Elite User rankings by specific shift batch (Morning, Afternoon, Evening).
3. **Lead Teacher & Shift Leaderboard:** Compares shifts and Lead Teachers by active Elite count, total collection volume, and qualified "Good to Go" verticals.

---

### AI Domain Evaluation UI

The AI evaluation renders a crisp, structured card & breakdown:
- **Decision Outcome:** Eligible ("Good to Go"), Service Domain, or Parked.
- **Selling-Ease Screen:** 6 questions scored 0–10 with written evidence lines.
- **Fatal-Flaw 8 Tests:** Pass (1), Partial (0.5), Fail (0) with written evidence lines and immediate Test 3 Expert Availability override.
- **Beachhead Recommendation:** Actionable entry point when eligible.
- **Validation Gates:** 60–90 day milestones (Sponsor, Twin, Builder, Slice).
