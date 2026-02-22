const BACKEND_URL = "https://ai-teacher-backend-ngbs.onrender.com";

let currentAnswer = "";

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

    // Auto speak the answer
    speakAnswer();

  } catch (error) {
    answerText.innerText = "❌ Error connecting to AI. Please check your backend.";
  }
}

function speakAnswer() {
  if (!currentAnswer) return;

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(currentAnswer);

  const voices = window.speechSynthesis.getVoices();

  // Try to find Indian male voice
  const indianVoice = voices.find(v =>
    v.name.includes("Ravi") ||          // Google Hindi Male
    v.name.includes("Hindi Male") ||
    v.name.includes("hi-IN") ||
    v.lang.includes("hi-IN") ||
    v.name.includes("Google हिन्दी") ||
    v.name.includes("Indian") ||
    v.name.includes("hi_IN")
  );

  if (indianVoice) {
    speech.voice = indianVoice;
    speech.lang = "hi-IN";
  } else {
    // Fallback — use English with Indian accent settings
    const englishVoice = voices.find(v =>
      v.name.includes("David") ||
      v.name.includes("Google UK English Male") ||
      v.name.includes("Daniel") ||
      v.name.includes("James")
    );
    if (englishVoice) speech.voice = englishVoice;
    speech.lang = "en-IN";  // Indian English accent
  }

  speech.rate = 0.85;   // Slightly slow like Indian dialect
  speech.pitch = 0.5;   // Deep male voice
  speech.volume = 1;

  window.speechSynthesis.speak(speech);
}

// Handle voices loaded after page load
window.speechSynthesis.onvoiceschanged = () => {
  console.log("Voices loaded:", window.speechSynthesis.getVoices().map(v => v.name));
};

function stopSpeaking() {
  window.speechSynthesis.cancel();
}

// Allow pressing Enter key to ask
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("questionInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") askTeacher();
  });
});
