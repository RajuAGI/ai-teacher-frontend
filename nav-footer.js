const NAV_HTML = `
<nav>
  <div class="logo">🧑‍🏫 राजू राम</div>
  <button class="nav-toggle" onclick="toggleMenu()">☰</button>
  <ul>
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
  const navPlaceholder = document.getElementById("nav-placeholder");
  if(navPlaceholder) navPlaceholder.innerHTML = NAV_HTML;
  const footerPlaceholder = document.getElementById("footer-placeholder");
  if(footerPlaceholder) footerPlaceholder.innerHTML = FOOTER_HTML;

  // Active link highlight
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav ul a").forEach(link => {
    if(link.getAttribute("href") === currentPage) {
      link.style.color="#e94560";
      link.style.fontWeight="bold";
    }
  });
});

function toggleMenu() {
  document.querySelector("nav ul").classList.toggle("active");
}
