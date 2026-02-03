# 🎤 Voice-Enabled AI Assistant  
**AI Intern (LLMs & Voice AI) – Technical Assessment**

---

## Overview
This project implements a **voice-enabled AI assistant** that accepts spoken input, converts it to text, generates a response using a Large Language Model (LLM), converts the response back to speech, and returns the audio output.

The focus of this project is on **clean architecture, modular design, and reasoning**, rather than UI complexity.

Both **real APIs (OpenAI)** and production-style design patterns are used, while keeping the system minimal and easy to understand.

---

## Problem Statement (Assessment Context)

The assistant should:
1. Accept user voice input  
2. Convert **Speech → Text (STT)**  
3. Generate a response using an **LLM**  
4. Convert **Text → Speech (TTS)**  
5. Return the audio response  

A UI is **not required** for evaluation (a small demo UI is included only for testing).

---

## Part A – System Design

### Components

User Audio
↓
Speech-to-Text (Whisper)
↓
Conversation Manager (Session History)
↓
LLM (Reasoning)
↓
Text-to-Speech
↓
Audio Response



### Core Services

| Component | Responsibility |
|--------|----------------|
| STTService | Converts audio bytes to text |
| LLMService | Generates responses using an LLM |
| TTSService | Converts text to speech |
| VoiceAssistant | Orchestrates pipeline & sessions |
| FastAPI API | Exposes HTTP endpoints |

---

### Data Flow

1. Client sends recorded audio to `/voice`
2. Audio bytes → STT → transcript
3. Transcript added to session history
4. History passed to LLM
5. LLM generates response text
6. Response text → TTS → audio bytes
7. Audio returned as Base64

---

### Latency, Cost & Failure Considerations

| Area | Consideration |
|----|-------------|
| STT | Network + inference latency |
| LLM | Token cost & response length |
| TTS | Audio generation delay |
| Sessions | In-memory, non-persistent |
| Failures | Handled gracefully with fallbacks |

Design decisions:
- Responses limited to **2 sentences** for voice UX
- Conversation history capped to last **10 messages**
- No streaming to keep implementation simple
- Stateless backend except for in-memory sessions

---

## Part B – Implementation

### High-Level Pipeline

```python
def voice_assistant(audio_input):
    text = speech_to_text(audio_input)
    reply = generate_llm_response(text)
    audio = text_to_speech(reply)
    return audio
```

backend/
├── app/
│   ├── api/
│   │   └── routes.py
│   ├── pipeline/
│   │   └── assistant.py
│   ├── stt/
│   │   └── openai_stt.py
│   ├── llm/
│   │   └── openai_llm.py
│   ├── tts/
│   │   └── openai_tts.py
│   └── config.py
├── main.py
├── requirements.txt
Key Modules
VoiceAssistant

Orchestrates STT → LLM → TTS

Maintains session-specific conversation history

Trims history to control context size

STTService

Uses OpenAI Whisper (whisper-1)

Converts audio bytes into text

LLMService

Uses GPT-based chat completion

System prompt enforces concise, voice-friendly replies

TTSService

Converts assistant text replies into audio

Returns raw audio bytes

API Endpoints
POST /api/voice

Processes user audio and returns:
{
  "transcript": "User speech text",
  "reply": "Assistant response",
  "audio": "Base64-encoded audio"
}
POST /api/start_session

Starts a new conversation session.

POST /api/end_session

Ends and clears a conversation session.

Configuration

Environment variables:
OPENAI_API_KEY=your_api_key_here

Model configuration:
LLM_MODEL = "gpt-4o-mini"
STT_MODEL = "whisper-1"
TTS_MODEL = "gpt-4o-mini-tts"
TTS_VOICE = "alloy"

Frontend 

A minimal frontend is included to:

Record microphone input

Detect silence (VAD-style)

Send audio to backend

Play assistant voice responses

Support barge-in (interrupt playback)

The frontend is not required for assessment and is provided only for demonstration.

Design Trade-offs

In-memory sessions instead of database (simplicity)

Synchronous API calls for clarity

No streaming to reduce complexity

Short responses optimized for voice interactions

Evaluation Alignment

This project demonstrates:

✅ System thinking & component separation

✅ Practical LLM usage

✅ Awareness of voice AI constraints

✅ Clean, readable, modular code

✅ Explicit design choices & trade-offs

Notes

Partial implementations are intentional

Emphasis is on reasoning and architecture

Easily extensible to streaming, persistence, or scaling

Author

Swastik
AI Intern Candidate – LLMs & Voice AI
