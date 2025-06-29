const API_URL = "https://your-backend-url.com"; // change to your actual backend

const postForm = document.getElementById("postForm");
const messageInput = document.getElementById("message");
const postsContainer = document.getElementById("postsContainer");
const formToggle = document.getElementById("formToggle");
const usernameOverlay = document.getElementById("usernameOverlay");
const usernameInput = document.getElementById("usernameInput");

let username = localStorage.getItem("whispr_username");
let allPosts = [];

// Show/hide form
formToggle.addEventListener("click", () => {
  postForm.style.display = postForm.style.display === "none" ? "flex" : "none";
});

// On load
window.onload = () => {
  if (!username) {
    usernameOverlay.style.display = "flex";
  } else {
    loadPosts();
  }
};

// Save username
function saveUsername() {
  const input = usernameInput.value.trim();
  if (!input) return alert("Enter a username.");
  username = input;
  localStorage.setItem("whispr_username", username);
  usernameOverlay.style.display = "none";
  loadPosts();
}

// Submit post
postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, username }),
  });

  messageInput.value = "";
  await loadPosts();
});

// Load all posts
async function loadPosts() {
  const res = await fetch(`${API_URL}/posts`);
  allPosts = await res.json();
  renderPosts(allPosts);
}

// Render given posts
function renderPosts(posts) {
  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const postDiv = document.createElement("div");
    postDiv.className = "post";

    const text = document.createElement("p");
    text.textContent = post.text;

    const meta = document.createElement("small");
    const isYours = post.username === username;
    meta.innerHTML = `🧑 ${post.username}${isYours ? " (you)" : ""}`;

    const reactionDiv = document.createElement("div");
    reactionDiv.className = "reactions";

    ["fire", "skull", "bulb"].forEach((type) => {
      const span = document.createElement("span");
      span.innerHTML = `${getEmoji(type)} ${post.reactions[type]}`;

      span.addEventListener("click", async () => {
        const votedKey = `voted_${post._id}_${type}`;
        if (localStorage.getItem(votedKey)) {
          alert("You already reacted with this emoji!");
          return;
        }

        await fetch(`${API_URL}/posts/${post._id}/react`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type }),
        });

        localStorage.setItem(votedKey, true);
        await loadPosts();
      });

      reactionDiv.appendChild(span);
    });

    postDiv.appendChild(meta);
    postDiv.appendChild(text);
    postDiv.appendChild(reactionDiv);
    postsContainer.appendChild(postDiv);
  });
}

// Emoji filter
function filterBy(type) {
  const sorted = [...allPosts].sort((a, b) => b.reactions[type] - a.reactions[type]);
  renderPosts(sorted);
}

function getEmoji(type) {
  return {
    fire: "🔥",
    skull: "💀",
    bulb: "💡",
  }[type];
}

// === Auto-expand limit on textarea ===
const maxBaseLength = 100;
const maxLimit = 500;
const step = 50;

messageInput.addEventListener("input", () => {
  const length = messageInput.value.length;
  const newLimit = Math.min(maxBaseLength + Math.floor(length / step) * step, maxLimit);

  if (length >= newLimit) {
    messageInput.value = messageInput.value.slice(0, newLimit);
  }

  messageInput.setAttribute("maxlength", newLimit);
});