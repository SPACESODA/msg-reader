const state = {
  data: null,
  messages: [],
  highlightedSenders: new Set(),
  eventsAttached: false,
  searchTimer: 0,
  filters: {
    query: "",
    sender: "",
    order: "oldest",
    highlightedOnly: false,
  },
};

const els = {
  summary: document.querySelector("#summary"),
  stats: document.querySelector("#stats"),
  timeline: document.querySelector("#timeline"),
  search: document.querySelector("#searchInput"),
  sender: document.querySelector("#senderSelect"),
  order: document.querySelector("#orderButton"),
  highlightedOnly: document.querySelector("#highlightedOnly"),
  highlightedLabel: document.querySelector("#highlightedLabel"),
  highlightedFilterContainer: document.querySelector("#highlightedFilterContainer"),
  template: document.querySelector("#messageTemplate"),
  toBottomBtn: document.getElementById("toBottomBtn"),
  toTopBtn: document.getElementById("toTopBtn"),
};

const timeFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZoneName: "short",
});

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function matches(message) {
  if (state.filters.highlightedOnly && !state.highlightedSenders.has(message._sender)) return false;
  if (state.filters.sender && message._sender !== state.filters.sender) return false;

  const query = state.filters.query;
  if (!query) return true;

  return (
    (message.text && message.text.toLowerCase().includes(query)) ||
    (message._sender && message._sender.toLowerCase().includes(query)) ||
    String(message.message_id).includes(query) ||
    (message.reply_to && String(message.reply_to).includes(query))
  );
}

function ordered(messages) {
  const direction = state.filters.order === "oldest" ? 1 : -1;
  return [...messages].sort((a, b) => (a._ts - b._ts) * direction);
}

function setText(node, value) {
  node.textContent = value == null ? "" : String(value);
}

function renderStats(filtered) {
  const uniqueSenders = new Set();
  const days = new Set();
  let highlightedCount = 0;

  for (let i = 0; i < filtered.length; i++) {
    const msg = filtered[i];
    uniqueSenders.add(msg._sender);
    days.add(msg._day);
    if (state.highlightedSenders.has(msg._sender)) {
      highlightedCount++;
    }
  }

  const cards = [
    ["Messages", filtered.length],
  ];

  if (state.highlightedSenders.size > 0) {
    cards.push(["Highlighted", highlightedCount]);
  }

  cards.push(
    ["Senders", uniqueSenders.size],
    ["Days", days.size]
  );

  els.stats.style.setProperty("--stat-columns", cards.length);
  els.stats.replaceChildren(
    ...cards.map(([label, value]) => {
      const card = document.createElement("div");
      card.className = "stat";
      const strong = document.createElement("strong");
      const span = document.createElement("span");
      setText(strong, value.toLocaleString());
      setText(span, label);
      card.append(strong, span);
      return card;
    }),
  );
}

function badge(text) {
  const item = document.createElement("span");
  item.className = "badge";
  setText(item, text);
  return item;
}

