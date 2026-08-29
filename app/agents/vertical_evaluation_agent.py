"""
Vertical Evaluation Agent — applies the full "Choosing Your Vertical" framework
to evaluate a Member's domain/vertical. Uses primary AI provider with automatic fallback.
"""
import json
import os
from pathlib import Path
from app.agents.model import call_ai
from app.utils.logger import ai_logger
from app.utils.sentry import capture_ai_error


def _load_system_prompt() -> str:
    """Load the system prompt from the markdown file."""
    prompt_path = Path(__file__).parent.parent / "prompts" / "vertical_evaluation" / "system_prompt.md"
    if prompt_path.exists():
        return prompt_path.read_text(encoding="utf-8")
    raise FileNotFoundError(f"System prompt not found at {prompt_path}")


def _build_user_prompt(member_data: dict) -> str:
    """Build the user prompt from member data."""
    return f"""
## Member to Evaluate

**Name**: {member_data.get('name', 'Unknown')}
**Domain/Vertical Candidate**: {member_data.get('domain', 'Unknown')}
**Experience**: {member_data.get('experience', 'Unknown')}
**Description**: {member_data.get('description', 'No additional description provided.')}

---

Please evaluate this Member's domain using the complete "Choosing Your Vertical" framework.
Follow all five steps in order. Apply the three rules first. Be strict and evidence-based.
Return ONLY the JSON object as specified in your instructions.
"""


async def run_vertical_evaluation(member_data: dict) -> tuple[dict, str]:
    """
    Run the full vertical evaluation for a Member.
    
    Args:
        member_data: Dict with keys: name, domain, experience, description
        
    Returns:
        (result_dict, provider_used)
    """
    ai_logger.info(f"Starting vertical evaluation for member: {member_data.get('name')} | domain: {member_data.get('domain')}")
    
    system_prompt = _load_system_prompt()
    user_prompt = _build_user_prompt(member_data)
    
    try:
        raw_response, provider_used = await call_ai(user_prompt, system_prompt)
        ai_logger.info(f"Evaluation complete. Provider: {provider_used}")
        
        # Parse JSON response
        result = json.loads(raw_response)
        
        # Validate required fields
        required_fields = ["outcome", "screen_average", "screen_questions", "eight_tests", "tests_total", "summary"]
        for field in required_fields:
            if field not in result:
                raise ValueError(f"AI response missing required field: {field}")
        
        # Ensure outcome is valid
        valid_outcomes = ["eligible", "service_domain", "parked"]
        if result.get("outcome") not in valid_outcomes:
            raise ValueError(f"Invalid outcome: {result.get('outcome')}")
        
        ai_logger.info(
            f"Evaluation result — Outcome: {result.get('outcome')}, "
            f"Screen avg: {result.get('screen_average')}, "
            f"Tests total: {result.get('tests_total')}"
        )
        
        return result, provider_used
        
    except json.JSONDecodeError as e:
        ai_logger.error(f"Failed to parse AI JSON response: {e}")
        capture_ai_error(e, {"member_name": member_data.get("name"), "step": "json_parse"})
        raise Exception(f"AI returned invalid JSON: {e}")
    except Exception as e:
        ai_logger.error(f"Vertical evaluation failed: {e}")
        capture_ai_error(e, {"member_name": member_data.get("name")})
        raise
