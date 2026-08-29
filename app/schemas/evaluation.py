from pydantic import BaseModel
from typing import Optional, Any, Dict, List
from datetime import datetime
from app.models.evaluation import EvaluationStatus, EvaluationOutcome


class ScreenQuestion(BaseModel):
    question: str
    score: float  # 0-10
    evidence: str


class TestResult(BaseModel):
    test_number: int
    test_name: str
    result: str  # "Pass", "Partial", "Fail"
    score: float  # 1, 0.5, or 0
    evidence: str


class EvaluationFullResult(BaseModel):
    """Structured AI evaluation output — full "Choosing Your Vertical" framework."""
    # Three Rules check
    rules_check: Dict[str, Any]

    # Step 2 — Screen (6 questions)
    screen_questions: List[ScreenQuestion]
    screen_average: float
    screen_passed: bool  # average >= 6

    # Step 3 — Eight Tests
    eight_tests: List[TestResult]
    tests_total: float  # sum of scores
    tests_passed: bool  # total >= 6.5 AND Test 3 not failed

    # Outcome
    outcome: EvaluationOutcome
    outcome_reason: str

    # Beachhead (if eligible)
    beachhead_recommendation: Optional[str] = None

    # Improvement areas
    improvement_areas: List[str]
    improvement_suggestions: List[str]

    # Validation gates (if eligible)
    validation_gates: Optional[List[Dict[str, Any]]] = None

    # Summary
    summary: str
    why_suitable: Optional[str] = None
    why_not_suitable: Optional[str] = None
    next_actions: List[str]


class EvaluationResponse(BaseModel):
    id: int
    member_id: int
    triggered_by: int
    status: EvaluationStatus
    screen_score: Optional[float] = None
    tests_score: Optional[float] = None
    outcome: Optional[EvaluationOutcome] = None
    full_result: Optional[Dict[str, Any]] = None
    provider_used: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
