from openai import OpenAI
from app.config import Config

class LLMService:
    def __init__(self):
        self.client = OpenAI(api_key=Config.OPENAI_API_KEY)

    async def generate(self, history: list) -> str:
        """
        history: List of dicts like [{"role": "user", "content": "..."},
                                      {"role": "assistant", "content": "..."}]
        The last N exchanges are sent to the LLM.
        """
        # Prepend a system message for assistant behavior
        messages = [
            {"role": "system", "content": "You are a concise voice assistant. Limit responses to 2 sentences."}
        ]

        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})

        response = self.client.responses.create(
            model=Config.LLM_MODEL,
            input=messages
        )

        return response.output_text
