// ===================== CONFIG =====================
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

// ===================== FETCH =====================
async function fetchTeachers() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}&t=${Date.now()}`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    return rows.map(row => ({
      id: row.c[0]?.v || '',
      name: row.c[1]?.v || '',
      category: row.c[2]?.v || '',
      subcat: row.c[3]?.v || '',
      region: row.c[4]?.v || '',
      price: row.c[5]?.v || '',
      phone: row.c[6]?.v || '',
      instagram: row.c[7]?.v || '',
      facebook: row.c[8]?.v || '',
      desc: row.c[9]?.v || '',
      online: row.c[10]?.v || '',
      photo: row.c[11]?.v || '',
    })).filter(t => t.name && t.id !== '001');

  } catch (e) {
    console.error(e);
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

// ===================== CARD =====================
function renderCard(t, index) {
  const ci = colorIndex(t.name);
  const bg = BG_COLORS[ci];
  const av = AV_COLORS[ci];
  const initials = getInitials(t.name);

  const price = t.price ? `${t.price}₾/სთ` : 'შეთანხმებით';
  const region = t.region || '—';
  const photo = t.photo || DEFAULT_PHOTO;

  return `
    <div class="teacher-card" onclick="openProfile(${index})">

      <div class="tc-img ${bg}">
        ${
          photo
          ? `<img src="${photo}" alt="${t.name}" loading="lazy">`
          : `<div class="tc-avatar ${av}">${initials}</div>`
        }
      </div>

      <div class="tc-body">
        <div class="tc-name">${t.name}</div>
        <div class="tc-sub">${t.subcat || t.category}</div>

        <div class="tc-footer">
          <span class="tc-price">${price}</span>
          <span class="tc-region">${region}</span>
        </div>
      </div>

    </div>
  `;
}

// ===================== NAV =====================
function toggleMenu() {
  document.getElementById('mobileMenu')?.classList.toggle('open');
}

// ===================== OPEN PROFILE =====================
function openProfile(index) {
  window.location.href = 'teacher.html?id=' + index;
}

// ===================== FILTER =====================
function filterTeachers(teachers, cat, reg, fmt) {
  return teachers.filter(t => {
    const matchCat = !cat || t.category.includes(stripEmoji(cat)) || t.subcat.includes(stripEmoji(cat));
    const matchReg = !reg || t.region.includes(stripEmoji(reg));
    const matchFmt = !fmt || (fmt === 'ონლაინ'
      ? ['კი','ონლაინ','ორივე'].includes(t.online?.toLowerCase())
      : t.online?.toLowerCase() !== 'კი'
    );
    return matchCat && matchReg && matchFmt;
  });
}

// ===================== BUILD SELECT =====================
function buildNativeSelect(id, items, selected) {
  const el = document.getElementById(id);
  if (!el) return;

  el.innerHTML = items.map((item, i) => {
    const val = i === 0 ? '' : stripEmoji(item);
    return `<option value="${val}" ${val===selected?'selected':''}>${item}</option>`;
  }).join('');

  el.addEventListener('change', () => {
    if (id === 'filterCat') selectedCat = el.value;
    if (id === 'filterReg') selectedReg = el.value;
    currentPage = 1;
    renderTeachers();
  });
}

// ===================== RENDER =====================
function renderTeachers() {
  const list = document.getElementById('teachersList');
  const count = document.getElementById('resultsCount');
  const pag = document.getElementById('pagination');

  const filtered = filterTeachers(allTeachers, selectedCat, selectedReg, selectedFmt);
  if (count) count.textContent = `${filtered.length} მასწავლებელი`;

  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state">არ მოიძებნა</div>';
    if (pag) pag.innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = 1;

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  list.innerHTML = pageItems.map(t => {
    const idx = allTeachers.indexOf(t);
    return renderCard(t, idx);
  }).join('');

  // Pagination
  if (pag) {
    if (totalPages <= 1) { pag.innerHTML = ''; return; }
    let html = `<button class="page-btn" onclick="changePage(${currentPage-1})" ${currentPage===1?'disabled':''}>←</button>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn${i===currentPage?' active':''}" onclick="changePage(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" onclick="changePage(${currentPage+1})" ${currentPage===totalPages?'disabled':''}>→</button>`;
    pag.innerHTML = html;
  }
}

function changePage(n) {
  currentPage = n;
  renderTeachers();
  window.scrollTo({top: 0, behavior: 'smooth'});
}

// ===================== INIT =====================
const PAGE_SIZE = 35;
let currentPage = 1;

async function initTeachers() {
  allTeachers = await fetchTeachers();

  const params = new URLSearchParams(location.search);
  selectedCat = params.get('cat') || '';
  selectedReg = params.get('reg') || '';
  currentPage = 1;

  buildNativeSelect('filterCat', CATEGORIES, selectedCat);
  buildNativeSelect('filterReg', REGIONS, selectedReg);

  renderTeachers();
}

// ===================== AUTO =====================
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'teachers') initTeachers();
});

// ===================== SEARCH =====================
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

