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
## 📂 Project Structure
```
```
backend/
├── app/
│   ├── api/
│   │   └── routes.py                 # FastAPI Endpoints
│   │
│   ├── pipeline/
│   │   └── assistant.py              # Orchestration (STT -> LLM -> TTS)
│   │
│   ├── stt/
│   │   └── openai_stt.py             # Whisper Wrapper
│   │
│   ├── llm/
│   │   └── openai_llm.py             # GPT Wrapper (History-aware)
│   │
│   ├── tts/
│   │   └── openai_tts.py             # TTS Wrapper
│   │
│   └── config.py                     # Model & API configurations
│
├── main.py                           # Entry Point
└── requirements.txt                  # Pinned dependencies
```


## 🧠 System Architecture

### 🔄 Voice Assistant Pipeline
This application follows a modular **Speech → Intelligence → Speech** pipeline:

1. **Speech-to-Text (STT)** – Converts user voice into text  
2. **Large Language Model (LLM)** – Generates intelligent responses  
3. **Text-to-Speech (TTS)** – Converts assistant responses back into audio  

---

## ⚙️ Core Components

### 🎛️ Voice Assistant Orchestrator
- Coordinates the full pipeline **STT → LLM → TTS**
- Maintains **session-based conversation history**
- Automatically trims history to control token usage and latency
- Ensures smooth conversational flow

---

### 🎙️ STT Service
- Powered by **OpenAI Whisper (`whisper-1`)**
- Converts raw audio bytes into text transcripts
- Optimized for multi-accent speech recognition

---

### 🤖 LLM Service
- Uses **GPT-based chat completion**
- Implements a **system prompt** to:
  - Keep responses concise
  - Maintain voice-friendly conversational tone
- Supports context-aware conversation using session memory

---

### 🔊 TTS Service
- Converts assistant responses into natural speech audio
- Returns raw audio bytes for playback
- Uses configurable voice and model selection

---

## 🌐 API Endpoints

### 🎤 `POST /api/voice`
Processes user audio and returns:

```json
{
  "transcript": "User speech text",
  "reply": "Assistant response",
  "audio": "Base64-encoded audio"
}
```

---

### 🧾 `POST /api/start_session`
- Initializes a new conversation session  
- Enables contextual multi-turn conversation  

---

### 🛑 `POST /api/end_session`
- Terminates an active session  
- Clears stored conversation history  

---

## 🔧 Configuration

### 🌱 Environment Variables
```
OPENAI_API_KEY=your_api_key_here
```

---

### 🧩 Model Configuration
```python
LLM_MODEL = "gpt-4o-mini"
STT_MODEL = "whisper-1"
TTS_MODEL = "gpt-4o-mini-tts"
TTS_VOICE = "alloy"
```

---

## 🖥️ Frontend (Demo Only)

A lightweight demonstration frontend is included to:

- 🎤 Record microphone input
- 🤫 Detect silence using VAD-style logic
- 📡 Send audio to backend
- 🔊 Play assistant voice responses
- ✋ Support barge-in (interrupt assistant playback)

> The frontend is provided only for demonstration and is not required for assessment.

---

## ⚖️ Design Trade-offs

| Decision | Reason |
|----------|-----------|
| In-memory session storage | Reduces complexity and setup time |
| Synchronous processing | Improves readability and debugging |
| No streaming implementation | Keeps architecture simpler |
| Short response generation | Optimized for voice interaction latency |

---

## 📊 Evaluation Alignment

This project highlights:

- ✅ Strong system architecture design  
- ✅ Practical implementation of LLM workflows  
- ✅ Understanding of Voice AI constraints  
- ✅ Clean and modular code structure  
- ✅ Explicit documentation of trade-offs  

---

## 📝 Notes
- Some implementations are intentionally simplified  
- Architecture is designed for easy extension:
  - Streaming responses  
  - Database session persistence  
  - Horizontal scaling  

---

## 👨‍💻 Author
**Swastik**  
AI Intern Candidate — LLMs & Voice AI