function renderMessage(message) {
  const node = els.template.content.firstElementChild.cloneNode(true);
  node.id = `msg-${message.message_id}`;
  node.classList.toggle("highlighted", state.highlightedSenders.has(message._sender));

  setText(node.querySelector(".sender"), message._sender);
  const timeNode = node.querySelector("time");
  setText(timeNode, message._time);
  timeNode.dateTime = message.timestamp_iso || "";
  setText(node.querySelector(".text"), message.text);

  const meta = node.querySelector(".meta");
  meta.append(badge(`#${message.message_id}`));
  if (message.reply_to) {
    const replyBtn = document.createElement("a");
    replyBtn.className = "badge";
    replyBtn.textContent = `Reply to #${message.reply_to}`;
    replyBtn.style.cursor = "pointer";
    replyBtn.style.textDecoration = "none";
    replyBtn.style.color = "#666666";
    replyBtn.style.backgroundColor = "var(--ink-soft)";
    replyBtn.onclick = (e) => {
      e.preventDefault();
      const target = document.getElementById(`msg-${message.reply_to}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.animate([
          { backgroundColor: "rgba(255, 215, 0, 0.3)" },
          { backgroundColor: "transparent" }
        ], { duration: 2000 });
      } else {
        alert("Message not found. It might be filtered out.");
      }
    };
    meta.append(replyBtn);
  }

  return node;
}

function renderTimeline() {
  const filtered = ordered(state.messages.filter(matches));
  renderStats(filtered);

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    setText(empty, "No messages match the current filters.");
    els.timeline.replaceChildren(empty);
    return;
  }

  const nodes = [];
  let currentDay = "";
  for (const message of filtered) {
    const nextDay = message._day;
    if (nextDay !== currentDay) {
      currentDay = nextDay;
      const day = document.createElement("div");
      day.className = "day";
      setText(day, currentDay);
      nodes.push(day);
    }
    nodes.push(renderMessage(message));
  }

  els.timeline.replaceChildren(...nodes);
}

function fillSelects() {
  els.sender.innerHTML = '<option value="">All senders</option>';
  const sendersSet = new Set();
  for (const message of state.messages) {
    sendersSet.add(message._sender);
  }

  const senders = [...sendersSet].sort((a, b) => {
    const aAlpha = /^[a-zA-Z]/.test(a);
    const bAlpha = /^[a-zA-Z]/.test(b);
    if (aAlpha && !bAlpha) return -1;
    if (!aAlpha && bAlpha) return 1;
    return a.localeCompare(b);
  });

  for (const sender of senders) {
    const option = document.createElement("option");
    option.value = sender;
    option.textContent = sender;
    els.sender.append(option);
  }
}

function attachEvents() {
  if (state.eventsAttached) return;
  state.eventsAttached = true;

  els.search.addEventListener("input", () => {
    window.clearTimeout(state.searchTimer);
    state.searchTimer = window.setTimeout(() => {
      state.filters.query = els.search.value.trim().toLowerCase();
      renderTimeline();
    }, 120);
  });

  els.sender.addEventListener("change", () => {
    state.filters.sender = els.sender.value;
    renderTimeline();
  });

  els.order.addEventListener("click", () => {
    if (state.filters.order === "oldest") {
      state.filters.order = "newest";
      els.order.innerHTML = "<span>Latest first</span>";
    } else {
      state.filters.order = "oldest";
      els.order.innerHTML = "<span>Oldest first</span>";
    }
    renderTimeline();
  });

  els.highlightedOnly.addEventListener("change", () => {
    state.filters.highlightedOnly = els.highlightedOnly.checked;
    renderTimeline();
  });

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!els.toBottomBtn || !els.toTopBtn) return;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
        if (scrollBottom <= 50) {
          els.toBottomBtn.style.opacity = "0";
          els.toBottomBtn.style.pointerEvents = "none";
          els.toTopBtn.style.opacity = "1";
          els.toTopBtn.style.pointerEvents = "auto";
        } else {
          els.toBottomBtn.style.opacity = "1";
          els.toBottomBtn.style.pointerEvents = "auto";
          els.toTopBtn.style.opacity = "0";
          els.toTopBtn.style.pointerEvents = "none";
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  els.toBottomBtn?.addEventListener("click", () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  });

  els.toTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function init(customData) {
  try {
    let activeData = customData || window.messagesData;
    if (!activeData && typeof messagesData !== "undefined") {
      activeData = messagesData;
    }

    if (!activeData) {
      throw new Error("messagesData is not defined. Ensure the data file is loaded correctly.");
    }
    state.data = activeData;

    state.messages = (state.data.messages || []).map(msg => {
      let ts = 0;
      let day = "Unknown date";
      let time = "";
      if (msg.timestamp_iso) {
        ts = Date.parse(msg.timestamp_iso);
        if (!Number.isNaN(ts)) {
          const d = new Date(ts);
          day = dayFormatter.format(d);
          time = timeFormatter.format(d);
        }
      }
      return {
        ...msg,
        _ts: ts,
        _day: day,
        _time: time,
        _sender: msg.sender || "Unknown"
      };
    });

    const title = state.data.title || "Messages";
    document.querySelector("h1").textContent = title;
    document.title = `${title} - Messages Reader`;

    state.filters.sender = "";
    state.filters.order = "oldest";
    state.filters.highlightedOnly = false;
    els.search.value = "";
    state.filters.query = "";
    els.sender.value = "";
    els.order.innerHTML = "<span>Oldest first</span>";

    state.highlightedSenders = new Set(
      state.data.highlighted_senders
        ? state.data.highlighted_senders.split(",").map(s => s.trim())
        : []
    );

    els.highlightedFilterContainer.style.display = state.highlightedSenders.size > 0 ? "flex" : "none";
    els.highlightedOnly.checked = false;

    if (state.messages.length === 0) {
      els.summary.textContent = "0 messages";
    } else {
      const first = state.messages[0];
      const last = state.messages[state.messages.length - 1];
      els.summary.textContent = `${state.messages.length.toLocaleString()} messages, from ${first._day} to ${last._day}`;
    }

    fillSelects();
    attachEvents();
    renderTimeline();
  } catch (error) {
    els.summary.textContent = "Could not load messages data";
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = `Error: ${error.message} Please ensure the data file exists and contains the correct data.`;
    els.timeline.replaceChildren(empty);
  }
}

const params = new URLSearchParams(window.location.search);
let sourceUrl = params.get("source");

if (sourceUrl) {
  localStorage.setItem("msgLastSource", sourceUrl);
} else {
  sourceUrl = localStorage.getItem("msgLastSource") || "data/messages.js";
}

const editSourceBtn = document.getElementById("editSourceBtn");
const sourceForm = document.getElementById("sourceForm");
const sourceInput = document.getElementById("sourceInput");

editSourceBtn.addEventListener("click", () => {
  editSourceBtn.style.display = "none";
  sourceForm.style.display = "flex";
  sourceInput.value = sourceUrl;
  sourceInput.focus();
});

sourceForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newUrl = sourceInput.value.trim();
  if (newUrl) {
    localStorage.setItem("msgLastSource", newUrl);
    window.location.href = `?source=${encodeURIComponent(newUrl)}`;
  }
});

function showError(msg) {
  els.summary.textContent = "Could not load messages data";
  const empty = document.createElement("div");
  empty.className = "empty";
  empty.textContent = msg;
  els.timeline.replaceChildren(empty);
}

function normalizeSourceUrl(url) {
  const trimmed = url.trim();
  const parsed = new URL(trimmed, window.location.href);
  const path = trimmed.split("?")[0].toLowerCase();
  const allowedProtocols = new Set(["http:", "https:", "file:"]);
  if (!allowedProtocols.has(parsed.protocol)) {
    throw new Error("Unsupported source protocol. Please use a relative file path, http(s) URL, or local file URL.");
  }
  if (!path.endsWith(".json") && !path.endsWith(".js")) {
    throw new Error("Unsupported source type. Please use a .json file or a trusted .js file.");
  }
  return trimmed;
}

function parseMessagesJs(code) {
  const assignment = code.match(/\b(?:const|let|var)?\s*messagesData\s*=\s*/);
  if (!assignment) {
    throw new Error("Could not find a messagesData assignment.");
  }

  const start = code.indexOf("{", assignment.index + assignment[0].length);
  const end = code.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Could not find the messagesData object.");
  }

  return JSON.parse(code.slice(start, end + 1));
}

const timestamp = new Date().getTime();
try {
  sourceUrl = normalizeSourceUrl(sourceUrl);
  const noCacheUrl = sourceUrl.includes('?')
    ? `${sourceUrl}&_t=${timestamp}`
    : `${sourceUrl}?_t=${timestamp}`;

  if (sourceUrl.split('?')[0].toLowerCase().endsWith(".json")) {
    fetch(noCacheUrl)
      .then(res => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then(data => {
        init(data);
      })
      .catch(err => {
        showError(`Error: Failed to load JSON from ${sourceUrl}. ${err.message}`);
      });
  } else {
    const script = document.createElement("script");
    script.src = noCacheUrl;
    script.onload = () => init();
    script.onerror = () => {
      showError(`Error: Failed to load JS from ${sourceUrl}. Please ensure the trusted file exists and is accessible.`);
    };
    document.head.appendChild(script);
  }
} catch (err) {
  showError(`Error: ${err.message}`);
}

// Drag and Drop functionality
const dropOverlay = document.getElementById("dropOverlay");
let dragCounter = 0;

window.addEventListener("dragenter", (e) => {
  e.preventDefault();
  dragCounter++;
  dropOverlay.style.display = "flex";
});

window.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dragCounter--;
  if (dragCounter === 0) {
    dropOverlay.style.display = "none";
  }
});

window.addEventListener("dragover", (e) => {
  e.preventDefault();
});

window.addEventListener("drop", (e) => {
  e.preventDefault();
  dragCounter = 0;
  dropOverlay.style.display = "none";

  if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

  const file = e.dataTransfer.files[0];
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".json")) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        init(JSON.parse(event.target.result));
        sourceInput.value = fileName;
        els.summary.textContent = `Loaded ${fileName} via drag-and-drop`;
      } catch (err) {
        showError(`Error: Failed to parse dropped JSON file. ${err.message}`);
      }
    };
    reader.onerror = () => showError("Error reading dropped file.");
    reader.readAsText(file);
  } else if (fileName.endsWith(".js")) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = parseMessagesJs(event.target.result);
        init(data);
        sourceInput.value = fileName;
        els.summary.textContent = `Loaded ${fileName} via drag-and-drop`;
      } catch (err) {
        showError(`Error: Failed to process dropped JS file. The file must assign strict JSON data to messagesData. ${err.message}`);
      }
    };
    reader.onerror = () => showError("Error reading dropped file.");
    reader.readAsText(file);
  } else {
    showError(`Error: Unsupported file type. Please drop a .js or .json file.`);
  }
});
