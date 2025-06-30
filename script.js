const API_URL = "https://a8b8-117-234-234-130.ngrok-free.app"; // change to your actual backend URL

const postForm = document.getElementById("postForm");
const messageInput = document.getElementById("message");
const postsContainer = document.getElementById("postsContainer");

const yourPostsList = document.getElementById("yourPostsList");
const yourPostsBar = document.getElementById("yourPostsBar");

let allPosts = [];
let yourPostIds = JSON.parse(localStorage.getItem("yourPostIds")) || [];

// ==== Toggle buttons ====

function toggleYourPosts() {
  yourPostsBar.style.display = yourPostsBar.style.display === "none" ? "block" : "none";
}

function toggleEmojiFilter() {
  const panel = document.getElementById("emojiFilter");
  panel.style.display = panel.style.display === "none" ? "flex" : "none";
}

// ==== Submit new post ====

postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  try {
    const res = await fetch(`${API_URL}/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const newPost = await res.json();
    yourPostIds.unshift(newPost._id);
    localStorage.setItem("yourPostIds", JSON.stringify(yourPostIds));

    messageInput.value = "";
    await loadPosts();
  } catch (err) {
    alert("Failed to post. Check your connection or backend.");
  }
});

// ==== Load all posts from backend ====

async function loadPosts() {
  try {
    const res = await fetch(`${API_URL}/post`);
    allPosts = await res.json();

    shuffleArray(allPosts); // For randomness
    renderPosts(allPosts);
    renderYourPosts();
  } catch (err) {
    alert("Couldn't fetch posts.");
  }
}

// ==== Display all posts ====

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

        try {
          await fetch(`${API_URL}/posts/${post._id}/react`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type }),
          });

          localStorage.setItem(votedKey, "true");
          await loadPosts();
        } catch {
          alert("Error reacting to post.");
        }
      });

      reactionDiv.appendChild(span);
    });

    postDiv.appendChild(text);
    postDiv.appendChild(reactionDiv);
    postsContainer.appendChild(postDiv);
  });
}

// ==== Display your posts ====

function renderYourPosts() {
  yourPostsList.innerHTML = "";

  const userPosts = allPosts.filter(post => yourPostIds.includes(post._id));
  userPosts.forEach(post => {
    const div = document.createElement("div");
    div.className = "your-post";
    div.textContent = post.text;

    const emojiCounts = Object.entries(post.reactions)
      .map(([type, count]) => `${getEmoji(type)} ${count}`)
      .join(" ");

    const meta = document.createElement("small");
    meta.textContent = emojiCounts;
    div.appendChild(meta);

    yourPostsList.appendChild(div);
  });
}

// ==== Filter top posts by emoji ====

function filterBy(type) {
  const sorted = [...allPosts].sort((a, b) => b.reactions[type] - a.reactions[type]);
  renderPosts(sorted);
}

// ==== Emoji utility ====

function getEmoji(type) {
  return {
    fire: "🔥",
    skull: "💀",
    bulb: "💡"
  }[type];
}

// ==== Random shuffle ====

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ==== Auto-limit textarea ====

messageInput.addEventListener("input", () => {
  const length = messageInput.value.length;
  const newLimit = Math.min(maxBaseLength + Math.floor(length / step) * step, maxLimit);

  if (length >= newLimit) {
    messageInput.value = messageInput.value.slice(0, newLimit);
  }

  messageInput.setAttribute("maxlength", newLimit);
});

// ==== Show/Hide post form ====

const formToggle = document.getElementById("formToggle");

formToggle.addEventListener("click", () => {
  const isVisible = postForm.style.display === "flex";
  postForm.style.display = isVisible ? "none" : "flex";
});

// ==== Load posts on start ====

window.onload = loadPosts;