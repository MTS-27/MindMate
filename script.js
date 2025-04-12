document.getElementById("analyze-btn").addEventListener("click", async () => {
  const input = document.getElementById("thought-input").value.trim();
  const responseSection = document.getElementById("ai-response");

  if (input.length === 0) {
    alert("Please enter a thought first.");
    return;
  }

  const apiKey = "TfecjHF3SwY4XuIFrwtjnc1PheygeqQf5gn01KjT";

  const prompt = `
You are a calming productivity assistant. Analyze the user's thought and return:
- A brief summary
- A mood with a real emoji (e.g., 😊 Calm)
- 3 helpful tasks

Use this format:
{
  "summary": "short summary",
  "mood": "😊 Mood word",
  "tasks": ["task 1", "task 2", "task 3"]
}

User thought: "${input}"
`;

  document.getElementById("ai-summary").innerHTML = `🧠 Thinking<span class="loader"></span>`;
  document.getElementById("ai-mood").textContent = "";
  document.getElementById("ai-tasks").innerHTML = "";
  const button = document.getElementById("analyze-btn");
  button.disabled = true;
  button.textContent = "Thinking...";

  try {
    const res = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Cohere-Version": "2022-12-06"
      },
      body: JSON.stringify({
        model: "command",
        prompt,
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const data = await res.json();
    const text = data.generations[0].text.trim();

    let parsed;
    try {
      const match = text.match(/{[\s\S]*}/);
      parsed = JSON.parse(match[0]);
    } catch (e) {
      console.error("Could not parse JSON:", text);
      responseSection.innerHTML = `<p>Sorry, I couldn't interpret the response.</p>`;
      return;
    }

    document.getElementById("ai-summary").innerHTML = `<strong>Summary:</strong> ${parsed.summary}`;
    document.getElementById("ai-mood").innerHTML = `<strong>Mood:</strong> ${parsed.mood}`;
    document.getElementById("ai-tasks").innerHTML = `
      <h3>Suggested Tasks:</h3>
      <ul>
        ${parsed.tasks.map(task => `<li><button class="suggested-task">${task}</button></li>`).join("")}
      </ul>
    `;

    document.querySelectorAll(".suggested-task").forEach(btn => {
      btn.addEventListener("click", () => {
        addTaskToList(btn.textContent);
        btn.disabled = true;
        btn.textContent += " ✅";
      });
    });

    responseSection.classList.remove("hidden");

  } catch (err) {
    console.error("Cohere API error:", err);
    responseSection.innerHTML = `<p>Something went wrong while contacting the AI.</p>`;
  }

  button.disabled = false;
  button.textContent = "Reflect with AI";
});

// Your Task List Logic
const taskList = document.getElementById("task-list");
let tasks = JSON.parse(localStorage.getItem("userTasks")) || [];

function addTaskToList(text) {
  tasks.push({ text, done: false });
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="task-text ${task.done ? "done" : ""}">${task.text}</span>
      <button class="complete-btn" data-index="${index}">✅</button>
      <button class="delete-btn" data-index="${index}">❌</button>
    `;

    li.querySelector(".complete-btn").addEventListener("click", () => {
      tasks[index].done = !tasks[index].done;
      renderTasks();
    });

    li.querySelector(".delete-btn").addEventListener("click", () => {
      tasks.splice(index, 1);
      renderTasks();
    });

    taskList.appendChild(li);
  });

  localStorage.setItem("userTasks", JSON.stringify(tasks));
}

renderTasks();
