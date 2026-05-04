// ===================== CONFIG =====================
// სტანდარტული ფოტო — თუ მასწავლებელს არ აქვს
const DEFAULT_PHOTO = '';

const SHEET_ID = '1weL4w0BzXGrYPIczj0kKYFdvE615OIMKSzIpt9Q1Yu0';
const SHEET_NAME = 'teachers';

const CATEGORIES = [
  'ყველა კატეგორია','🎵 მუსიკა','💃 ცეკვა','💅 სილამაზე',
  '🎓 სასკოლო საგნები','💻 ტექნოლოგია','🎨 შემოქმედება',
  '🌍 ენები','🔧 ხელსაქმე','🏋️ სპორტი','🍳 კულინარია',
  '🎭 თეატრი','📦 სხვა'
];

const REGIONS = [
  'ყველა რეგიონი','📍 თბილისი','📍 კახეთი','📍 შიდა ქართლი',
  '📍 ქვემო ქართლი','📍 მცხეთა-მთიანეთი','📍 სამცხე-ჯავახეთი',
  '📍 იმერეთი','📍 რაჭა-ლეჩხუმი','📍 გურია',
  '📍 სამეგრელო-ზემო სვანეთი','📍 აჭარა','🌐 ონლაინ'
];

const BG_COLORS = ['bg-teal','bg-amber','bg-pink','bg-blue','bg-purple','bg-green'];
const AV_COLORS = ['av-teal','av-amber','av-pink','av-blue','av-purple','av-green'];

let allTeachers = [];
let selectedCat = '';
let selectedReg = '';
let selectedFmt = '';

// ===================== FETCH DATA =====================
async function fetchTeachers() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;
    const teachers = rows.map(row => ({
      id:       row.c[0]?.v || '',
      name:     row.c[1]?.v || '',
      category: row.c[2]?.v || '',
      subcat:   row.c[3]?.v || '',
      region:   row.c[4]?.v || '',
      price:    row.c[5]?.v || '',
      phone:    row.c[6]?.v || '',
      instagram:row.c[7]?.v || '',
      facebook: row.c[8]?.v || '',
      desc:     row.c[9]?.v || '',
      online:   row.c[10]?.v || '',
      photo:    row.c[11]?.v || '',
    })).filter(t => t.name);
    return teachers;
  } catch(e) {
    console.error('Sheets fetch error:', e);
    return [];
  }
}

// ===================== UTILS =====================
function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function colorIndex(name) {
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return Math.abs(h) % BG_COLORS.length;
}

function stripEmoji(str) {
  return str.replace(/^[^\wა-ჰ]+/, '').trim();
}

// ===================== RENDER TEACHER CARD =====================
function renderCard(t, index) {
  const ci = colorIndex(t.name);
  const bg = BG_COLORS[ci];
  const av = AV_COLORS[ci];
  const initials = getInitials(t.name);
  const stars = '★★★★★';
  const onlineBadge = (t.online?.toLowerCase() === 'კი' || t.online?.toLowerCase() === 'ონლაინ' || t.online?.toLowerCase() === 'ორივე' || t.region === 'ონლაინ')
    ? `<div class="tc-online">🌐 ონლაინ</div>` : '';
  const price = t.price ? `${t.price}₾/სთ` : 'შეთანხმებით';
  const region = t.region || '—';
  const photo = t.photo || DEFAULT_PHOTO;

  return `
    <div class="teacher-card" onclick="openProfile(${index})">
      <div class="tc-img ${bg}" style="${photo ? `background-image:url('${photo}');background-size:cover;background-position:center;` : ''}">
        ${photo ? '' : `<div class="tc-avatar ${av}">${initials}</div>`}
        ${onlineBadge}
      </div>
      <div class="tc-body">
        <div class="tc-name">${t.name}</div>
        <div class="tc-sub">${t.subcat || t.category}</div>
        <div class="tc-stars"><span class="stars">${stars}</span><span class="star-count">(ახალი)</span></div>
        <div class="tc-footer">
          <span class="tc-price">${price}</span>
          <span class="tc-region">${region}</span>
        </div>
      </div>
    </div>`;
}

// ===================== OPEN PROFILE =====================
function openProfile(index) {
  const t = allTeachers[index];
  if (!t) return;
  localStorage.setItem('swavli_teacher', JSON.stringify({...t, _index: index}));
  window.location.href = 'teacher.html';
}

// ===================== SEARCH / FILTER =====================
function filterTeachers(teachers, cat, reg, fmt) {
  return teachers.filter(t => {
    const matchCat = !cat || t.category.includes(stripEmoji(cat)) || t.subcat.includes(stripEmoji(cat));
    const matchReg = !reg || t.region.includes(stripEmoji(reg));
    const matchFmt = !fmt || (fmt === 'ონლაინ' ? t.online?.toLowerCase() === 'კი' || t.online?.toLowerCase() === 'ონლაინ' || t.online?.toLowerCase() === 'ორივე' : t.online?.toLowerCase() !== 'კი');
    return matchCat && matchReg && matchFmt;
  });
}

function doSearch() {
  const params = new URLSearchParams();
  if (selectedCat) params.set('cat', selectedCat);
  if (selectedReg) params.set('reg', selectedReg);
  if (selectedFmt) params.set('fmt', selectedFmt);
  window.location.href = 'teachers.html?' + params.toString();
}

function goSearch(cat) {
  window.location.href = 'teachers.html?cat=' + encodeURIComponent(cat);
}

