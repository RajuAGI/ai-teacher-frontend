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

  // Force Male voice
  window.speechSynthesis.onvoiceschanged = () => {
    const voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(v =>
      v.name.includes("David") ||
      v.name.includes("Google UK English Male") ||
      v.name.includes("Male") ||
      v.name.includes("Daniel") ||
      v.name.includes("James")
    );
    if (maleVoice) speech.voice = maleVoice;
  };

  // Try to set voice immediately too (in case voices already loaded)
  const voices = window.speechSynthesis.getVoices();
  const maleVoice = voices.find(v =>
    v.name.includes("David") ||
    v.name.includes("Google UK English Male") ||
    v.name.includes("Male") ||
    v.name.includes("Daniel") ||
    v.name.includes("James")
  );
  if (maleVoice) speech.voice = maleVoice;

  speech.rate = 0.95;
  speech.pitch = 0.8;
  speech.volume = 1;

  window.speechSynthesis.speak(speech);
}

function stopSpeaking() {
  window.speechSynthesis.cancel();
}

// Allow pressing Enter key to ask
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("questionInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") askTeacher();
  });
});
