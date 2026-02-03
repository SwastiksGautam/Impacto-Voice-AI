from openai import OpenAI
from app.config import Config
import io

class STTService:
    def __init__(self):
        self.client = OpenAI(api_key=Config.OPENAI_API_KEY)

    async def transcribe(self, audio_bytes: bytes) -> str:
        # Buffer the bytes into a file-like object for Whisper
        buffer = io.BytesIO(audio_bytes)
        buffer.name = "input.wav"
        
        transcript = self.client.audio.transcriptions.create(
            model=Config.STT_MODEL,
            file=buffer
        )
        return transcript.text