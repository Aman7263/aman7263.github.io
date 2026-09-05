// ===== TEST MODE =====
const today = new Date();  
// const today = new Date("2026-02-16"); // change for testing
// =====================

const day = today.getDate();
const month = today.getMonth() + 1;

document.querySelectorAll('.box').forEach(box => {
  const boxDay = parseInt(box.dataset.day);

  // 🔒 Lock in January
  if (month === 1) {
    box.classList.add('locked');
  }

  // 🔒 Lock Feb 1–7
  else if (month === 2 && day < 8) {
    box.classList.add('locked');
  }

  // 🔓 From Feb 8 onward & all other months
  else {
    if (month === 2 && day < boxDay) {
      box.classList.add('locked');
    } else {
      box.classList.remove('locked');
    }
  }
});

function go(page) {
  window.location.href = "pages/" + page;
}

function valentineSuprise(){
  window.location.href = "../../love-surprise/index.html";
}