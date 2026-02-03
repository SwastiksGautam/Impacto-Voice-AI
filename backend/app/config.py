import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    LLM_MODEL = "gpt-4o-mini"
    STT_MODEL = "whisper-1"
    TTS_MODEL = "gpt-4o-mini-tts"
    TTS_VOICE = "alloy"