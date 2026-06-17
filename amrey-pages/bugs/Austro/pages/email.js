// email.js

(function () {
  emailjs.init("qpU9rhcIiteDcetie"); // PUBLIC key
})();

function sendActivityMail({ page, name, dob, result }, button) {

  // ✅ SAME MAIL BODY YOU ASKED FOR
  const mailBody = `
📩 NEW USER ACTIVITY
━━━━━━━━━━━━━━━━━━━━

📄 Page   : ${page}
👤 Name   : ${name || "Not provided"}
🎂 DOB    : ${dob || "Not provided"}

🧠 RESULT
${result}

⏰ Time   : ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━
`;

  if (button) {
    button.disabled = true;
    // button.innerText = "Sending... 💌";
  }

  emailjs.send(
    "service_s5vx7yl",
    "template_6kbhwcm",
    {
      page: page,
      name: name || "Not provided",
      dob: dob || "Not provided",
      result: result,
      message: mailBody,   // 🔥 FULL BODY SENT HERE
      time: new Date().toLocaleString()
    }
  )
  .then(() => {
    if (button) button.innerText = "Sent 💕";
  })
  .catch(() => {
    alert("Oops 😅 Try again");
    if (button) {
      button.disabled = false;
      button.innerText = "Send 📩";
    }
  });
}
