# Elite Member Collection & Domain Evaluation Platform Specification

## Goal
Build a mobile-first web application that enables ~110 Elite Users (Assistant Teachers) to collect Member (normal student) data, run AI-powered domain/vertical evaluation on that data using the full “Choosing Your Vertical” method, compete on multi-tier leaderboards, and allow hierarchical oversight by Lead Teachers, Super Teachers (~5), and Super Admin. The system supports batch/shift selection (Morning / Afternoon / Evening) for Elite Users and Lead Teachers, full role-based dashboards, configurable AI rate limits, and Super Admin control. The AI Agent must apply the complete evaluation framework (three rules, five steps, eight tests, scoring, honest exits, beachhead selection, and four validation gates) to decide whether a Member’s domain is eligible for the domain-startup next round ("Good to Go"), redirected to a service business, or parked.

## Context
- Hierarchy: Super Admin (1) → Super Teachers (~5) → Lead Teachers (~8–10) → Elite Users (~110) → Members
- ~110 Elite Users, ~8–10 Lead Teachers, ~5 Super Teachers, 1 Super Admin
- Elite Users and Lead Teachers must select batch (Morning / Afternoon / Evening) after login
- Super Teachers oversee Lead Teachers across all shifts and track qualified verticals
- Full evaluation framework is the attached book content “Choosing Your Vertical” (source: https://agentfactory.panaversity.org/docs/ecosystem/choosing-your-vertical)
- Key concepts the Agent must use: Vertical, Beachhead, Corpus, Expert twin, Builder, Slice, Sponsor
- Three non-negotiable rules:
  1. Launch rule – a vertical does not launch without a committed domain expert
  2. First-job test – work must repeat, be measurable, already supervised, and mistakes fixable
  3. Order rule – build one complete slice before selling
- Five steps the Agent must follow in order:
  1. Name one body of professional work (not an industry)
  2. Screen for selling ease (6 questions, 0–10 scoring, average ≥ 6 to continue)
  3. Run the eight tests (Pass=1, Partial=0.5, Fail=0; need ≥ 6.5/8; Test 3 fail ends evaluation)
  4. Choose the beachhead (expert decides between comparable options)
  5. Validate against four gates in 60–90 days (all four required)
- Two honest exits: Service domain or Parked (with written condition)
- Tech stack preference: Next.js + Tailwind CSS, FastAPI, Supabase PostgreSQL, OpenAI Agent SDK (or Gemini + fallback), Sentry
- Primary flow: Member Data Collection → AI Domain Evaluation (using the full method above) → Elite Dashboard → Multi-tier Leaderboards → Hierarchical Monitoring → Super Admin Management

## Requirements
- [ ] Super Admin has full CRUD, role management, system-wide visibility, and configurable AI rate limits
- [ ] Super Teachers (~5) can view all Lead Teachers, compare shift performance (which shift/lead has more active Elites & members), view which verticals are "Good to Go" (Eligible), inspect all Elite leaderboards, and run global AI queries
- [ ] Lead Teachers select Morning / Afternoon / Evening after login, see all assigned Elite Users in their shift, all members collected by them, their full AI evaluation outputs, their shift-timing Elite leaderboard, and the global Elite leaderboard
- [ ] Elite Users select Morning / Afternoon / Evening after login, see their own collected members, run AI analysis, and see public leaderboards (shift & global)
- [ ] Elite User can add Members via + button (Name, Domain, Experience, Phone, optional Description)
- [ ] Each Member is permanently linked to the Elite User who created it
- [ ] Elite User can trigger AI Analysis on any Member
- [ ] AI Agent strictly applies the complete “Choosing Your Vertical” framework to every evaluation:
  - Apply the three rules first
  - Execute Step 1 → Step 2 (6 selling-ease questions with written evidence and 0–10 scores) → Step 3 (eight tests with Pass/Partial/Fail scoring)
  - Enforce Test 3 override (expert availability failure ends the vertical evaluation)
  - Produce clear scores, evidence sentences, and one of three outcomes: Eligible for next round ("Good to Go"), Service domain, or Parked
  - Recommend beachhead if eligible
  - Surface the four validation gates and current status against them
- [ ] AI Analysis UI output includes:
  - Overall decision badge (Eligible / Service domain / Parked)
  - Screen score + evidence for each of the 6 questions
  - Eight-test results with scores and evidence
  - Why the domain is / is not suitable
  - Areas that need improvement and how to improve them
  - Recommended beachhead (if any)
  - Summary of next actions required for eligibility
- [ ] Elite dashboard shows Members as cards + full detail page with complete AI Analysis
- [ ] Leaderboards are public across roles with dedicated views:
  - Shift-timing Elite Leaderboard
  - Global Elite Leaderboard (all ~110 Elites ranked by total members, authentic domains, throughput)
  - Lead Teacher & Shift Leaderboard (comparing shifts by active Elites, volume, and eligible verticals)
- [ ] Lead Teachers, Super Teachers, and Super Admin can query data via AI (with role-specific rate limits)
- [ ] Configurable AI limits (e.g. 10 calls/day for Elite, 5 calls/30 min for Lead Teachers)
- [ ] Primary + automatic fallback AI provider architecture
- [ ] Detailed AI execution logging + Sentry monitoring
- [ ] Simple email-verification authentication for v1 (OTP / Google OAuth later)
- [ ] Mobile-first, clean, professional, light-color UI

## Hard constraints
- Initial version must be buildable in ~2 hours (MVP focus only)
- Architecture must remain future-proof and scalable
- Must follow the exact role hierarchy and batch-selection flows described
- AI Agent must use the full attached “Choosing Your Vertical” content as its sole evaluation source of truth — no invented criteria
- No complex authentication in v1
- UI must not look generic or AI-generated; strict light color palette and clean design
- Every AI score must be accompanied by a written sentence of evidence (no feelings-only scores)

## Out of scope
- Full production authentication (OTP, Google OAuth) in the first version
- Advanced AI features beyond the defined evaluation framework + simple data queries
- Complex multi-tenant or organization features
- Real-time chat, notifications, or social features
- Payment, billing, or subscription systems
- Extensive admin analytics beyond the required dashboards and leaderboards
- Building the actual vertical, slice, or System of Record (the app only evaluates eligibility)

## Expected output
A complete, production-ready Next.js + FastAPI application structure with:
- Role-based authentication and protected routes
- Batch selection screens for Elite Users and Lead Teachers
- Member CRUD + AI Analysis flow that runs the full five-step / eight-test method
- Structured AI Analysis result that clearly states Eligible / Service domain / Parked and shows all scores + evidence
- Role-specific dashboards and multi-tier public leaderboards
- Super Admin panel for user/role management and limit configuration
- Clean mobile-first UI following the stated design rules
- Logging and monitoring setup
