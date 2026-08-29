"""
Vertical Evaluation Agent

Uses the complete "Choosing Your Vertical" framework to evaluate a Member's domain.
Employs direct resilient API communication with primary (Gemini 2.5 Flash)
and fallback (OpenRouter Llama 3.1 8B) failover architecture.
"""
import json
import os
import aiohttp
from pathlib import Path
from typing import AsyncGenerator

from app.agents.config import (
    PRIMARY_MODEL,
    FALLBACK_MODEL,
    AGENT_TEMPERATURE,
)
from app.core.settings import settings
from app.utils.logger import ai_logger
from app.utils.sentry import capture_ai_error, capture_agent_event


def _load_system_prompt() -> str:
    """Load the Choosing Your Vertical evaluation system prompt."""
    prompt_path = (
        Path(__file__).parent.parent
        / "prompts"
        / "vertical_evaluation"
        / "system_prompt.md"
    )
    if not prompt_path.exists():
        raise FileNotFoundError(f"System prompt not found at {prompt_path}")
    return prompt_path.read_text(encoding="utf-8")


def _build_user_message(member_data: dict) -> str:
    """Build the evaluation request message from member data."""
    return f"""
## Member Domain to Evaluate

**Name**: {member_data.get('name', 'Unknown')}
**Domain / Vertical Candidate**: {member_data.get('domain', 'Unknown')}
**Experience**: {member_data.get('experience', 'Unknown')}
**Additional Description**: {member_data.get('description') or 'No additional description provided.'}

---

Please evaluate this Member's domain using the complete "Choosing Your Vertical" framework.
Apply all three rules, execute all five steps in order, and return ONLY a valid, complete JSON object
as specified in your instructions. No markdown fences, no extra text — only valid JSON.
"""


def _clean_json_output(raw_text: str) -> dict:
    """Clean markdown code fences and parse JSON string."""
    text = raw_text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()
    return json.loads(text)


async def _call_gemini_api(system_prompt: str, user_prompt: str) -> dict:
    """Call Google Gemini 2.5 Flash API directly via asynchronous HTTP."""
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured in .env")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": f"System Instructions:\n{system_prompt}\n\nUser Request:\n{user_prompt}"}
                ],
            }
        ],
        "generationConfig": {
            "temperature": AGENT_TEMPERATURE,
            "maxOutputTokens": 8192,
            "responseMimeType": "application/json",
        },
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=60)) as resp:
            if resp.status != 200:
                error_body = await resp.text()
                raise RuntimeError(f"Gemini API returned HTTP {resp.status}: {error_body}")

            data = await resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            return _clean_json_output(raw_text)


async def _call_openrouter_api(system_prompt: str, user_prompt: str) -> dict:
    """Call OpenRouter fallback API."""
    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY is not configured in .env")

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://verticalgate.internal",
        "X-Title": "VerticalGate Evaluation",
    }

    payload = {
        "model": "meta-llama/llama-3.1-8b-instruct",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": AGENT_TEMPERATURE,
        "max_tokens": 8192,
        "response_format": {"type": "json_object"},
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=payload, timeout=aiohttp.ClientTimeout(total=60)) as resp:
            if resp.status != 200:
                error_body = await resp.text()
                raise RuntimeError(f"OpenRouter returned HTTP {resp.status}: {error_body}")

            data = await resp.json()
            raw_text = data["choices"][0]["message"]["content"]
            return _clean_json_output(raw_text)


def _validate_result(result: dict, provider: str) -> None:
    """Validate that the evaluation result contains all required Choosing Your Vertical keys."""
    required = [
        "outcome",
        "screen_average",
        "screen_questions",
        "eight_tests",
        "tests_total",
        "summary",
    ]
    for field in required:
        if field not in result:
            raise ValueError(f"[{provider}] Missing required field in AI response: '{field}'")
    valid_outcomes = ["eligible", "service_domain", "parked"]
    if result.get("outcome") not in valid_outcomes:
        raise ValueError(
            f"[{provider}] Invalid outcome: '{result.get('outcome')}'. Expected one of {valid_outcomes}"
        )


async def run_vertical_evaluation(member_data: dict) -> tuple[dict, str]:
    """
    Run the full vertical evaluation with automatic provider failover.
    1. Primary: Gemini 2.5 Flash (Fast, JSON mode)
    2. Fallback: OpenRouter Llama 3.1 8B
    """
    system_prompt = _load_system_prompt()
    user_prompt = _build_user_message(member_data)

    ai_logger.info(
        f"Starting vertical evaluation | member={member_data.get('name')} | "
        f"domain={member_data.get('domain')}"
    )

    # 1. Primary Attempt: Gemini 2.5 Flash
    try:
        provider = "gemini (gemini-2.5-flash)"
        ai_logger.info(f"[{provider}] Running evaluation...")
        result = await _call_gemini_api(system_prompt, user_prompt)
        _validate_result(result, provider)
        ai_logger.info(f"✅ Evaluation completed successfully with PRIMARY model: {provider}")
        capture_agent_event(
            f"Evaluation completed: {result.get('outcome')} | provider={provider}",
            level="info",
            extra={"domain": member_data.get("domain"), "outcome": result.get("outcome")},
        )
        return result, provider
    except Exception as primary_exc:
        ai_logger.warning(
            f"⚠️ Primary model (Gemini) failed: {primary_exc}. Falling back to OpenRouter..."
        )
        capture_ai_error(
            primary_exc,
            {"provider": "gemini-2.5-flash", "step": "primary_attempt", "domain": member_data.get("domain")},
        )

    # 2. Fallback Attempt: OpenRouter Llama 3.1
    try:
        provider = "openrouter (meta-llama/llama-3.1-8b-instruct)"
        ai_logger.info(f"[{provider}] Running evaluation...")
        result = await _call_openrouter_api(system_prompt, user_prompt)
        _validate_result(result, provider)
        ai_logger.info(f"✅ Evaluation completed successfully with FALLBACK model: {provider}")
        capture_agent_event(
            f"Evaluation completed via FALLBACK: {result.get('outcome')} | provider={provider}",
            level="warning",
            extra={"domain": member_data.get("domain"), "outcome": result.get("outcome")},
        )
        return result, provider
    except Exception as fallback_exc:
        ai_logger.error(f"❌ Both AI providers failed. Last error: {fallback_exc}")
        capture_ai_error(
            fallback_exc,
            {"provider": "openrouter", "step": "fallback_attempt", "domain": member_data.get("domain")},
        )
        raise RuntimeError(
            f"All AI evaluation providers failed. Last error: {fallback_exc}"
        )


async def stream_vertical_evaluation(member_data: dict) -> AsyncGenerator[str, None]:
    """Stream evaluation result as SSE formatted events."""
    yield f"data: {json.dumps({'type': 'start', 'message': 'Evaluation pipeline initiated...'})}\n\n"
    try:
        result, provider = await run_vertical_evaluation(member_data)
        yield f"data: {json.dumps({'type': 'complete', 'provider': provider, 'result': result})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
