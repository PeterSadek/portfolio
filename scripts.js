function toggleMobileMenu() {
  document.getElementById("menu").classList.toggle("active");
}

const darkModeToggle = document.getElementById("darkModeToggle");
const body = document.body;
const iconMoon = darkModeToggle.querySelector(".moon");
const iconSun = darkModeToggle.querySelector(".sun");

function setTheme(theme) {
  if (theme === "dark") {
    body.classList.add("dark-mode");
    iconMoon.classList.remove("active");
    iconSun.classList.add("active");
  } else {
    body.classList.remove("dark-mode");
    iconSun.classList.remove("active");
    iconMoon.classList.add("active");
  }
  localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  setTheme(savedTheme);
} else if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  setTheme("dark");
} else {
  setTheme("light");
}

darkModeToggle.addEventListener("click", () => {
  if (body.classList.contains("dark-mode")) {
    setTheme("light");
  } else {
    setTheme("dark");
  }
});

// Scroll observer for animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll("[data-animate]").forEach((el) => {
  observer.observe(el);
});

// chatbot integration
document.addEventListener("DOMContentLoaded", () => {
  // Get references to the new DOM elements for the floating widget
  const chatbotToggleButton = document.getElementById("chatbot-toggle-button");
  const closeButton = document.getElementById("close-button");
  const chatBoxWidget = document.getElementById("chat-box-widget");
  const chatLogArea = document.getElementById("chat-log-area");

  // Toggle chatbot visibility
  const toggleChatbot = () => {
    chatBoxWidget.classList.toggle("active");
    if (chatBoxWidget.classList.contains("active")) {
      userInput.focus();
    }
  };
  chatbotToggleButton.addEventListener("click", toggleChatbot);
  closeButton.addEventListener("click", toggleChatbot);
  const chatLog = document.getElementById("chat-log");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  // Dynamically retrieve information from the HTML
  const skillsList = document.querySelector("#skills")
    ? document.querySelector("#skills").textContent
    : "N/A";
  const workExperience = document.querySelector("#experience")
    ? document.querySelector("#experience").textContent
    : "N/A";
  const projects = document.querySelector("#projects")
    ? document.querySelector("#projects").textContent
    : "N/A";
  const hero = document.querySelector("#hero")
    ? document.querySelector("#hero").textContent
    : "N/A";

  const linkedinLink = document.querySelector("#linkedin-link")
    ? document.querySelector("#linkedin-link").href
    : "N/A";
  const githubLink = document.querySelector("#github-link")
    ? document.querySelector("#github-link").href
    : "N/A";
  const resumeLink = document.querySelector("#resume-link")
    ? document.querySelector("#resume-link").href
    : "N/A";

  const showLoadingIndicator = () => {
    const loadingLi = document.createElement("li");
    loadingLi.classList.add("loading-indicator", "chat-message-item", "bot");
    loadingLi.innerHTML = `
            <span class="avatar bot">AI</span>
            <div class="message bot">...</div>
          `;
    chatLog.appendChild(loadingLi);
    chatLogArea.scrollTop = chatLogArea.scrollHeight;
  };

  const removeLoadingIndicator = () => {
    const loadingIndicator = document.querySelector(".loading-indicator");
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  };

  const addMessageToChat = (message, role) => {
    const li = document.createElement("li");
    li.classList.add("chat-message-item", role);
    li.innerHTML = `
            <span class="avatar ${role}">${
      role === "user" ? "You" : "AI"
    }</span>
            <div class="message ${role}">${message}</div>
          `;
    chatLog.appendChild(li);
    chatLogArea.scrollTop = chatLogArea.scrollHeight;
  };

  const sendMessage = async () => {
    const userMessage = userInput.value.trim();
    if (userMessage === "") return;

    addMessageToChat(userMessage, "user");
    userInput.value = "";
    showLoadingIndicator();

    const systemPrompt = `You are Peter Sadek's friendly and helpful portfolio chatbot. Your purpose is to provide information about Peter, his professional experience, skills, social links and resume. You have access to the following information:
        - **Skills:** ${skillsList}
        - **Projects:** ${projects}
        - **Contact:** ${hero}
        - **Work Experience:** ${workExperience}
        - **Social Links:**
            - LinkedIn: ${linkedinLink}
            - GitHub: ${githubLink}
            - Resume: ${resumeLink}

        Answer all questions based *only* on the provided information. If a user asks something outside of your knowledge, politely state that you can only answer questions about Peter Sadek's portfolio.`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ systemPrompt, userMessage }),
      });
      const data = await response.json();

      removeLoadingIndicator();

      if (response.ok) {
        addMessageToChat(data.text, "bot");
        chatLogArea.offsetHeight;
        chatLogArea.scrollTop = chatLogArea.scrollHeight;
      } else {
        addMessageToChat(
          "Sorry, I couldn't get a response. Please try again.",
          "bot"
        );
        chatLogArea.offsetHeight;
        chatLogArea.scrollTop = chatLogArea.scrollHeight;
      }
    } catch (error) {
      removeLoadingIndicator();
      console.error("Error fetching data from Vercel API:", error);
      addMessageToChat("There was an error connecting to the chatbot.", "bot");
      chatLogArea.offsetHeight;
      chatLogArea.scrollTop = chatLogArea.scrollHeight;
    }
  };

  sendButton.addEventListener("click", sendMessage);

  userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });
});
