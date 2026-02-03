from app.stt.openai_stt import STTService
from app.llm.openai_llm import LLMService
from app.tts.openai_tts import TTSService

class VoiceAssistant:
    def __init__(self):
        self.stt = STTService()
        self.llm = LLMService()
        self.tts = TTSService()
        self.sessions = {}

    def start_session(self, session_id: str):
        """Start a new session: clear old history."""
        self.sessions[session_id] = []

    def end_session(self, session_id: str):
        """End a session: delete history."""
        if session_id in self.sessions:
            del self.sessions[session_id]

    async def run(self, audio_bytes: bytes, session_id: str):
        """Process user audio and generate response using session-specific history."""
        text = await self.stt.transcribe(audio_bytes)
        if not text:
            return None, "Error: Could not transcribe", ""

       
        if session_id not in self.sessions:
            self.start_session(session_id)

        history = self.sessions[session_id]

        history.append({"role": "user", "content": text})

        history = history[-10:]  
        self.sessions[session_id] = history

        reply = await self.llm.generate(history)

        self.sessions[session_id].append({"role": "assistant", "content": reply})

        audio_out = await self.tts.synthesize(reply)

        return audio_out, reply, text
