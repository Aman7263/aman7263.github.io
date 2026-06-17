const HEART_COUNT = 40;

for (let i = 0; i < HEART_COUNT; i++) {
  const heart = document.createElement("div");
  heart.className = "heart";
  heart.innerHTML = "💖";
  heart.style.left = Math.random() * 100 + "vw";
  heart.style.animationDuration = 3 + Math.random() * 4 + "s";
  document.body.appendChild(heart);
}