// ===================== DROPDOWN LOGIC =====================
function buildDropdown(ddId, items, selId, stateKey) {
  const dd = document.getElementById(ddId);
  if (!dd) return;
  dd.innerHTML = items.map((item, i) =>
    `<div class="dd-opt${i===0?' active':''}" data-val="${i===0?'':stripEmoji(item)}"
      onclick="pickOption('${selId}','${ddId}','${stateKey}',this)">${item}</div>`
  ).join('');
}

function pickOption(selId, ddId, stateKey, el) {
  document.getElementById(selId).textContent = el.textContent;
  document.querySelectorAll('#'+ddId+' .dd-opt').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(ddId).classList.remove('open');
  if (stateKey === 'cat') selectedCat = el.dataset.val;
  if (stateKey === 'reg') selectedReg = el.dataset.val;
  if (stateKey === 'fmt') selectedFmt = el.dataset.val;

  // If on teachers page, re-render
  if (document.getElementById('teachersList')) renderTeachers();
  event.stopPropagation();
}

function toggleMenu() {
  document.getElementById('mobileMenu')?.classList.toggle('open');
}

// ===================== INDEX PAGE =====================
async function initIndex() {
  buildDropdown('ddCat', CATEGORIES, 'selCat', 'cat');
  buildDropdown('ddReg', REGIONS, 'selReg', 'reg');

  // Dropdown toggle
  ['sbCat','sbReg','sbFmt'].forEach(id => {
    const el = document.getElementById(id);
    const ddMap = {sbCat:'ddCat', sbReg:'ddReg', sbFmt:'ddFmt'};
    if (el) el.addEventListener('click', (e) => {
      e.stopPropagation();
      const dd = document.getElementById(ddMap[id]);
      const isOpen = dd.classList.contains('open');
      document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
      if (!isOpen) dd.classList.add('open');
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
  });

  allTeachers = await fetchTeachers();

  // Update stat count
  const sc = document.getElementById('statCount');
  if (sc) sc.textContent = allTeachers.length + '+';

  // Render last 6 teachers
  const grid = document.getElementById('featuredTeachers');
  if (grid) {
    const featured = allTeachers.slice(-6).reverse();
    if (featured.length === 0) {
      grid.innerHTML = '<div class="empty-state">ჯერ მასწავლებლები არ არის დამატებული</div>';
    } else {
      grid.innerHTML = featured.map((t, i) => renderCard(t, allTeachers.length - 1 - i)).join('');
    }
  }
}

// ===================== TEACHERS PAGE =====================
async function initTeachers() {
  allTeachers = await fetchTeachers();

  // Read URL params
  const params = new URLSearchParams(window.location.search);
  selectedCat = params.get('cat') || '';
  selectedReg = params.get('reg') || '';
  selectedFmt = params.get('fmt') || '';

  // Build native selects for filters page
  buildNativeSelect('filterCat', CATEGORIES, selectedCat);
  buildNativeSelect('filterReg', REGIONS, selectedReg);

  renderTeachers();
}

function buildNativeSelect(id, items, selected) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.map((item, i) => {
    const val = i === 0 ? '' : stripEmoji(item);
    const sel = val === selected ? 'selected' : '';
    return `<option value="${val}" ${sel}>${item}</option>`;
  }).join('');
  el.addEventListener('change', () => {
    if (id === 'filterCat') selectedCat = el.value;
    if (id === 'filterReg') selectedReg = el.value;
    renderTeachers();
  });
}

function renderTeachers() {
  const list = document.getElementById('teachersList');
  const countEl = document.getElementById('resultsCount');
  if (!list) return;

  const filtered = filterTeachers(allTeachers, selectedCat, selectedReg, selectedFmt);
  if (countEl) countEl.textContent = `${filtered.length} მასწავლებელი`;

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">ამ ფილტრით მასწავლებელი ვერ მოიძებნა</div>';
    return;
  }

  list.innerHTML = filtered.map((t, i) => {
    const realIndex = allTeachers.indexOf(t);
    return renderCard(t, realIndex);
  }).join('');
}

// ===================== PROFILE PAGE =====================
function initProfile() {
  const data = JSON.parse(localStorage.getItem('swavli_teacher') || 'null');
  if (!data) { window.location.href = 'teachers.html'; return; }

  const ci = colorIndex(data.name);
  document.getElementById('profBg').className = 'profile-card-top ' + BG_COLORS[ci];
  document.getElementById('profAv').className = 'profile-avatar-lg ' + AV_COLORS[ci];
  document.getElementById('profAv').textContent = getInitials(data.name);
  document.getElementById('profName').textContent = data.name;
  document.getElementById('profSub').textContent = (data.subcat || data.category) + (data.region ? ' · ' + data.region : '');
  document.title = data.name + ' — Swavli';

  if (data.online?.toLowerCase() === 'კი') {
    document.getElementById('onlineBadge').style.display = 'inline';
  }

  setVal('profCat', (data.subcat ? data.subcat + ' / ' : '') + data.category);
  setVal('profRegion', data.region || '—');
  setVal('profPrice', data.price ? data.price + '₾/სთ' : 'შეთანხმებით');
  if (data.instagram) setVal('profInsta', '@' + data.instagram.replace('@',''), '#0F6E56');
  if (data.phone) setVal('profPhone', data.phone);
  if (data.desc) document.getElementById('profDesc').textContent = data.desc;

  // Contact button
  document.getElementById('contactBtn').addEventListener('click', () => {
    if (data.phone) window.open('tel:' + data.phone);
    else if (data.instagram) window.open('https://instagram.com/' + data.instagram.replace('@',''), '_blank');
  });
}

function setVal(id, val, color) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = val;
    if (color) el.style.color = color;
  }
}

// ===================== AUTO INIT =====================
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'index')    initIndex();
  if (page === 'teachers') initTeachers();
  if (page === 'profile')  initProfile();
});
