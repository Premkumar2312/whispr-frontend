const postForm = document.getElementById("postForm");
const messageInput = document.getElementById("message");
const postsContainer = document.getElementById("postsContainer");
const formToggle = document.getElementById("formToggle");

let posts = [];

formToggle.addEventListener("click", () => {
  postForm.style.display = postForm.style.display === "none" ? "flex" : "none";
});

postForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (text === "") return;

  const newPost = {
    id: Date.now(),
    text,
    reactions: { fire: 0, skull: 0, bulb: 0 },
  };

  posts.unshift(newPost);
  messageInput.value = "";
  renderPosts();
});

function renderPosts() {
  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const postDiv = document.createElement("div");
    postDiv.className = "post";

    const text = document.createElement("p");
    text.textContent = post.text;
    postDiv.appendChild(text);

    const reactionDiv = document.createElement("div");
    reactionDiv.className = "reactions";

    ["fire", "skull", "bulb"].forEach((type) => {
      const span = document.createElement("span");
      span.innerHTML = getEmoji(type) + " " + post.reactions[type];

      span.addEventListener("click", () => {
        const votedKey = `voted_${post.id}_${type}`;
        if (localStorage.getItem(votedKey)) {
          alert("You already reacted with this emoji!");
          return;
        }
        post.reactions[type]++;
        localStorage.setItem(votedKey, true);
        renderPosts();
      });

      reactionDiv.appendChild(span);
    });

    postDiv.appendChild(reactionDiv);
    postsContainer.appendChild(postDiv);
  });
}

function getEmoji(type) {
  return {
    fire: "🔥",
    skull: "💀",
    bulb: "💡",
  }[type];
}

// === Auto-expand max length of textarea ===
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