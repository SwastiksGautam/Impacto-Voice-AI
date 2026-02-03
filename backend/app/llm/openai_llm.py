from openai import OpenAI
from app.config import Config

class LLMService:
    def __init__(self):
       
        self.client = OpenAI(api_key=Config.OPENAI_API_KEY)

    async def generate(self, history: list) -> str:
        """
        history: List of dicts like [{"role": "user", "content": "..."},
                                      {"role": "assistant", "content": "..."}]
        """

        messages = [
            {
                "role": "system", 
                "content": "You are a concise voice assistant. Limit responses to 2 sentences."
            }
        ]

        messages.extend(history)

        response = self.client.chat.completions.create(
            model=Config.LLM_MODEL,
            messages=messages
        )

        return response.choices[0].message.content