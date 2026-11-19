// Campus Event Finder (the version a student ships at 2 a.m.)
const list = document.getElementById('events');
const statusEl = document.getElementById('status');
const search = document.getElementById('search');
let events = [];

function card(e) {
  return `<li class="card"><h3>${e.title}</h3>
    <div class="meta">${e.place} · ${e.day} Dec · ${e.seatsLeft} seats left</div>
    <div class="row"><span>${e.tags.map(t => `<span class="tag">${t}</span>`).join('')}</span>
    <button>Book seat</button></div></li>`;
}

function render(items) {
  list.innerHTML = items.map(card).join('');
  statusEl.textContent = `${items.length} events`;
}

// "Smart" search: scores every event against the query
function score(e, q) {
  const text = (e.title + ' ' + e.place + ' ' + e.tags.join(' ')).toLowerCase();
  let s = 0;
  for (let i = 0; i < text.length; i++) {
    for (let j = 0; j < q.length; j++) {
      if (text[i] === q[j]) s += 1 / (1 + Math.abs(i - j));
    }
  }
  // typo tolerance: compare the query with every word (copied from a StackOverflow answer)
  for (const w of text.split(' ')) s += 1 / (1 + editDistance(w, q));
  return text.includes(q) ? s : 0;
}

function editDistance(a, b) {
  const d = [];
  for (let i = 0; i <= a.length; i++) { d[i] = [i]; }
  for (let j = 1; j <= b.length; j++) { d[0][j] = j; }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

search.addEventListener('input', () => {
  const q = search.value.trim().toLowerCase();
  if (!q) return render(events);
  const ranked = events.map(e => ({ e, s: score(e, q) })).sort((a, b) => b.s - a.s);
  render(ranked.filter(r => r.s > 0).map(r => r.e));
});

async function load() {
  const res = await fetch('api/events.json');
  events = await res.json();
  render(events);
}
load();
