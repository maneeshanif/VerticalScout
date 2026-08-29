"""
Data Query Agent — OpenAI Agents SDK implementation

Allows Lead Teachers, Super Teachers, and Super Admin to ask natural language
questions about platform data using the full Agents SDK with tracing.
"""
import json
from agents import Agent, Runner, RunConfig, trace, flush_traces
from agents.extensions.models.litellm_model import LitellmModel

from app.agents.model import get_primary_model, get_fallback_model, get_model_settings
from app.agents.config import AGENT_MAX_TURNS, PRIMARY_MODEL, FALLBACK_MODEL
from app.utils.logger import ai_logger
from app.utils.sentry import capture_ai_error


DATA_QUERY_INSTRUCTIONS = """
You are the VerticalGate Data Assistant. You help Lead Teachers, Super Teachers, and Super Admin
understand performance data from the platform.

You receive:
1. A structured summary of platform data (users, members, evaluations, leaderboard info)
2. A natural language question from the user

Your job:
- Answer ONLY based on the provided data summary — do not invent data
- Be concise, factual, and highlight specific names and numbers when relevant
- Return a JSON object with this exact structure:
  {
    "answer": "Clear, concise answer to the question",
    "key_data": {"stat_name": "value"},
    "suggestions": ["Follow-up action 1", "Follow-up action 2"]
  }

Return ONLY valid JSON. No markdown, no extra text.
"""


def _build_data_agent(model: LitellmModel) -> Agent:
    """Build the data query agent with the given model."""
    return Agent(
        name="DataQueryAgent",
        instructions=DATA_QUERY_INSTRUCTIONS,
        model=model,
        model_settings=get_model_settings(),
    )


def _build_query_message(question: str, data_summary: dict) -> str:
    """Build the user message combining question and data summary."""
    return f"""
## Platform Data Summary
```json
{json.dumps(data_summary, indent=2, default=str)}
```

## User Question
{question}

Please answer based only on the data provided above.
"""


async def run_data_query(question: str, data_summary: dict) -> tuple[dict, str]:
    """
    Run a natural language data query using the Agents SDK.
    Includes automatic primary → fallback model failover.
    
    Args:
        question: Natural language question from the user
        data_summary: Structured dict of platform statistics
    
    Returns:
        (result_dict, provider_used)
    """
    ai_logger.info(f"Data query: {question[:100]}")
    user_message = _build_query_message(question, data_summary)

    run_config = RunConfig(
        workflow_name="VerticalGate-DataQuery",
        trace_include_sensitive_data=False,
        max_turns=AGENT_MAX_TURNS,
    )

    with trace("VerticalGate-DataQuery"):
        # Try primary model first
        for model_factory, provider_label in [
            (get_primary_model, f"gemini (litellm/{PRIMARY_MODEL})"),
            (get_fallback_model, f"openrouter (litellm/{FALLBACK_MODEL})"),
        ]:
            try:
                agent = _build_data_agent(model_factory())
                result = await Runner.run(agent, input=user_message, run_config=run_config)
                flush_traces()

                raw = str(result.final_output).strip()
                if raw.startswith("```"):
                    raw = raw.split("```")[1]
                    if raw.startswith("json"):
                        raw = raw[4:]
                parsed = json.loads(raw.strip())
                ai_logger.info(f"Data query completed with {provider_label}")
                return parsed, provider_label

            except Exception as e:
                ai_logger.warning(f"Data query failed with {provider_label}: {e}")
                capture_ai_error(e, {"provider": provider_label, "step": "data_query"})
                continue

    raise Exception("All AI providers failed for data query")
