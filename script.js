const BACKEND_URL = "https://ai-teacher-backend-ngbs.onrender.com";

let currentAnswer = "";
let sentences = [];
let currentIndex = 0;

async function askTeacher() {
  const question = document.getElementById("questionInput").value.trim();

  if (!question) {
    alert("पहले कोई सवाल लिखें!");
    return;
  }

  const answerText = document.getElementById("answerText");
  answerText.innerText = "🤔 सोच रहा हूं...";
  document.getElementById("speakBtn").disabled = true;
  document.getElementById("stopBtn").disabled = true;

  try {
    const response = await fetch(`${BACKEND_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question })
    });

    const data = await response.json();
    currentAnswer = data.answer || data.error || "कोई जवाब नहीं मिला";
    answerText.innerText = currentAnswer;

    document.getElementById("speakBtn").disabled = false;
    document.getElementById("stopBtn").disabled = false;

    speakAnswer();

  } catch (error) {
    answerText.innerText = "❌ Backend से connection नहीं हो पाया।";
  }
}

function splitIntoSentences(text) {
  return text.match(/[^।\.!\?]+[।\.!\?]+/g) || [text];
}

function getIndianMaleVoice() {
  const voices = window.speechSynthesis.getVoices();

  // पहले Hindi India voice ढूंढो
  let voice = voices.find(v => v.lang === "hi-IN");

  // फिर Indian English ढूंढो
  if (!voice) voice = voices.find(v => v.lang === "en-IN");

  // फिर Ravi या Google Hindi ढूंढो
  if (!voice) voice = voices.find(v =>
    v.name.includes("Ravi") ||
    v.name.includes("Google हिन्दी") ||
    v.name.includes("Hindi")
  );

  // आखिर में कोई भी male voice
  if (!voice) voice = voices.find(v =>
    v.name.includes("David") ||
    v.name.includes("Daniel") ||
    v.name.includes("James") ||
    v.name.includes("Male")
  );

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

  // Hindi voice मिली तो Hindi lang set करो
  if (voice && voice.lang === "hi-IN") {
    speech.lang = "hi-IN";
  } else {
    speech.lang = "en-IN"; // Indian English accent
  }

  speech.rate = 1;   // थोड़ा धीमा — Indian style
  speech.pitch = 0.55;  // गहरी आवाज़ — पुरुष जैसी
  speech.volume = 1;

  speech.onend = () => {
    currentIndex++;
    speakNextSentence();
  };

  speech.onerror = () => {
    currentIndex++;
    speakNextSentence();
  };

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

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("questionInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") askTeacher();
  });
});
// ===== Google Search =====
async function doSearch() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) {
    alert("कुछ search करो!");
    return;
  }

  const resultsBox = document.getElementById("searchResults");
  resultsBox.style.display = "block";
  resultsBox.innerHTML = `
    <div class="search-loading">
      🔍 "${query}" search हो रहा है...
    </div>
  `;

  try {
    const response = await fetch(`${BACKEND_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query })
    });

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      resultsBox.innerHTML = `
        <p style="color:#888;font-size:13px;margin-bottom:10px">
          "${query}" के लिए ${data.results.length} results मिले:
        </p>
      `;

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
      resultsBox.innerHTML = `
        <div class="search-no-results">
          😔 कोई result नहीं मिला। दूसरे शब्दों में search करो।
        </div>
      `;
    }

  } catch (error) {
    resultsBox.innerHTML = `
      <div class="search-no-results">
        ❌ Search नहीं हो पाई। Internet check करो।
      </div>
    `;
  }
}

// Enter से search करो
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("questionInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") askTeacher();
  });

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") doSearch();
    });
  }
});
