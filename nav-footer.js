const NAV_HTML = `
<nav>
  <div class="logo">🧑‍🏫 राजू राम</div>
  <button class="nav-toggle" onclick="toggleMenu()">☰</button>
  <ul>
  <li><a href="avatar.html">AI Avatar</a></li>
    <li><a href="index.html">🏠 Home</a></li>
    <li><a href="courses.html">📚 Courses</a></li>
    <li><a href="quiz.html">🧠 Quiz</a></li>
    <li><a href="leaderboard.html">🏆 Leaderboard</a></li>
    <li><a href="about.html">ℹ️ About</a></li>
    <li><a href="contact.html">📞 Contact</a></li>
    <li><a href="login.html" class="login-btn">🔐 Login</a></li>
  </ul>
</nav>
`;

const FOOTER_HTML = `
<footer class="page-footer">
  <p>© 2025 AI Teacher - राजू राम। सर्वाधिकार सुरक्षित।</p>
</footer>
`;

document.addEventListener("DOMContentLoaded", () => {
  // Nav inject
  const navEl = document.getElementById("nav-placeholder");
  if (navEl) navEl.innerHTML = NAV_HTML;

  // Footer inject
  const footerEl = document.getElementById("footer-placeholder");
  if (footerEl) footerEl.innerHTML = FOOTER_HTML;

  // Active link highlight
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav ul a").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.style.color = "#e94560";
      link.style.fontWeight = "700";
      link.style.background = "rgba(233,69,96,0.15)";
    }
  });
});

function toggleMenu() {
  const ul = document.querySelector("nav ul");
  if (ul) ul.classList.toggle("active");
}
