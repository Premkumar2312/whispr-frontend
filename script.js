const API_URL = "https://original-tiena-presonal-projects-c5de53a2.koyeb.app";

const postForm = document.getElementById("postForm");
const messageInput = document.getElementById("message");
const postsContainer = document.getElementById("postsContainer");
const homePage = document.getElementById("homePage");
const profilePage = document.getElementById("profilePage");
const userProfilePosts = document.getElementById("userProfilePosts");
const yourPostsButton = document.getElementById("yourPostsButton");

let allPosts = [];
let yourPostIds = JSON.parse(localStorage.getItem("yourPostIds")) || [];

// Toggle Post Form
document.getElementById("formToggle").addEventListener("click", () => {
  postForm.style.display = postForm.style.display === "flex" ? "none" : "flex";
});

// Submit New Post
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
    alert("Failed to post.");
  }
});

// Load All Posts
async function loadPosts() {
  try {
    const res = await fetch(`${API_URL}/posts`);
    allPosts = await res.json();
    shuffleArray(allPosts);
    renderPosts(allPosts);
  } catch {
    alert("Could not fetch posts.");
  }
}

// Render Posts (Homepage)
function renderPosts(posts) {
  postsContainer.innerHTML = "";
  posts.forEach((post) => {
    const postDiv = document.createElement("div");
    postDiv.className = "post";
    postDiv.innerHTML = `
      <p>${post.text}</p>
      <div class="reactions">
        <span onclick="vote('${post._id}', 'up')">👍 ${post.upvotes || 0}</span>
        <span onclick="vote('${post._id}', 'down')">👎 ${post.downvotes || 0}</span>
      </div>`;
    postsContainer.appendChild(postDiv);
  });
}

// Voting
async function vote(postId, type) {
  const key = `voted_${postId}`;
  if (localStorage.getItem(key)) {
    alert("Already voted.");
    return;
  }

  try {
    await fetch(`${API_URL}/posts/${postId}/vote`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    localStorage.setItem(key, "true");
    await loadPosts();
  } catch {
    alert("Vote failed.");
  }
}

// Render Profile Page Posts
function renderProfilePosts() {
  userProfilePosts.innerHTML = "";
  const userPosts = allPosts.filter(post => yourPostIds.includes(post._id));
  if (userPosts.length === 0) {
    userProfilePosts.innerHTML = "<p>No posts yet.</p>";
    return;
  }

  userPosts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <p>${post.text}</p>
      <div class="reactions">
        <span>👍 ${post.upvotes || 0}</span>
        <span>👎 ${post.downvotes || 0}</span>
      </div>
    `;
    userProfilePosts.appendChild(div);
  });
}

// Profile Toggle with Animation
let isProfileOpen = false;
let isTransitioning = false;

yourPostsButton.addEventListener("click", () => {
  if (isTransitioning) return; // prevent spam clicks
  isTransitioning = true;

  if (isProfileOpen) {
    profilePage.classList.remove("fade-in", "fade-out");
    homePage.classList.remove("fade-in", "fade-out");

    profilePage.classList.add("fade-out");
    setTimeout(() => {
      profilePage.style.display = "none";
      profilePage.classList.remove("fade-out");

      homePage.style.display = "block";
      homePage.classList.add("fade-in");

      setTimeout(() => {
        homePage.classList.remove("fade-in");
        isTransitioning = false;
        isProfileOpen = false;
      }, 300);
    }, 300);
  } else {
    homePage.classList.remove("fade-in", "fade-out");
    profilePage.classList.remove("fade-in", "fade-out");

    homePage.classList.add("fade-out");
    setTimeout(() => {
      homePage.style.display = "none";
      homePage.classList.remove("fade-out");

      profilePage.style.display = "block";
      profilePage.classList.add("fade-in");
      renderProfilePosts();

      setTimeout(() => {
        profilePage.classList.remove("fade-in");
        isTransitioning = false;
        isProfileOpen = true;
      }, 300);
    }, 300);
  }
});

// Trending Tab
function showTrending() {
  const now = new Date();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const trending = allPosts
    .filter(p => new Date(p.createdAt) > oneDayAgo)
    .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  renderPosts(trending);
}

// Shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Theme Toggle
function toggleTheme() {
  const body = document.body;
  const isLight = body.classList.toggle("light");
  localStorage.setItem("theme", isLight ? "light" : "dark");
  document.getElementById("themeToggle").textContent = isLight ? "🌞" : "🌙";
}

// On Load
window.onload = () => {
  loadPosts();
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light");
    document.getElementById("themeToggle").textContent = "🌞";
  } else {
    document.getElementById("themeToggle").textContent = "🌙";
  }
};