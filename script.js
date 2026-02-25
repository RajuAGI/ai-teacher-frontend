let currentSpeech = null;

async function askTeacher() {
  const question = document.getElementById("questionInput").value;
  if (!question) return;

  document.getElementById("answerText").innerText = "सोच रहा हूँ...";
  
  try {
    const response = await fetch("/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    const data = await response.json();
    const answer = data.answer || "कोई जवाब नहीं मिला।";

    document.getElementById("answerText").innerText = answer;

    document.getElementById("speakBtn").disabled = false;

    // AUTO SPEAK
    speakAnswer(answer);

  } catch (error) {
    document.getElementById("answerText").innerText = "त्रुटि हुई।";
  }
}

function speakAnswer(customText = null) {
  const text = customText || document.getElementById("answerText").innerText;
  if (!text) return;

  const avatar = document.getElementById("aiAvatar");

  currentSpeech = new SpeechSynthesisUtterance(text);
  currentSpeech.lang = "hi-IN";

  avatar.classList.add("speaking");

  currentSpeech.onend = function () {
    avatar.classList.remove("speaking");
    document.getElementById("stopBtn").disabled = true;
  };

  speechSynthesis.speak(currentSpeech);

  document.getElementById("stopBtn").disabled = false;
}

function stopSpeaking() {
  speechSynthesis.cancel();
  document.getElementById("aiAvatar").classList.remove("speaking");
  document.getElementById("stopBtn").disabled = true;
}
