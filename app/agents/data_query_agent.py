"""
Data Query Agent — allows Lead Teachers, Super Teachers, and Super Admin
to ask natural language questions about the collected data.
"""
import json
from app.agents.model import call_ai
from app.utils.logger import ai_logger


DATA_QUERY_SYSTEM_PROMPT = """
You are the VerticalGate Data Assistant. You help Lead Teachers, Super Teachers, and Super Admin
understand performance data. You receive a summary of the platform data and a user's question.

Your job is to answer questions like:
- Which Elite User has poor performance?
- Which Elite User has collected the most authentic Members?
- Which Elite Users have Members in more suitable domains?
- What's the overall eligibility rate?

You must:
1. Answer only based on the provided data summary
2. Be concise and factual
3. Highlight specific names and numbers when relevant
4. Return a JSON object: {"answer": "...", "key_data": {...}, "suggestions": [...]}

Return ONLY valid JSON.
"""


async def run_data_query(question: str, data_summary: dict) -> tuple[dict, str]:
    """
    Run a natural language query over the platform data.
    
    Args:
        question: The user's natural language question
        data_summary: Structured summary of relevant platform data
        
    Returns:
        (result_dict, provider_used)
    """
    ai_logger.info(f"Data query: {question[:100]}")
    
    user_prompt = f"""
Platform Data Summary:
{json.dumps(data_summary, indent=2)}

User Question: {question}

Please answer based only on the data provided.
"""
    
    raw_response, provider_used = await call_ai(user_prompt, DATA_QUERY_SYSTEM_PROMPT)
    result = json.loads(raw_response)
    
    ai_logger.info(f"Data query completed. Provider: {provider_used}")
    return result, provider_used
