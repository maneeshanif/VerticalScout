export type UserRole = "super_admin" | "super_teacher" | "lead_teacher" | "elite_user";
export type BatchType = "morning" | "afternoon" | "evening";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  batch?: BatchType | null;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
}

export interface Member {
  id: number;
  elite_user_id: number;
  name: string;
  domain: string;
  experience: string;
  phone: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScreenQuestion {
  question: string;
  score: number;
  evidence: string;
}

export interface TestResult {
  test_number: number;
  test_name: string;
  result: "Pass" | "Partial" | "Fail";
  score: number;
  evidence: string;
}

export interface EvaluationFullResult {
  rules_check?: Record<string, { status: string; evidence: string }>;
  screen_questions: ScreenQuestion[];
  screen_average: number;
  screen_passed: boolean;
  test_3_failed?: boolean;
  eight_tests: TestResult[];
  tests_total: number;
  tests_passed: boolean;
  outcome: "eligible" | "service_domain" | "parked";
  outcome_reason: string;
  beachhead_recommendation?: string | null;
  improvement_areas: string[];
  improvement_suggestions: string[];
  validation_gates?: Array<{ gate: number; description: string; status: string }>;
  summary: string;
  why_suitable?: string | null;
  why_not_suitable?: string | null;
  next_actions: string[];
}

export interface Evaluation {
  id: number;
  member_id: number;
  triggered_by: number;
  status: "pending" | "running" | "completed" | "failed";
  screen_score?: number | null;
  tests_score?: number | null;
  outcome?: "eligible" | "service_domain" | "parked" | null;
  full_result?: EvaluationFullResult | null;
  provider_used?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EliteLeaderboardEntry {
  rank: number;
  user_id: number;
  full_name: string;
  batch?: string | null;
  total_members: number;
  evaluated_members: number;
  eligible_members: number;
  score: number;
}

export interface TeacherLeaderboardEntry {
  rank: number;
  teacher_id: number;
  full_name: string;
  batch?: string | null;
  total_elites: number;
  total_members: number;
  total_eligible: number;
  score: number;
}

export interface SystemStats {
  total_users: number;
  elite_users: number;
  lead_teachers: number;
  total_members: number;
  total_evaluations: number;
}