// ===================== DROPDOWN (index) =====================
function buildDropdown(ddId, items, selId, stateKey) {
  const dd = document.getElementById(ddId);
  if (!dd) return;
  dd.innerHTML = items.map((item, i) =>
    `<div class="dd-opt${i===0?' active':''}" data-val="${i===0?'':stripEmoji(item)}"
      onclick="pickOption('${selId}','${ddId}','${stateKey}',this,event)">${item}</div>`
  ).join('');
}

function pickOption(selId, ddId, stateKey, el, e) {
  if (e) e.stopPropagation();
  document.getElementById(selId).textContent = el.textContent;
  document.querySelectorAll('#'+ddId+' .dd-opt').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(ddId).classList.remove('open');
  if (stateKey === 'cat') selectedCat = el.dataset.val;
  if (stateKey === 'reg') selectedReg = el.dataset.val;
  if (stateKey === 'fmt') selectedFmt = el.dataset.val;
}

// ===================== INDEX PAGE =====================
async function initIndex() {
  buildDropdown('ddCat', CATEGORIES, 'selCat', 'cat');
  buildDropdown('ddReg', REGIONS, 'selReg', 'reg');

  ['sbCat','sbReg','sbFmt'].forEach(id => {
    const el = document.getElementById(id);
    const ddMap = {sbCat:'ddCat', sbReg:'ddReg', sbFmt:'ddFmt'};
    if (!el) return;
    el.addEventListener('click', (e) => {
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

  const sc = document.getElementById('statCount');
  if (sc) sc.textContent = allTeachers.length + '+';

  const grid = document.getElementById('featuredTeachers');
  if (!grid) return;

  const featured = allTeachers.slice(-5).reverse();
  if (!featured.length) {
    grid.innerHTML = '<div class="empty-state">ჯერ მასწავლებლები არ არის დამატებული</div>';
    return;
  }
  grid.innerHTML = featured.map((t, i) => {
    const realIdx = allTeachers.indexOf(t);
    return renderCard(t, realIdx);
  }).join('');
}

// ===================== PROFILE PAGE =====================
async function initProfile() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));

  document.getElementById('profName').textContent = 'იტვირთება...';

  const teachers = await fetchTeachers();
  const data = teachers[id];
  if (!data) { window.location.href = 'teachers.html'; return; }

  document.title = data.name + ' — Swavli';

  // Photo
  const wrap = document.getElementById('profPhotoWrap');
  const img  = document.getElementById('profPhoto');
  const init = document.getElementById('profInitials');
  const ci   = colorIndex(data.name);
  const bgs  = ['#1D9E75','#BA7517','#993556','#185FA5','#534AB7','#3B6D11'];

  if (data.photo) {
    wrap.style.background = bgs[ci];
    img.src = data.photo;
    img.style.display = 'block';
    init.style.display = 'none';
  } else {
    wrap.style.background = bgs[ci];
    init.textContent = getInitials(data.name);
  }

  // Hero text
  document.getElementById('profName').textContent = data.name;
  document.getElementById('profSubtitle').textContent =
    (data.subcat || data.category) + (data.region ? ' · ' + data.region : '');

  // Badges
  const badges = document.getElementById('profBadges');
  const fmt = (data.online || '').toLowerCase();
  if (['ონლაინ','ორივე','კი'].includes(fmt))
    badges.innerHTML += '<span class="prof-badge online">🌐 ონლაინ</span>';
  if (['პირადად','ორივე'].includes(fmt))
    badges.innerHTML += '<span class="prof-badge">🏠 პირადად</span>';

  // Info
  const setVal = (id, val, cls) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = val;
    if (cls) el.className = 'pir-val ' + cls;
  };
  setVal('profCat',    (data.subcat ? data.subcat + ' / ' : '') + (data.category || '—'));
  setVal('profRegion', data.region || '—');
  setVal('profPrice',  data.price ? data.price + '₾/სთ' : 'შეთანხმებით', 'green');
  setVal('profPhone',  data.phone || '—');

  if (data.instagram) {
    const r = document.getElementById('instRow');
    if (r) r.style.display = 'grid';
    setVal('profInsta', '@' + data.instagram.replace('@',''), 'link');
  }
  if (data.facebook) {
    const r = document.getElementById('fbRow');
    if (r) r.style.display = 'grid';
    setVal('profFb', data.facebook, 'link');
  }

  const descEl = document.getElementById('profDesc');
  if (descEl) descEl.textContent = data.desc || '—';

  // Contact
  const btns = document.getElementById('contactBtns');
  if (!btns) return;
  if (data.phone)
    btns.innerHTML += `<a href="tel:${data.phone}" class="contact-btn-main">📞 დარეკვა — ${data.phone}</a>`;
  const row = document.createElement('div');
  row.className = 'contact-btns-row';
  if (data.instagram)
    row.innerHTML += `<a href="https://instagram.com/${data.instagram.replace('@','')}" target="_blank" class="contact-btn-sec">📸 Instagram</a>`;
  if (data.facebook) {
    const url = data.facebook.startsWith('http') ? data.facebook : 'https://facebook.com/'+data.facebook;
    row.innerHTML += `<a href="${url}" target="_blank" class="contact-btn-sec">📘 Facebook</a>`;
  }
  if (row.children.length) btns.appendChild(row);
}

// ===================== AUTO INIT =====================
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'index')    initIndex();
  if (page === 'teachers') initTeachers();
  if (page === 'profile')  initProfile();
});
