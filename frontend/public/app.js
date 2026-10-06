const board = document.getElementById("board");
const dialog = document.getElementById("task-dialog");
const form = document.getElementById("task-form");
const dialogTitle = document.getElementById("dialog-title");
const fieldTitle = document.getElementById("field-title");
const fieldContent = document.getElementById("field-content");
const toast = document.getElementById("toast");
const envBadge = document.getElementById("env-badge");

let tasks = [];
let editingId = null;
let dragState = null;

const COLORS = ["yellow", "pink", "mint", "blue", "peach"];

function normalizeEnv(value) {
  const env = String(value || "local").toLowerCase();
  if (env === "production") return "prod";
  if (env === "development") return "dev";
  return env;
}

async function loadEnvBadge() {
  try {
    const res = await fetch("/config");
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    const env = normalizeEnv(data.env);
    const label = env === "prod" ? "PROD" : env === "dev" ? "DEV" : env.toUpperCase();
    envBadge.textContent = label;
    envBadge.className = `env-badge env-${env === "prod" || env === "dev" ? env : "local"}`;
    envBadge.hidden = false;
    envBadge.title = `Environment: ${label}`;
  } catch (_) {
    envBadge.hidden = true;
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.error || detail;
    } catch (_) {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

function randomPosition() {
  const maxX = Math.max(40, board.clientWidth - 240);
  const maxY = Math.max(40, board.clientHeight - 240);
  return {
    posX: 40 + Math.floor(Math.random() * Math.max(1, maxX - 40)),
    posY: 40 + Math.floor(Math.random() * Math.max(1, maxY - 40)),
  };
}

function selectedColor() {
  const checked = form.querySelector('input[name="color"]:checked');
  return checked ? checked.value : "yellow";
}

function setSelectedColor(color) {
  const value = COLORS.includes(color) ? color : "yellow";
  const input = form.querySelector(`input[name="color"][value="${value}"]`);
  if (input) input.checked = true;
}

function openCreateDialog() {
  editingId = null;
  dialogTitle.textContent = "New sticky note";
  form.reset();
  setSelectedColor("yellow");
  dialog.showModal();
  fieldTitle.focus();
}

function openEditDialog(task) {
  editingId = task.id;
  dialogTitle.textContent = "Edit sticky note";
  fieldTitle.value = task.title || "";
  fieldContent.value = task.content || "";
  setSelectedColor(task.color);
  dialog.showModal();
  fieldTitle.focus();
}

function render() {
  board.innerHTML = "";

  if (!tasks.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No sticky notes yet — click “+ New sticky note”";
    board.appendChild(empty);
    return;
  }

  for (const task of tasks) {
    board.appendChild(createNote(task));
  }
}

function createNote(task) {
  const el = document.createElement("article");
  el.className = `postit ${task.color || "yellow"}${task.done ? " done" : ""}`;
  el.style.left = `${task.posX}px`;
  el.style.top = `${task.posY}px`;
  el.dataset.id = String(task.id);
  el.tabIndex = 0;

  el.innerHTML = `
    <span class="pin" aria-hidden="true"></span>
    <div class="actions">
      <button type="button" data-action="toggle" title="${task.done ? "Reopen" : "Complete"}">${task.done ? "↩" : "✓"}</button>
      <button type="button" data-action="edit" title="Edit">✎</button>
      <button type="button" data-action="delete" title="Delete">✕</button>
    </div>
    <h3 class="title"></h3>
    <p class="content"></p>
  `;

  el.querySelector(".title").textContent = task.title;
  el.querySelector(".content").textContent = task.content || "";

  el.addEventListener("pointerdown", onPointerDown);
  el.querySelector(".actions").addEventListener("click", async (event) => {
    const btn = event.target.closest("button[data-action]");
    if (!btn) return;
    event.stopPropagation();
    const action = btn.dataset.action;
    try {
      if (action === "edit") openEditDialog(task);
      if (action === "delete") {
        await api(`/api/tasks/${task.id}`, { method: "DELETE" });
        tasks = tasks.filter((t) => t.id !== task.id);
        render();
        showToast("Sticky note removed");
      }
      if (action === "toggle") {
        const updated = await api(`/api/tasks/${task.id}`, {
          method: "PUT",
          body: JSON.stringify({ done: !task.done }),
        });
        tasks = tasks.map((t) => (t.id === updated.id ? updated : t));
        render();
      }
    } catch (err) {
      showToast(err.message);
    }
  });

  return el;
}

function onPointerDown(event) {
  if (event.target.closest(".actions")) return;
  if (event.button !== undefined && event.button !== 0) return;

  const note = event.currentTarget;
  const id = Number(note.dataset.id);
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  note.setPointerCapture(event.pointerId);
  note.classList.add("dragging");

  dragState = {
    id,
    note,
    offsetX: event.clientX - note.offsetLeft,
    offsetY: event.clientY - note.offsetTop,
    moved: false,
  };

  note.addEventListener("pointermove", onPointerMove);
  note.addEventListener("pointerup", onPointerUp);
  note.addEventListener("pointercancel", onPointerUp);
}

function onPointerMove(event) {
  if (!dragState) return;
  const { note, offsetX, offsetY } = dragState;
  const boardRect = board.getBoundingClientRect();
  const maxX = board.clientWidth - note.offsetWidth;
  const maxY = board.clientHeight - note.offsetHeight;

  let x = event.clientX - boardRect.left - offsetX;
  let y = event.clientY - boardRect.top - offsetY;
  x = Math.max(0, Math.min(maxX, x));
  y = Math.max(0, Math.min(maxY, y));

  note.style.left = `${x}px`;
  note.style.top = `${y}px`;
  dragState.moved = true;
  dragState.posX = Math.round(x);
  dragState.posY = Math.round(y);
}

async function onPointerUp(event) {
  if (!dragState) return;
  const { id, note, moved, posX, posY } = dragState;
  note.releasePointerCapture?.(event.pointerId);
  note.classList.remove("dragging");
  note.removeEventListener("pointermove", onPointerMove);
  note.removeEventListener("pointerup", onPointerUp);
  note.removeEventListener("pointercancel", onPointerUp);

  const state = dragState;
  dragState = null;

  if (!moved) return;

  try {
    const updated = await api(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify({ posX, posY }),
    });
    tasks = tasks.map((t) => (t.id === updated.id ? updated : t));
  } catch (err) {
    showToast(err.message);
    await loadTasks();
  }
}

async function loadTasks() {
  try {
    tasks = await api("/api/tasks");
    render();
  } catch (err) {
    showToast(`Failed to load: ${err.message}`);
  }
}

document.getElementById("btn-new").addEventListener("click", openCreateDialog);
document.getElementById("btn-cancel").addEventListener("click", () => dialog.close());

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    title: fieldTitle.value.trim(),
    content: fieldContent.value.trim(),
    color: selectedColor(),
  };

  try {
    if (editingId == null) {
      const created = await api("/api/tasks", {
        method: "POST",
        body: JSON.stringify({ ...payload, ...randomPosition() }),
      });
      tasks.push(created);
      showToast("Sticky note created");
    } else {
      const updated = await api(`/api/tasks/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      tasks = tasks.map((t) => (t.id === updated.id ? updated : t));
      showToast("Sticky note updated");
    }
    dialog.close();
    render();
  } catch (err) {
    showToast(err.message);
  }
});

loadEnvBadge();
loadTasks();
