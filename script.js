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
    renderTeachers();
  });
}

// ===================== RENDER =====================
function renderTeachers() {
  const list = document.getElementById('teachersList');
  const count = document.getElementById('resultsCount');

  const filtered = filterTeachers(allTeachers, selectedCat, selectedReg, selectedFmt);

  if (count) count.textContent = `${filtered.length} მასწავლებელი`;

  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state">არ მოიძებნა</div>';
    return;
  }

  list.innerHTML = filtered.map((t, i) => {
    const idx = allTeachers.indexOf(t);
    return renderCard(t, idx);
  }).join('');
}

// ===================== INIT =====================
async function initTeachers() {
  allTeachers = await fetchTeachers();

  const params = new URLSearchParams(location.search);
  selectedCat = params.get('cat') || '';
  selectedReg = params.get('reg') || '';

  buildNativeSelect('filterCat', CATEGORIES, selectedCat);
  buildNativeSelect('filterReg', REGIONS, selectedReg);

  renderTeachers();
}

// ===================== AUTO =====================
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'teachers') initTeachers();
});
