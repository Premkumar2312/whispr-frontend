const API_URL = "https://your-backend-url.com"; // Replace with your backend

const postForm = document.getElementById("postForm");
const messageInput = document.getElementById("message");
const postsContainer = document.getElementById("postsContainer");
const formToggle = document.getElementById("formToggle");
const yourPostsList = document.getElementById("yourPostsList");

let allPosts = [];
let yourPostIds = JSON.parse(localStorage.getItem("yourPostIds")) || [];

formToggle.addEventListener("click", () => {
  postForm.style.display = postForm.style.display === "none" ? "flex" : "none";
});

postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();
  yourPostIds.unshift(data._id);
  localStorage.setItem("yourPostIds", JSON.stringify(yourPostIds));

  messageInput.value = "";
  await loadPosts();
});

async function loadPosts() {
  const res = await fetch(`${API_URL}/posts`);
  allPosts = await res.json();
  renderPosts(allPosts);
  renderYourPosts();
}

function renderPosts(posts) {
  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const postDiv = document.createElement("div");
    postDiv.className = "post";

    const text = document.createElement("p");
    text.textContent = post.text;

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

    postDiv.appendChild(text);
    postDiv.appendChild(reactionDiv);
    postsContainer.appendChild(postDiv);
  });
}

function renderYourPosts() {
  yourPostsList.innerHTML = "";

  const yourPosts = allPosts.filter(post => yourPostIds.includes(post._id));
  yourPosts.forEach((post) => {
    const div = document.createElement("div");
    div.className = "your-post";
    div.textContent = post.text;

    const emojiCounts = Object.entries(post.reactions)
      .map(([key, value]) => `${getEmoji(key)} ${value}`)
      .join("  ");

    const meta = document.createElement("small");
    meta.textContent = emojiCounts;
    div.appendChild(meta);

    yourPostsList.appendChild(div);
  });
}

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

// Auto-expand textarea logic
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

window.onload = loadPosts;