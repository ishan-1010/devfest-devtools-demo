// Campus Event Finder (fixed)
const list = document.getElementById('events');
const statusEl = document.getElementById('status');
const search = document.getElementById('search');
let events = [];
let haystack = [];            // lower-cased text, built once instead of on every key press
const MAX_SHOWN = 50;

function card(e) {
  return `<li class="card"><h3>${e.title}</h3>
    <div class="meta">${e.place} · ${e.day} Dec · ${e.seatsLeft} seats left</div>
    <div class="row"><span>${e.tags.map(t => `<span class="tag">${t}</span>`).join('')}</span>
    <button>Book seat</button></div></li>`;
}

function render(items, total = items.length) {
  list.innerHTML = items.slice(0, MAX_SHOWN).map(card).join('');
  statusEl.textContent = `${total} events` + (total > MAX_SHOWN ? ` (showing ${MAX_SHOWN})` : '');
}

function filter(q) {
  const hits = [];
  for (let i = 0; i < events.length; i++) if (haystack[i].includes(q)) hits.push(events[i]);
  return hits;
}

let timer;
search.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const q = search.value.trim().toLowerCase();
    if (!q) return render(events);
    const hits = filter(q);
    render(hits, hits.length);
  }, 150);
});

async function load() {
  try {
    const res = await fetch('../api/events.json');
    if (!res.ok) throw new Error(`Server said ${res.status}`);
    events = await res.json();
    haystack = events.map(e => (e.title + ' ' + e.place + ' ' + e.tags.join(' ')).toLowerCase());
    render(events);
  } catch (err) {
    statusEl.textContent = `Could not load events (${err.message})`;
  }
}
load();
