from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from app.pipeline.assistant import VoiceAssistant
import base64

router = APIRouter()
assistant = VoiceAssistant()

@router.post("/voice")
async def process_voice(file: UploadFile = File(...), session_id: str = Form(...)):
    audio_bytes = await file.read()
    
    audio_out, reply, transcript = await assistant.run(audio_bytes, session_id=session_id)
    
    audio_base64 = base64.b64encode(audio_out).decode("utf-8")

    return JSONResponse({
        "transcript": transcript,
        "reply": reply,
        "audio": audio_base64
    })

@router.post("/start_session")
async def start_session(session_id: str = Form(...)):
    assistant.start_session(session_id)
    return {"status": "Session started"}

@router.post("/end_session")
async def end_session(session_id: str = Form(...)):
    assistant.end_session(session_id)
    return {"status": "Session ended"}
