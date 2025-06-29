const postForm = document.getElementById("postForm");
const messageInput = document.getElementById("message");
const postsContainer = document.getElementById("postsContainer");

let posts = [];

postForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (text === "") return;

  const newPost = {
    id: Date.now(),
    text,
    reactions: { fire: 0, skull: 0, bulb: 0 },
  };

  posts.unshift(newPost); // Add new post to the top
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
        post.reactions[type]++;
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
