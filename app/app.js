// Leonida Trophy Atlas — offline tracker for the 55 GTA VI trophies.
// Loads data/trophies.json (a file under app/), saves progress in localStorage,
// exports/imports progress as a file. Makes no network request at run time.

const KEY = 'leonida-trophy-atlas-v1';
const SPOILER_KEY = 'leonida-trophy-atlas-spoiler-v1';

const listEl = document.getElementById('trophyList');
const metaEl = document.getElementById('listMeta');
const emptyEl = document.getElementById('emptyState');
const progressText = document.getElementById('progressText');
const progressPct = document.getElementById('progressPct');
const progressFill = document.getElementById('progressFill');
const gradeCountsEl = document.getElementById('gradeCounts');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const earnedOnlyEl = document.getElementById('earnedOnly');

const params = new URLSearchParams(location.search);
if (params.get('kind')) kindEl.value = params.get('kind');
if (params.get('grade')) gradeEl.value = params.get('grade');
if (params.get('q')) searchEl.value = params.get('q');
if (params.get('spoiler') === 'on') spoilerEl.checked = true;

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
let spoiler = spoilerEl.checked || localStorage.getItem(SPOILER_KEY) === '1';
spoilerEl.checked = spoiler;

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
}

function gradeLabel(g) {
  return g === 'platinum' ? 'Platinum' : g === 'gold' ? 'Gold' : g === 'silver' ? 'Silver' : 'Bronze';
}

function kindLabel(k) {
  return { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', platinum: 'Platinum' }[k] ?? k;
}

function isHiddenFromSpoiler(t) {
  return spoiler && t.hidden && !earned.has(t.name);
}

function matches(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide} ${t.kinds.join(' ')}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (kindEl.value !== 'all') {
    if (kindEl.value === 'online') return false; // no online trophies in this list
    if (!t.kinds.includes(kindEl.value)) return false;
  }
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (earnedOnlyEl.checked && !earned.has(t.name)) return false;
  return true;
}

function renderRoadmap() {
  const grid = document.getElementById('roadmapGrid');
  grid.replaceChildren();
  for (const stage of doc.roadmap ?? []) {
    const count = trophies.filter((t) => t.stage === stage.stage).length;
    const card = document.createElement('div');
    card.className = 'roadmap-card';
    const h = document.createElement('h3');
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = stage.stage;
    h.append(num, document.createTextNode(stage.title));
    const p = document.createElement('p');
    p.textContent = stage.text;
    const c = document.createElement('span');
    c.className = 'stage-count';
    c.textContent = `${count} trophies in this stage`;
    card.append(h, p, c);
    grid.append(card);
  }
}

function renderSources() {
  const ul = document.getElementById('sourceList');
  ul.replaceChildren();
  for (const s of doc.sources ?? []) {
    const li = document.createElement('li');
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a);
    } else {
      li.textContent = s.name;
    }
    ul.append(li);
  }
}

function renderProgress() {
  const total = trophies.length;
  const n = earned.size;
  progressText.textContent = `${n} of ${total} earned`;
  progressPct.textContent = `${Math.round((n / total) * 100)}%`;
  progressFill.style.width = `${(n / total) * 100}%`;
  const byGrade = {};
  for (const t of trophies) byGrade[t.grade] = (byGrade[t.grade] ?? 0) + (earned.has(t.name) ? 1 : 0);
  const totals = {};
  for (const t of trophies) totals[t.grade] = (totals[t.grade] ?? 0) + 1;
  gradeCountsEl.innerHTML = '';
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    const b = document.createElement('b');
    b.textContent = `${gradeLabel(g)} ${byGrade[g] ?? 0}/${totals[g] ?? 0}`;
    gradeCountsEl.append(b, document.createTextNode('  ·  '));
  }
  gradeCountsEl.lastChild?.remove();
}

