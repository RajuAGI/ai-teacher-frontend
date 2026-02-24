const BACKEND_URL = "https://ai-teacher-backend-ngbs.onrender.com";

// ===== AI Teacher Variables =====
let currentAnswer = "";
let sentences = [];
let currentIndex = 0;

// ===== AI Teacher: Ask Question =====
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

    speakAnswer();
  } catch {
    answerText.innerText = "❌ Backend से connection नहीं हो पाया।";
  }
}

// ===== Speech Helper =====
function splitIntoSentences(text) {
  return text.match(/[^।\.!\?]+[।\.!\?]+/g) || [text];
}

function getIndianMaleVoice() {
  const voices = window.speechSynthesis.getVoices();
  let voice = voices.find(v => v.lang === "hi-IN");
  if (!voice) voice = voices.find(v => v.lang === "en-IN");
  if (!voice) voice = voices.find(v => v.name.includes("Ravi") || v.name.includes("Google हिन्दी") || v.name.includes("Hindi"));
  if (!voice) voice = voices.find(v => v.name.includes("David") || v.name.includes("Daniel") || v.name.includes("Male"));
  return voice;
}

function speakNextSentence() {
  if (currentIndex >= sentences.length) return;
  const sentence = sentences[currentIndex].trim();
  if (!sentence) {
    currentIndex++;
    speakNextSentence();
    return;
  }

  const speech = new SpeechSynthesisUtterance(sentence);
  const voice = getIndianMaleVoice();
  if (voice) speech.voice = voice;
  speech.lang = voice?.lang || "en-IN";
  speech.rate = 1;
  speech.pitch = 0.55;
  speech.volume = 1;

  speech.onend = () => { currentIndex++; speakNextSentence(); };
  speech.onerror = () => { currentIndex++; speakNextSentence(); };

  window.speechSynthesis.speak(speech);
}

function speakAnswer() {
  if (!currentAnswer) return;
  window.speechSynthesis.cancel();
  currentIndex = 0;
  sentences = splitIntoSentences(currentAnswer);
  speakNextSentence();
}

function stopSpeaking() {
  window.speechSynthesis.cancel();
  currentIndex = sentences.length;
}

window.speechSynthesis.onvoiceschanged = () => {
  console.log("Available voices:", window.speechSynthesis.getVoices().map(v => `${v.name} (${v.lang})`));
};

// ===== Google / Web Search =====
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
      resultsBox.innerHTML = `<p style="color:#888;font-size:13px;margin-bottom:10px">"${query}" के लिए ${data.results.length} results मिले:</p>`;
      data.results.forEach(result => {
        const item = document.createElement("div");
        item.className = "search-result-item";
        item.innerHTML = `
          <h4>${result.title}</h4>
          <p>${result.snippet}</p>
          <a href="${result.url}" target="_blank">${result.url}</a>
        `;
        item.onclick = () => window.open(result.url, "_blank");
        resultsBox.appendChild(item);
      });
    } else {
      // ===== Fallback: Open Google if backend returns empty =====
      resultsBox.innerHTML = `<div class="search-no-results">❌ Search backend से नहीं मिली। Directly Google खोल रहे हैं...</div>`;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
    }

  } catch {
    resultsBox.innerHTML = `<div class="search-no-results">❌ Search failed। Directly Google खोल रहे हैं...</div>`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
  }
}

// ===== Event Listeners =====
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("questionInput").addEventListener("keypress", e => {
    if (e.key === "Enter") askTeacher();
  });

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", e => {
      if (e.key === "Enter") doSearch();
    });
  }
});
