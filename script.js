const BACKEND_URL = "https://ai-teacher-backend-ngbs.onrender.com";

let currentAnswer = "";
let currentAudioObj = null;

// ===== AI TEACHER =====
async function askTeacher() {
  const questionInput = document.getElementById("questionInput");
  const question = questionInput.value.trim();
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

    // ✅ Question को Search box में डालो और search करो
    autoSearchQuestion(question);

    // Audio play करो
    if (data.audio) {
      playBackendAudio(data.audio);
    } else {
      speakAnswer();
    }

  } catch {
    answerText.innerText = "❌ Backend से connection नहीं हो पाया। कृपया थोड़ी देर बाद कोशिश करें।";
  }
}

// ✅ Search box में question copy करके auto search
function autoSearchQuestion(question) {
  const searchBox = document.getElementById("searchInput");
  if (!searchBox) return;

  searchBox.value = question;

  const resultsBox = document.getElementById("searchResults");
  if (resultsBox) {
    resultsBox.style.display = "block";
    resultsBox.innerHTML = `<div class="search-loading">🔍 "${question}" search हो रहा है...</div>`;
  }

  fetch(`${BACKEND_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: question })
  })
  .then(res => res.json())
  .then(data => {
    if (!resultsBox) return;
    if (data.results && data.results.length > 0) {
      resultsBox.innerHTML = `<p style="color:#888;font-size:12px;margin-bottom:10px;padding:0 4px">🔍 "${question}" के लिए ${data.results.length} results:</p>`;
      data.results.forEach(result => {
        const item = document.createElement("div");
        item.className = "search-result-item";
        const isWiki = result.is_wiki || (result.url && result.url.includes("wikipedia.org"));
        item.innerHTML = `
          ${isWiki ? '<span style="display:inline-block;background:#3366cc;color:white;font-size:11px;font-weight:700;padding:2px 10px;border-radius:10px;margin-bottom:6px;">📖 Wikipedia</span>' : ''}
          <h4>${result.title || "No Title"}</h4>
          <p>${result.snippet || ""}</p>
          <a href="${result.url}" target="_blank" rel="noopener">${result.url}</a>
        `;
        item.onclick = (e) => {
          if (!e.target.closest("a")) window.open(result.url, "_blank", "noopener");
        };
        resultsBox.appendChild(item);
      });
    } else {
      resultsBox.innerHTML = `<div class="search-no-results">😔 कोई result नहीं मिला।</div>`;
    }
  })
  .catch(() => {
    if (resultsBox) resultsBox.innerHTML = `<div class="search-no-results">❌ Search नहीं हो पाई।</div>`;
  });
}

// ===== MANUAL SEARCH =====
async function doSearch() {
  const searchBox = document.getElementById("searchInput");
  const query = searchBox ? searchBox.value.trim() : "";
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
      resultsBox.innerHTML = `<p style="color:#888;font-size:12px;margin-bottom:10px;padding:0 4px">🔍 "${query}" के लिए ${data.results.length} results:</p>`;
      data.results.forEach(result => {
        const item = document.createElement("div");
        item.className = "search-result-item";
        const isWiki = result.is_wiki || (result.url && result.url.includes("wikipedia.org"));
        item.innerHTML = `
          ${isWiki ? '<span style="display:inline-block;background:#3366cc;color:white;font-size:11px;font-weight:700;padding:2px 10px;border-radius:10px;margin-bottom:6px;">📖 Wikipedia</span>' : ''}
          <h4>${result.title || "No Title"}</h4>
          <p>${result.snippet || ""}</p>
          <a href="${result.url}" target="_blank" rel="noopener">${result.url}</a>
        `;
        item.onclick = (e) => {
          if (!e.target.closest("a")) window.open(result.url, "_blank", "noopener");
        };
        resultsBox.appendChild(item);
      });
    } else {
      resultsBox.innerHTML = `<div class="search-no-results">😔 कोई result नहीं मिला। दूसरे शब्दों में search करो।</div>`;
    }

  } catch (err) {
    resultsBox.innerHTML = `<div class="search-no-results">❌ Search नहीं हो पाई।</div>`;
  }
}

// ===== AUDIO =====
function playBackendAudio(base64Audio) {
  stopSpeaking();
  if (currentAudioObj) { currentAudioObj.pause(); }
  const audio = new Audio("data:audio/mp3;base64," + base64Audio);
  audio.playbackRate = 1.3;
  currentAudioObj = audio;
  audio.play().catch(() => speakAnswer());
}

function speakAnswer() {
  const avatar = document.getElementById("aiAvatar");
  avatar.style.transform = "scale(1.1)";
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

// ===== EVENT LISTENERS =====
document.addEventListener("DOMContentLoaded", () => {
  const qInput = document.getElementById("questionInput");
  if (qInput) qInput.addEventListener("keypress", e => { if (e.key === "Enter") askTeacher(); });

  const sInput = document.getElementById("searchInput");
  if (sInput) sInput.addEventListener("keypress", e => { if (e.key === "Enter") doSearch(); });
});
