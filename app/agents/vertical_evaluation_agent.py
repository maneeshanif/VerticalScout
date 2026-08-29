"""
Vertical Evaluation Agent — OpenAI Agents SDK implementation

Uses the full "Choosing Your Vertical" framework to evaluate a Member's domain.

Architecture:
- Agent defined with LitellmModel (Gemini primary, OpenRouter fallback)
- Runner.run() drives the agent loop with tracing built-in
- Streaming via Runner.run_streamed() for real-time progress events
- Sentry OpenAIAgentsIntegration captures: agent_span, generation_span, tool_span
- Fallback: if primary model fails, retry with fallback model automatically
"""
import json
from pathlib import Path
from typing import AsyncGenerator

from agents import Agent, Runner, RunConfig, trace, flush_traces
from agents.extensions.models.litellm_model import LitellmModel

from app.agents.model import get_primary_model, get_fallback_model, get_model_settings
from app.agents.config import AGENT_MAX_TURNS, PRIMARY_MODEL, FALLBACK_MODEL
from app.utils.logger import ai_logger
from app.utils.sentry import capture_ai_error, capture_agent_event


def _load_system_prompt() -> str:
    """Load the Choosing Your Vertical evaluation system prompt."""
    prompt_path = Path(__file__).parent.parent / "prompts" / "vertical_evaluation" / "system_prompt.md"
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
Apply all three rules, execute all five steps in order, and return ONLY a valid JSON object
as specified in your instructions. No markdown fences, no extra text — only JSON.
"""


def _build_agent(model: LitellmModel) -> Agent:
    """Build the vertical evaluation Agent with the given model."""
    system_prompt = _load_system_prompt()
    return Agent(
        name="VerticalEvaluationAgent",
        instructions=system_prompt,
        model=model,
        model_settings=get_model_settings(),
    )


async def _run_with_model(member_data: dict, model: LitellmModel, provider_name: str) -> tuple[dict, str]:
    """
    Run the vertical evaluation agent with a specific model.
    
    Uses Runner.run() which:
    1. Sends the message to the LLM
    2. Handles the agent loop (up to max_turns)
    3. Automatically traces the run (via OpenAI Agents built-in tracing)
    4. Sentry captures all spans via OpenAIAgentsIntegration
    
    Returns:
        (result_dict, provider_name)
    """
    agent = _build_agent(model)
    user_message = _build_user_message(member_data)

    ai_logger.info(f"[{provider_name}] Running vertical evaluation for: {member_data.get('domain')}")

    run_config = RunConfig(
        workflow_name="VerticalGate-Evaluation",
        trace_include_sensitive_data=False,  # Don't include prompt/response in traces by default
        max_turns=AGENT_MAX_TURNS,
    )

    result = await Runner.run(
        agent,
        input=user_message,
        run_config=run_config,
    )

    # Flush traces immediately for FastAPI background task delivery
    flush_traces()

    raw_output = result.final_output
    ai_logger.info(f"[{provider_name}] Agent run completed. Output length: {len(str(raw_output))}")

    # Parse the JSON response
    try:
        # Handle case where model returns JSON inside ```json ``` blocks
        text = str(raw_output).strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()

        parsed = json.loads(text)
        return parsed, provider_name

    except json.JSONDecodeError as e:
        ai_logger.error(f"[{provider_name}] JSON parse error: {e}\nRaw: {raw_output[:500]}")
        raise ValueError(f"AI returned invalid JSON from {provider_name}: {e}")


async def run_vertical_evaluation(member_data: dict) -> tuple[dict, str]:
    """
    Run the full vertical evaluation with automatic provider fallback.
    
    Flow:
    1. Try PRIMARY model (Gemini 2.0 Flash via LiteLLM)
    2. On failure → automatically try FALLBACK model (OpenRouter Llama via LiteLLM)
    3. If both fail → raise exception
    
    Both runs are traced via:
    - Built-in OpenAI Agents SDK tracing (workflow_name="VerticalGate-Evaluation")
    - Sentry OpenAIAgentsIntegration (agent_span, generation_span, tool_span)
    
    Args:
        member_data: {"name": str, "domain": str, "experience": str, "description": str}
    
    Returns:
        (evaluation_result_dict, provider_used_string)
    """
    ai_logger.info(
        f"Starting vertical evaluation | member={member_data.get('name')} | "
        f"domain={member_data.get('domain')}"
    )

    # Use the SDK's trace() context manager to group the whole evaluation
    # (including primary + fallback attempts) under one trace
    with trace("VerticalGate-Evaluation", group_id=f"member-{member_data.get('name', 'unknown')}"):

        # --- Attempt 1: Primary model (Gemini) ---
        try:
            result, provider = await _run_with_model(
                member_data,
                get_primary_model(),
                f"gemini (litellm/{PRIMARY_MODEL})"
            )
            _validate_result(result, provider)
            ai_logger.info(f"✅ Evaluation completed with PRIMARY model: {provider}")
            capture_agent_event(
                f"Evaluation completed: {result.get('outcome')} | provider={provider}",
                level="info",
                extra={"domain": member_data.get("domain"), "outcome": result.get("outcome")},
            )
            return result, provider

        except Exception as primary_exc:
            ai_logger.warning(
                f"⚠️ Primary model failed: {primary_exc}. "
                f"Falling back to {FALLBACK_MODEL}..."
            )
            capture_ai_error(
                primary_exc,
                {"provider": PRIMARY_MODEL, "step": "primary_attempt", "domain": member_data.get("domain")}
            )

        # --- Attempt 2: Fallback model (OpenRouter) ---
        try:
            result, provider = await _run_with_model(
                member_data,
                get_fallback_model(),
                f"openrouter (litellm/{FALLBACK_MODEL})"
            )
            _validate_result(result, provider)
            ai_logger.info(f"✅ Evaluation completed with FALLBACK model: {provider}")
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
                {"provider": FALLBACK_MODEL, "step": "fallback_attempt", "domain": member_data.get("domain")}
            )
            raise Exception(
                f"All AI providers failed. Primary: {PRIMARY_MODEL}, Fallback: {FALLBACK_MODEL}. "
                f"Last error: {fallback_exc}"
            )


def _validate_result(result: dict, provider: str) -> None:
    """Validate the evaluation result has required fields."""
    required = ["outcome", "screen_average", "screen_questions", "eight_tests", "tests_total", "summary"]
    for field in required:
        if field not in result:
            raise ValueError(f"[{provider}] Missing required field in AI response: '{field}'")
    valid_outcomes = ["eligible", "service_domain", "parked"]
    if result.get("outcome") not in valid_outcomes:
        raise ValueError(f"[{provider}] Invalid outcome: '{result.get('outcome')}'. Expected one of {valid_outcomes}")


async def stream_vertical_evaluation(member_data: dict) -> AsyncGenerator[str, None]:
    """
    Stream the vertical evaluation for real-time progress updates.
    Uses Runner.run_streamed() for token-by-token streaming.
    
    Yields server-sent event strings:
        "data: {json}\n\n"
    
    Usage in FastAPI:
        from fastapi.responses import StreamingResponse
        return StreamingResponse(
            stream_vertical_evaluation(member_data),
            media_type="text/event-stream"
        )
    """
    from openai.types.responses import ResponseTextDeltaEvent
    from agents import ItemHelpers
    from agents.stream_events import RunItemStreamEvent

    agent = _build_agent(get_primary_model())
    user_message = _build_user_message(member_data)

    run_config = RunConfig(
        workflow_name="VerticalGate-Evaluation-Streamed",
        trace_include_sensitive_data=False,
        max_turns=AGENT_MAX_TURNS,
    )

    yield f"data: {json.dumps({'type': 'start', 'message': 'Evaluation started...'})}\n\n"

    full_text = []

    try:
        result = Runner.run_streamed(agent, input=user_message, run_config=run_config)

        async for event in result.stream_events():
            if event.type == "raw_response_event":
                # Stream text tokens as they arrive
                if isinstance(event.data, ResponseTextDeltaEvent):
                    delta = event.data.delta
                    full_text.append(delta)
                    yield f"data: {json.dumps({'type': 'delta', 'text': delta})}\n\n"

            elif event.type == "run_item_stream_event":
                # High-level run item events
                item = event.item
                if item.type == "message_output_item":
                    text = ItemHelpers.text_message_output(item)
                    ai_logger.debug(f"[streaming] message_output_item length={len(text)}")
                elif item.type == "tool_call_item":
                    yield f"data: {json.dumps({'type': 'tool_call', 'name': getattr(item, 'name', 'unknown')})}\n\n"

            elif event.type == "agent_updated_stream_event":
                yield f"data: {json.dumps({'type': 'agent_update', 'agent': event.new_agent.name})}\n\n"

        flush_traces()

        # Parse the accumulated output
        raw = "".join(full_text).strip()
        try:
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            parsed = json.loads(raw.strip())
            yield f"data: {json.dumps({'type': 'complete', 'result': parsed})}\n\n"
        except json.JSONDecodeError:
            yield f"data: {json.dumps({'type': 'error', 'message': 'Failed to parse AI response'})}\n\n"

    except Exception as e:
        ai_logger.error(f"[streaming] Error: {e}")
        capture_ai_error(e, {"member_domain": member_data.get("domain"), "mode": "streaming"})
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
