# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Elite Users (~110 Assistant Teachers):** Primary field scouts operating on mobile devices during assigned shifts (Morning, Afternoon, Evening) to collect student Member profiles and trigger AI domain evaluations. They view their collected candidates and real-time public leaderboards.
- **Lead Teachers (~8–10):** Shift supervisors overseeing ~10–12 Assistant Teachers per batch. They inspect teacher candidate intake, review AI evaluations, and run batch cohort queries.
- **Super Teachers (~5):** Academic and venture directors overseeing institutional performance across all shifts, monitoring "Eligible / Good to Go" startup verticals and supervisor leaderboards.
- **Super Admin (1):** Platform owner with global visibility, user/role management, AI rate limit governance, and system-wide audits.
- **Members:** Students proposing domain/vertical venture ideas who receive rigorous evaluation results, evidence-backed scores, and structured next steps.

## Product Purpose

VerticalGate is a startup domain scouting and venture evaluation platform designed to streamline student venture intake and automate rigorous qualification. It applies the complete "Choosing Your Vertical" methodology to determine whether a student's proposed domain is eligible for startup incubation ("Good to Go"), redirected to a service business, or parked with explicit revival conditions.

## Positioning

Unlike generic AI feedback tools that provide flattering summaries, VerticalGate enforces an uncompromising, rules-based evaluation engine. It strictly applies the 3 launch rules, 6 selling-ease screens, 8 fatal-flaw tests (with non-negotiable Test 3 expert availability overrides), beachhead selection, and 4 validation gates—requiring written evidence for every score.

## Operating Context

- Fast-paced classroom and workshop environments during dedicated shift batches (Morning, Afternoon, Evening).
- Active mobile data entry by Elite Users standing or moving between student groups.
- Shift-level and cross-shift supervisory monitoring via desktop, tablet, and mobile dashboards.
- Multi-tier leaderboard engagement fostering healthy performance across shifts and cohorts.
- Rate-limited AI execution with dual-provider fallback (Gemini 2.5 Flash + OpenRouter Llama 3.1) to ensure reliability under heavy concurrent shift load.

## Capabilities and Constraints

- **Role Hierarchy & Visibility:**
  - `Super Admin (1)` → full system control, user CRUD, AI rate limit configuration.
  - `Super Teachers (~5)` → visibility over all Lead Teachers, cross-shift leaderboards, eligible/good-to-go vertical tracker, full Elite leaderboards, and system AI queries.
  - `Lead Teachers (~8–10)` → visibility over all assigned Elite Users in their shift, all members collected by them, member AI evaluations, shift-timing Elite leaderboard, global Elite leaderboard, and batch AI queries.
  - `Elite Users (~110)` → visibility over their own collected members, member AI analysis triggers, shift leaderboard, and global leaderboard.
- **Batching & Shift Selection:** Mandatory shift selection (Morning / Afternoon / Evening) on login for Elite Users and Lead Teachers.
- **Leaderboards System (Public Across Roles):**
  - *Global Elite Leaderboard:* Ranks all ~110 Elite Users by total members collected, verified authentic domains, and evaluation throughput.
  - *Shift Elite Leaderboard:* Filtered by Morning / Afternoon / Evening batches.
  - *Lead Teacher / Shift Leaderboard:* Ranks shifts and Lead Teachers by active Elite count, total intake, and qualified "Eligible" verticals.
- **AI Domain Evaluation Agent & UI:**
  - Automated execution of the 5-step / 8-test framework.
  - Structured output & UI cards: Decision badge (Eligible / Service domain / Parked), 6 selling-ease screen scores with written evidence, 8 fatal-flaw test breakdown with evidence, recommended beachhead, and 4 validation gates (60–90 day targets).
- **Supervisor Query Agent:** Natural language AI data queries for Lead Teachers, Super Teachers, and Super Admin with role-specific quotas.

## Brand Commitments

- **Name:** VerticalGate
- **Tone & Voice:** Objective, analytical, structured, and authoritative yet constructive and clear for students.
- **Visual Identity:** Modern, high-energy SaaS interface with Electric Indigo brand accents (`hsl(239, 84%, 60%)`), clean slate surfaces, clear typography (`Inter` with cv02-cv11 stylistic sets), and vibrant semantic badges for venture qualification tiers (Emerald for Eligible, Amber for Service, Cool Slate for Parked).

## Evidence on Hand

- Complete evaluation rules and methodology codified in `REQUIREMENT.md` and `VERTICAL.md` (Panaversity Agent Factory "Choosing Your Vertical").
- FastAPI backend architecture with SQLAlchemy models, Alembic migrations, and evaluation agent pipeline in `app/`.
- Next.js 14 frontend shell with Tailwind CSS, shadcn/ui components, and Lucide icons in `frontend/`.

## Product Principles

1. **Evidence Over Optimism:** Every score and screening decision must include a concise, factual evidence sentence. No intuition-only scores or fabricated praise.
2. **Ruthless Gatekeeping:** Non-negotiable rules (e.g., Test 3 Expert Availability) must strictly halt eligibility when failed, protecting founders from unviable ventures.
3. **Mobile-First Speed:** Ground workflows for Elite Users must allow member registration and evaluation initiation in under 30 seconds.
4. **Transparent Accountability:** Public multi-tier leaderboards and real-time visibility across shifts maintain data integrity, team momentum, and operational clarity.

## Accessibility & Inclusion

- High-contrast color palette with clear distinction between semantic states (Eligible, Service, Parked).
- Minimum 44x44px touch targets on interactive controls for seamless mobile and desktop use.
- Full keyboard accessibility across data tables, filter tabs, and evaluation dossiers.
