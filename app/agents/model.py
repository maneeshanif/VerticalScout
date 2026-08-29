"""
AI model caller with primary + automatic fallback support.
"""
import json
from typing import Optional
import openai
import google.generativeai as genai
from app.agents.config import PROVIDER_CONFIG, PRIMARY_PROVIDER, FALLBACK_PROVIDER
from app.utils.logger import ai_logger
from app.utils.sentry import capture_ai_error


async def call_ai(prompt: str, system: str) -> tuple[str, str]:
    """
    Call the primary AI provider. On failure, automatically fall back.
    Returns: (response_text, provider_used)
    """
    providers = [PRIMARY_PROVIDER, FALLBACK_PROVIDER]
    last_error = None

    for provider in providers:
        config = PROVIDER_CONFIG.get(provider)
        if not config or not config.get("api_key"):
            ai_logger.warning(f"Provider {provider} not configured, skipping.")
            continue
        try:
            ai_logger.info(f"Calling AI provider: {provider}")
            if provider == "openai":
                response = await _call_openai(prompt, system, config)
            elif provider == "gemini":
                response = await _call_gemini(prompt, system, config)
            else:
                continue
            ai_logger.info(f"AI provider {provider} responded successfully")
            return response, provider
        except Exception as e:
            ai_logger.error(f"AI provider {provider} failed: {e}")
            capture_ai_error(e, {"provider": provider})
            last_error = e
            continue

    raise Exception(f"All AI providers failed. Last error: {last_error}")


async def _call_openai(prompt: str, system: str, config: dict) -> str:
    client = openai.AsyncOpenAI(api_key=config["api_key"])
    response = await client.chat.completions.create(
        model=config["model"],
        max_tokens=config["max_tokens"],
        temperature=config["temperature"],
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )
    return response.choices[0].message.content


async def _call_gemini(prompt: str, system: str, config: dict) -> str:
    genai.configure(api_key=config["api_key"])
    model = genai.GenerativeModel(
        model_name=config["model"],
        system_instruction=system,
        generation_config={
            "max_output_tokens": config["max_tokens"],
            "temperature": config["temperature"],
            "response_mime_type": "application/json",
        }
    )
    response = await model.generate_content_async(prompt)
    return response.text
