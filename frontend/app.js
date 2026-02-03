let mediaRecorder;
let audioChunks = [];
let audioContext;
let analyser;
let silenceStart = null;
const SILENCE_DURATION = 4000; 

const chat = document.getElementById("chat");
const status = document.getElementById("status");
const recordBtn = document.getElementById("recordBtn");
const audioPlayer = document.getElementById("audioPlayer");

const sessionId = crypto.randomUUID();

async function startSession() {
    try {
        await fetch("http://127.0.0.1:8000/api/start_session", {
            method: "POST",
            body: new URLSearchParams({ session_id: sessionId })
        });
        console.log("Session started:", sessionId);
    } catch (err) {
        console.error("Error starting session:", err);
    }
}

window.addEventListener("beforeunload", async () => {
    try {
        await fetch("http://127.0.0.1:8000/api/end_session", {
            method: "POST",
            body: new URLSearchParams({ session_id: sessionId })
        });
        console.log("Session ended:", sessionId);
    } catch (err) {
        console.error("Error ending session:", err);
    }
});

startSession(); 

function addMessage(text, sender) {
    if (!text) return;
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;
    msg.innerText = text;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

recordBtn.onclick = async () => {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = "";
    }

    status.innerText = "Listening...";
    audioChunks = [];
    silenceStart = null;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.start();

    // Audio context for silence detection
    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    detectSilence();
};

function detectSilence() {
    const data = new Uint8Array(analyser.fftSize);

    const check = () => {
        analyser.getByteTimeDomainData(data);

        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += Math.abs(data[i] - 128);
        }

        const volume = sum / data.length;

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
    mediaRecorder.stop();
    if (audioContext) audioContext.close();

    mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();

        formData.append("file", audioBlob, "user_voice.wav");
        formData.append("session_id", sessionId);

        try {
            const res = await fetch("http://127.0.0.1:8000/api/voice", {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Backend error: " + res.status);

            const data = await res.json();

           
            addMessage(data.transcript || "User Voice Message", "user");
            addMessage(data.reply, "bot");

            
            if (data.audio) {
                audioPlayer.src = `data:audio/mpeg;base64,${data.audio}`;
                audioPlayer.play();
            }

        } catch (err) {
            console.error(err);
            addMessage("Error connecting to backend.", "bot");
        }

        status.innerText = "Idle";
    };
}
