// main.js

// --- Theme Toggle (persistent across pages) ---
const body = document.body;

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light'; 
body.className = savedTheme;

function setTheme(theme) {
  body.className = theme;
  localStorage.setItem('theme', theme);
}

// Button listeners
const lightBtn = document.getElementById('lightBtn');
const darkBtn = document.getElementById('darkBtn');
const readingBtn = document.getElementById('readingBtn');

if (lightBtn) lightBtn.addEventListener('click', () => setTheme('light'));
if (darkBtn) darkBtn.addEventListener('click', () => setTheme('dark'));
if (readingBtn) readingBtn.addEventListener('click', () => setTheme('reading'));