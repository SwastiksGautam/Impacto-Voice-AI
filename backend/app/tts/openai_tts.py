from openai import OpenAI
from app.config import Config

class TTSService:
    def __init__(self):
        self.client = OpenAI(api_key=Config.OPENAI_API_KEY)

    async def synthesize(self, text: str) -> bytes:
        response = self.client.audio.speech.create(
            model=Config.TTS_MODEL,
            voice=Config.TTS_VOICE,
            input=text
        )
        # Returns the raw binary of the audio
        return response.content