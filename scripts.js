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