function trophyCard(t) {
  const card = document.createElement('article');
  card.className = 'trophy' + (earned.has(t.name) ? ' earned' : '');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name);
    else earned.delete(t.name);
    save();
    render();
  });
  const body = document.createElement('div');

  if (isHiddenFromSpoiler(t)) {
    const head = document.createElement('div');
    head.className = 'trophy-head';
    const name = document.createElement('h3');
    name.className = 'trophy-name';
    name.textContent = 'Hidden trophy';
    const badge = document.createElement('span');
    badge.className = `grade-badge grade-${t.grade}`;
    badge.textContent = gradeLabel(t.grade);
    const tag = document.createElement('span');
    tag.className = 'tag hidden-tag';
    tag.textContent = 'Hidden — spoiler';
    head.append(name, badge, tag);
    const p = document.createElement('p');
    p.className = 'spoiler-hidden';
    p.textContent = 'This trophy is hidden on PlayStation until earned. Turn off “Hide story spoilers” above, or earn it, to reveal its name and guide.';
    body.append(head, p);
  } else {
    const head = document.createElement('div');
    head.className = 'trophy-head';
    const name = document.createElement('h3');
    name.className = 'trophy-name' + (earned.has(t.name) ? ' earned' : '');
    name.textContent = t.name;
    const badge = document.createElement('span');
    badge.className = `grade-badge grade-${t.grade}`;
    badge.textContent = gradeLabel(t.grade);
    head.append(name, badge);
    for (const k of t.kinds) {
      const tag = document.createElement('span');
      tag.className = 'tag' + (k === 'missable' ? ' missable' : '');
      tag.textContent = kindLabel(k);
      head.append(tag);
    }
    if (t.hidden) {
      const tag = document.createElement('span');
      tag.className = 'tag hidden-tag';
      tag.textContent = 'Hidden on PSN';
      head.append(tag);
    }
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = t.description;
    body.append(head, desc);
    if (t.count != null) {
      const c = document.createElement('p');
      c.className = 'trophy-count';
      c.textContent = `Target: ${t.count.toLocaleString('en-US')} ${t.count_label}`;
      body.append(c);
    }
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'guide-toggle';
    toggle.textContent = 'Show guide + sources';
    const guide = document.createElement('div');
    guide.className = 'guide';
    guide.hidden = true;
    const gp = document.createElement('p');
    gp.textContent = t.guide;
    const sp = document.createElement('p');
    sp.className = 'sources';
    sp.textContent = 'Sources: ';
    t.sources.forEach((s, i) => {
      if (i > 0) sp.append(document.createTextNode(' · '));
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      a.target = '_blank';
      a.rel = 'noopener';
      sp.append(a);
    });
    guide.append(gp, sp);
    toggle.addEventListener('click', () => {
      guide.hidden = !guide.hidden;
      toggle.textContent = guide.hidden ? 'Show guide + sources' : 'Hide guide';
    });
    body.append(toggle, guide);
  }
  card.append(box, body);
  return card;
}

function render() {
  const shown = trophies.filter(matches);
  listEl.replaceChildren();
  for (const t of shown) listEl.append(trophyCard(t));
  emptyEl.hidden = shown.length > 0;
  metaEl.textContent = kindEl.value === 'online'
    ? 'Online: this list has no online trophies — all 55 are offline, single-player.'
    : `Showing ${shown.length} of ${trophies.length} trophies` +
      (spoiler ? ' · spoiler mode on: hidden story trophies stay masked until earned' : '');
  renderProgress();
}

document.getElementById('exportBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: doc.game, earned: [...earned] }, null, 2)], { type: 'application/json' }));
  a.download = 'leonida-trophy-progress.json';
  a.click();
});
document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const list = Array.isArray(data) ? data : data.earned;
    const names = new Set(trophies.map((t) => t.name));
    earned = new Set((list ?? []).filter((n) => names.has(n)));
    save();
    render();
  } catch {
    alert('That file could not be read as trophy progress.');
  }
  e.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies?')) return;
  earned = new Set();
  save();
  render();
});
spoilerEl.addEventListener('change', () => {
  spoiler = spoilerEl.checked;
  save();
  render();
});
for (const el of [searchEl, kindEl, gradeEl, earnedOnlyEl]) el.addEventListener('input', render);
for (const el of [kindEl, gradeEl, earnedOnlyEl]) el.addEventListener('change', render);

renderRoadmap();
renderSources();
render();
