import re
from typing import List

from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.ollama import OllamaChatCompletionClient

from config import OLLAMA_MODEL, OLLAMA_HOST


def build_agent(agent_name: str, system_prompt: str) -> AssistantAgent:
    model_client = OllamaChatCompletionClient(
        model=OLLAMA_MODEL,
        host=OLLAMA_HOST,
    )
    return AssistantAgent(
        name=agent_name,
        model_client=model_client,
        system_message=system_prompt,
    )


def build_prompt(user_input: str, history_text: str, memories: List[str]) -> str:
    history_block = history_text.strip() if history_text.strip() else "(no prior turns in this session)"
    memory_block = "\n".join(f"- {m}" for m in memories) if memories else "(no stored memories yet)"

    return (
        "<context>\n"
        f"<history>\n{history_block}\n</history>\n"
        f"<memories>\n{memory_block}\n</memories>\n"
        "</context>\n\n"
        f"<user_message>\n{user_input}\n</user_message>\n\n"
        "Reply directly to the user. Output only your answer — no tags, labels, or context commentary."
    )


def clean_response(text: str) -> str:
    """Strip common LLM leakage of prompt structure from the final reply."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()

    leakage_patterns = [
        r"^Recent Conversation:.*?(?=\n\n|\Z)",
        r"^Memories:.*?(?=\n\n|\Z)",
        r"^<context>.*?</context>\s*",
        r"^<user_message>.*?</user_message>\s*",
    ]
    for pattern in leakage_patterns:
        cleaned = re.sub(pattern, "", cleaned, flags=re.DOTALL | re.IGNORECASE).strip()

    meta_prefixes = (
        "Recent Conversation:",
        "Memories:",
        "Based on your memories,",
        "Based on the memories,",
    )
    for prefix in meta_prefixes:
        if cleaned.startswith(prefix):
            parts = cleaned.split("\n\n", 1)
            if len(parts) == 2 and not parts[1].startswith(("Recent Conversation:", "Memories:")):
                cleaned = parts[1].strip()
            break

    return cleaned.strip() or text.strip()


async def run_agent(agent: AssistantAgent, prompt: str) -> str:
    await agent.model_context.clear()
    result = await agent.run(task=prompt)
    return result.messages[-1].content
