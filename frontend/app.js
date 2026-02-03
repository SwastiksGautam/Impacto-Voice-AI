// 1. Configuration: Use your production Render URL
const API_BASE_URL = "https://impacto-voice-ai.onrender.com/api";

let mediaRecorder;
let audioChunks = [];
let audioContext;
let analyser;
let silenceStart = null;
const SILENCE_DURATION = 4000; // 4 seconds of silence to trigger stop

const chat = document.getElementById("chat");
const status = document.getElementById("status");
const recordBtn = document.getElementById("recordBtn");
const audioPlayer = document.getElementById("audioPlayer");

// 2. Generate a unique Session ID
const sessionId = crypto.randomUUID();

// 3. Session Management: Start & End
async function startSession() {
    try {
        await fetch(`${API_BASE_URL}/start_session`, {
            method: "POST",
            body: new URLSearchParams({ session_id: sessionId })
        });
        console.log("Session started successfully:", sessionId);
    } catch (err) {
        console.error("Error starting session:", err);
    }
}

/**
 * Using navigator.sendBeacon for session end ensures the request 
 * actually reaches Render even if the tab is closed instantly.
 */
window.addEventListener("beforeunload", () => {
    const params = new URLSearchParams({ session_id: sessionId });
    navigator.sendBeacon(`${API_BASE_URL}/end_session`, params);
});

// Initialize the session on page load
startSession();

// 4. UI Helper
function addMessage(text, sender) {
    if (!text) return;
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;
    msg.innerText = text;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

// 5. Recording Logic
recordBtn.onclick = async () => {
    // BARGE-IN: Stop any currently playing AI voice when user starts speaking
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = "";
    }

    status.innerText = "Listening...";
    audioChunks = [];
    silenceStart = null;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.start();

        // Audio context for silence detection (VAD)
        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        detectSilence();
    } catch (err) {
        console.error("Mic access denied:", err);
        status.innerText = "Mic Error";
    }
};

function detectSilence() {
    const data = new Uint8Array(analyser.fftSize);

    const check = () => {
        if (!analyser) return;
        analyser.getByteTimeDomainData(data);

        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += Math.abs(data[i] - 128);
        }

        const volume = sum / data.length;

        // Threshold of 5 is a good baseline for "silence"
        if (volume < 5) {
            if (!silenceStart) silenceStart = Date.now();
            if (Date.now() - silenceStart > SILENCE_DURATION) {
                stopRecording();
                return;
            }
        } else {
            silenceStart = null;
        }

        requestAnimationFrame(check);
    };

    check();
}

function stopRecording() {
    status.innerText = "Thinking...";
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }

    if (audioContext) {
        audioContext.close();
        audioContext = null;
        analyser = null;
    }

    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();

        formData.append("file", audioBlob, "user_voice.wav");
        formData.append("session_id", sessionId);

        try {
            const res = await fetch(`${API_BASE_URL}/voice`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error(`Backend error: ${res.status}`);

            const data = await res.json();

            // UI updates
            addMessage(data.transcript || "User Message", "user");
            addMessage(data.reply, "bot");

            // Playback AI response
            if (data.audio) {
                // OpenAI TTS returns MPEG/MP3 data
                audioPlayer.src = `data:audio/mpeg;base64,${data.audio}`;
                audioPlayer.play();
            }

        } catch (err) {
            console.error("API Error:", err);
            addMessage("Connection error. Is the backend awake?", "bot");
        }

        status.innerText = "Idle";
    };
}