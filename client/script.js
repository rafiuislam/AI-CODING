import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

const loader = (e) => {
  e.textContent = "";

  loadInterval = setInterval(() => {
    e.textContent += ".";

    if (e.textContent === "....") {
      e.textContent = "";
    }
  }, 300);
};

const typeText = (e, text) => {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      e.textContent += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 10);
};

const generateId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const hexaDecimal = random.toString(16);

  return `id-${timestamp}-${hexaDecimal}`;
};

const chatStripe = (isAi, value, uniqueId) => {
  return `
  <div class="wrapper ${isAi && "ai"}">
      <div class="chat">
          <div class="profile">
              <img 
                src="${isAi ? bot : user} "
                alt="${isAi ? "bot" : "user"}" 
              />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
      </div>
  </div>
`;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chatStripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  // bot's chatStripe
  const uniqueId = generateId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);
  // fetch data from server

  const response = await fetch("https://ai-coding.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.textContent = "";

  if (response.ok) {
    const data = await response.json();
    const parseData = data.bot.trim();

    typeText(messageDiv, parseData);
  } else {
    const err = await response.text();

    messageDiv.textContent = "Something went wrong!";

    alert(err);
  }
};
const copyText = (e) => {
  const text = e.target.textContent;

  const textArea = document.createElement("textarea");
  textArea.value = text;

  document.body.appendChild(textArea);
  textArea.select();

  document.execCommand("copy");
  document.body.removeChild(textArea);

  alert("Copied to clipboard!");
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13 && form.value !== "") {
    handleSubmit(e);
  }
});

chatContainer.addEventListener("click", (e) => {
  if (e.target && e.target.className === "message") {
    copyText(e);
  }
});
