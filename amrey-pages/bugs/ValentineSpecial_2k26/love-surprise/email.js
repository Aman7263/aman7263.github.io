// email.js

(function () {
  emailjs.init("qpU9rhcIiteDcetie"); // your PUBLIC key
})();

function sendLoveMessage(pageName, button) {
  const wrapper = button.closest(".love-message-box");
  const textarea = wrapper.querySelector(".love-input");
  const message = textarea.value.trim();

  if (!message) {
    alert("Write something first 😌");
    return;
  }

  button.disabled = true;
  button.innerText = "Sending... 💌";

  emailjs.send(
    "service_s5vx7yl",
    "template_fq9lhw7",
    {
      project: "ValentineSpecial_2k26 -- 💙", // 👈 add this
      page: pageName,
      message: message,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    }
  )
  .then(() => {
    button.innerText = "Sent 💕";
    textarea.value = "";
  })
  .catch(() => {
    alert("Oops 😅 Try again");
    button.disabled = false;
    button.innerText = "💖 Send this to me";
  });
}
