const BACKEND_URL = "https://ai-teacher-backend-ngbs.onrender.com";

let currentAnswer = "";
let sentences = [];
let currentIndex = 0;

async function askTeacher() {
  const question = document.getElementById("questionInput").value.trim();

  if (!question) {
    alert("Please type a question first!");
    return;
  }

  const answerText = document.getElementById("answerText");
  answerText.innerText = "🤔 Thinking...";
  document.getElementById("speakBtn").disabled = true;
  document.getElementById("stopBtn").disabled = true;

  try {
    const response = await fetch(`${BACKEND_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question })
    });

    const data = await response.json();
    currentAnswer = data.answer || data.error || "No answer received";
    answerText.innerText = currentAnswer;

    document.getElementById("speakBtn").disabled = false;
    document.getElementById("stopBtn").disabled = false;

    // Auto speak
    speakAnswer();

  } catch (error) {
    answerText.innerText = "❌ Error connecting to AI. Please check your backend.";
  }
}

// Split text into small sentences
function splitIntoSentences(text) {
  return text.match(/[^।\.!\?]+[।\.!\?]+/g) || [text];
}

function speakAnswer() {
  if (!currentAnswer) return;

  window.speechSynthesis.cancel();
  currentIndex = 0;

  // Split answer into small sentences
  sentences = splitIntoSentences(currentAnswer);

  speakNextSentence();
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

  // Set Indian male voice
  const voices = window.speechSynthesis.getVoices();
  const indianVoice = voices.find(v =>
    v.name.includes("Ravi") ||
    v.name.includes("Hindi Male") ||
    v.lang.includes("hi-IN") ||
    v.name.includes("Indian")
  );

  if (indianVoice) {
    speech.voice = indianVoice;
    speech.lang = "hi-IN";
  } else {
    const englishVoice = voices.find(v =>
      v.name.includes("David") ||
      v.name.includes("Google UK English Male") ||
      v.name.includes("Daniel") ||
      v.name.includes("James")
    );
    if (englishVoice) speech.voice = englishVoice;
    speech.lang = "en-IN";
  }

  speech.rate = 0.85;
  speech.pitch = 0.5;
  speech.volume = 1;

  // जब एक sentence खत्म हो तो अगला शुरू करो
  speech.onend = () => {
    currentIndex++;
    speakNextSentence();
  };

  // अगर कोई error आए तो अगला sentence try करो
  speech.onerror = () => {
    currentIndex++;
    speakNextSentence();
  };

  window.speechSynthesis.speak(speech);
}

function stopSpeaking() {
  window.speechSynthesis.cancel();
  currentIndex = sentences.length; // रोक दो
}

window.speechSynthesis.onvoiceschanged = () => {
  console.log("Voices loaded:", window.speechSynthesis.getVoices().map(v => v.name));
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("questionInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") askTeacher();
  });
});
