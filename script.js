const API_URL = "https://a8b8-117-234-234-130.ngrok-free.app"; // use current ngrok HTTPS

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
    const res = await fetch(`${API_URL}/posts`, {
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
    console.error("Post error:", err); // Add debug logging
    alert("Failed to post. Check your connection or backend.");
  }
});

// ==== Load all posts from backend ====

async function loadPosts() {
  try {
    const res = await fetch(`${API_URL}/posts`);
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error response:", errorText);
      alert("Failed to fetch posts. Backend issue.");
      return;
    }

    allPosts = await res.json();
    shuffleArray(allPosts);
    renderPosts(allPosts);
    renderYourPosts();
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Couldn't fetch posts. Check backend or network.");
  }
}