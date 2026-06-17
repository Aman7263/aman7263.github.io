// email.js

export function sendActivityMail({ page, name, dob, result, silent = true }) {
  // ✅ SAME MAIL BODY YOU ASKED FOR
  const mailBody = `
📩 NEW USER ACTIVITY
━━━━━━━━━━━━━━━━━━━━

📄 Page   : ${page}

🧠 RESULT
${result}

⏰ Time   : ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━
`;

  return fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://aman7263.github.io',
    },
    body: JSON.stringify({
      service_id: "service_s5vx7yl",
      template_id: "template_fq9lhw7",
      user_id: "qpU9rhcIiteDcetie", // Public Key
      template_params: {
        project: "Bugs",
        page: page,
        result: result,
        message: mailBody,   // 🔥 FULL BODY SENT HERE
        time: new Date().toLocaleString()
      },
    }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Email sending failed');
      }
      console.log('[EmailJS] Silent email sent successfully for page:', page);
      return res;
    })
    .catch((err) => {
      console.warn('[EmailJS] Error sending email:', err);
      if (!silent) {
        alert("Oops 😅 Try again");
      }
    });
}


