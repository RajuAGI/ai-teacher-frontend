const BACKEND_URL = "https://ai-teacher-backend-ngbs.onrender.com";

let currentAnswer = "";
let currentAudioObj = null;

// ===== AI TEACHER =====
async function askTeacher() {
  const question = document.getElementById("questionInput").value.trim();
  if (!question) return alert("पहले कोई सवाल लिखें!");

  const answerText = document.getElementById("answerText");
  answerText.innerText = "🤔 सोच रहा हूं...";
  document.getElementById("speakBtn").disabled = true;
  document.getElementById("stopBtn").disabled = true;

  try {
    const response = await fetch(`${BACKEND_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    const data = await response.json();
    currentAnswer = data.answer || data.error || "कोई जवाब नहीं मिला";
    answerText.innerText = currentAnswer;

    document.getElementById("speakBtn").disabled = false;
    document.getElementById("stopBtn").disabled = false;

    // ✅ AI का सवाल Search box में copy करो और auto search करो
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.value = question;
      doSearch();
    }

    // Backend audio play करो
    if (data.audio) {
      playBackendAudio(data.audio);
    } else {
      speakAnswer();
    }

  } catch {
    answerText.innerText = "❌ Backend से connection नहीं हो पाया। कृपया थोड़ी देर बाद कोशिश करें।";
  }
}

// ===== AUDIO =====
function playBackendAudio(base64Audio) {
  stopSpeaking();
  if (currentAudioObj) { currentAudioObj.pause(); }
  const audio = new Audio("data:audio/mp3;base64," + base64Audio);
  audio.playbackRate = 1.3;
  currentAudioObj = audio;
  audio.play().catch(() => speakAnswer()); // fallback to browser TTS
}

function speakAnswer() {
  if (!currentAnswer) return;
  window.speechSynthesis.cancel();
  const sentences = currentAnswer.match(/[^।\.!?]+[।\.!?]*/g) || [currentAnswer];
  let i = 0;

  function speakNext() {
    if (i >= sentences.length) return;
    const s = sentences[i].trim();
    if (!s) { i++; speakNext(); return; }
    const utt = new SpeechSynthesisUtterance(s);
    const voices = window.speechSynthesis.getVoices();
    const hiVoice = voices.find(v => v.lang === "hi-IN") || voices.find(v => v.lang === "en-IN");
    if (hiVoice) utt.voice = hiVoice;
    utt.lang = hiVoice?.lang || "hi-IN";
    utt.rate = 1;
    utt.pitch = 0.6;
    utt.onend = () => { i++; speakNext(); };
    utt.onerror = () => { i++; speakNext(); };
    window.speechSynthesis.speak(utt);
  }
  speakNext();
}

function stopSpeaking() {
  window.speechSynthesis.cancel();
  if (currentAudioObj) { currentAudioObj.pause(); currentAudioObj.currentTime = 0; }
}

// ===== WEB SEARCH (shows results on page) =====
async function doSearch() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return alert("कुछ search करो!");

  const resultsBox = document.getElementById("searchResults");
  resultsBox.style.display = "block";
  resultsBox.innerHTML = `<div class="search-loading">🔍 "${query}" search हो रहा है...</div>`;

  try {
    const response = await fetch(`${BACKEND_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      resultsBox.innerHTML = `
        <p style="color:#888;font-size:12px;margin-bottom:10px;padding:0 4px">
          🔍 "${query}" के लिए ${data.results.length} results:
        </p>
      `;
      data.results.forEach(result => {
        const item = document.createElement("div");
        item.className = "search-result-item";
        item.innerHTML = `
          <h4>${result.title || "No Title"}</h4>
          <p>${result.snippet || ""}</p>
          <a href="${result.url}" target="_blank" rel="noopener">${result.url}</a>
        `;
        // Click पर नए tab में open — लेकिन results page पर ही रहें
        item.onclick = (e) => {
          if (!e.target.closest("a")) {
            window.open(result.url, "_blank", "noopener");
          }
        };
        resultsBox.appendChild(item);
      });
    } else {
      resultsBox.innerHTML = `
        <div class="search-no-results">
          😔 कोई result नहीं मिला। दूसरे शब्दों में search करो।
        </div>
      `;
    }

  } catch (err) {
    console.error("Search error:", err);
    resultsBox.innerHTML = `
      <div class="search-no-results">
        ❌ Search नहीं हो पाई — Backend check करो।<br>
        <small style="color:#aaa">${err.message}</small>
      </div>
    `;
  }
}

// ===== EVENT LISTENERS =====
document.addEventListener("DOMContentLoaded", () => {
  const qInput = document.getElementById("questionInput");
  if (qInput) qInput.addEventListener("keypress", e => { if (e.key === "Enter") askTeacher(); });

  const sInput = document.getElementById("searchInput");
  if (sInput) sInput.addEventListener("keypress", e => { if (e.key === "Enter") doSearch(); });
});
