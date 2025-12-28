// app.js
const STORE_KEY = "learningMapTopics";

export function loadTopics() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveTopics(list) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list));
}

export function uid() {
  return (crypto?.randomUUID?.() || String(Date.now()) + Math.random().toString(16).slice(2));
}

export function normalizeTopic(t) {
  const status = ["done", "now", "next"].includes(t.status) ? t.status : "next";

  const minutes = Number.isFinite(+t.minutes) ? Math.max(0, +t.minutes) : 0;
  let spent = Number.isFinite(+t.spent) ? Math.max(0, +t.spent) : 0;

  if (spent > minutes) spent = minutes;

  let progress = Number.isFinite(+t.progress) ? +t.progress : 0;
  progress = Math.max(0, Math.min(100, progress));

  if (status === "done") {
    progress = 100;
    spent = minutes;
  }

  return {
    id: t.id || uid(),
    title: (t.title || "").trim() || "Başlıksız",
    status,
    progress,
    minutes,   // toplam

    spent,     // harcanan
    short: (t.short || "").trim(),
    details: Array.isArray(t.details) ? t.details.filter(Boolean) : [],
    updatedAt: Date.now(),
  };
}


export function upsertTopic(topic) {
  const list = loadTopics();
  const idx = list.findIndex(x => x.id === topic.id);
  const normalized = normalizeTopic(topic);

  if (idx >= 0) list[idx] = normalized;
  else list.unshift(normalized);

  saveTopics(list);
  return normalized;
}

export function removeTopic(id) {
  const list = loadTopics().filter(x => x.id !== id);
  saveTopics(list);
}
