// ===================== CONFIG =====================
const SHEET_ID   = '1weL4w0BzXGrYPIczj0kKYFdvE615OIMKSzIpt9Q1Yu0';
const SHEET_NAME = 'teachers';
const PAGE_SIZE  = 35;

const CATEGORIES = ['','🎵 მუსიკა','💃 ცეკვა','💅 სილამაზე','🎓 სასკოლო საგნები','💻 ტექნოლოგია','🎨 შემოქმედება','🌍 ენები','🔧 ხელსაქმე','🏋️ სპორტი','🍳 კულინარია','🎭 თეატრი','🚗 მართვა','📦 სხვა'];
const CAT_LABELS = ['ყველა სფერო','მუსიკა','ცეკვა','სილამაზე','სასკოლო','ტექნოლოგია','შემოქმედება','ენები','ხელსაქმე','სპორტი','კულინარია','თეატრი','მართვა','სხვა'];
const REGIONS    = ['','თბილისი','კახეთი','შიდა ქართლი','ქვემო ქართლი','მცხეთა-მთიანეთი','სამცხე-ჯავახეთი','იმერეთი','რაჭა-ლეჩხუმი','გურია','სამეგრელო-ზემო სვანეთი','აჭარა','აფხაზეთი','ონლაინ'];
const FORMATS    = ['','პირადად','ონლაინ','ორივე'];
const FMT_LABELS = ['ნებისმიერი','პირადად','ონლაინ','ორივე'];
const BG_COLORS  = ['bg-teal','bg-amber','bg-pink','bg-blue','bg-purple','bg-green'];
const AV_COLORS  = ['av-teal','av-amber','av-pink','av-blue','av-purple','av-green'];

let allTeachers  = [];
let selectedCat  = '';
let selectedReg  = '';
let selectedFmt  = '';
let selectedMinP = 0;
let selectedMaxP = 9999;
let searchQuery  = '';
let currentPage  = 1;
let activeFilter = '';
let tempVal      = '';

// ===================== FETCH =====================
async function fetchTeachers() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}&t=${Date.now()}`;
  try {
    const res  = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0,-2));
    return json.table.rows.map(row => ({
      id:        row.c[0]?.v||'',
      name:      row.c[1]?.v||'',
      category:  row.c[2]?.v||'',
      subcat:    row.c[3]?.v||'',
      region:    row.c[4]?.v||'',
      price:     row.c[5]?.v||'',
      phone:     row.c[6]?.v||'',
      instagram: row.c[7]?.v||'',
      facebook:  row.c[8]?.v||'',
      desc:      row.c[9]?.v||'',
      online:    row.c[10]?.v||'',
      photo:     row.c[11]?.v||'',
      approved:  String(row.c[13]?.v||'').toLowerCase(),
    })).filter(t => t.name && t.approved === 'კი');
  } catch(e){ console.error(e); return []; }
}

// ===================== UTILS =====================
function getInitials(n){ return n.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase(); }
function colorIndex(n) { let h=0; for(let c of n) h=(h*31+c.charCodeAt(0))&0xffffffff; return Math.abs(h)%6; }
function stripEmoji(s) { return s.replace(/^[^\wა-ჰ]+/,'').trim(); }
function toggleMenu()  { document.getElementById('mobileMenu')?.classList.toggle('open'); }

// ===================== CARD =====================
function renderCard(t, index) {
  const ci = colorIndex(t.name);
  const bg = BG_COLORS[ci];
  const av = AV_COLORS[ci];
  const price  = t.price ? `${t.price}₾/სთ` : 'შეთ.';
  const region = t.region || '—';
  const isOnline = ['კი','ონლაინ','ორივე'].includes((t.online||'').toLowerCase());
  const imgHtml = t.photo
    ? `<img src="${t.photo}" alt="${t.name}" loading="lazy">`
    : `<div class="tc-avatar ${av}">${getInitials(t.name)}</div>`;
  const onlineBadge = isOnline ? `<div class="tc-online-badge">ონლაინ</div>` : '';
  return `
    <div class="teacher-card scroll-reveal" onclick="openProfile(${index})">
      <div class="tc-img ${bg}">${imgHtml}${onlineBadge}</div>
      <div class="tc-body">
        <div class="tc-name">${t.name}</div>
        <div class="tc-sub">${t.subcat||t.category}</div>
        <div class="tc-footer">
          <span class="tc-price">${price}</span>
          <span class="tc-region">${region}</span>
        </div>
      </div>
    </div>`;
}

// ===================== SCROLL REVEAL =====================
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.scroll-reveal').forEach(el => obs.observe(el));
}

// ===================== FILTER =====================
function filterTeachers(arr, cat, reg, fmt, minP, maxP, q) {
  return arr.filter(t => {
    const mc = !cat || t.category.includes(stripEmoji(cat)) || t.subcat.includes(stripEmoji(cat));
    const mr = !reg || t.region.toLowerCase().includes(reg.toLowerCase());
    const ol = (t.online||'').toLowerCase();
    const mf = !fmt || (fmt==='ონლაინ' ? ['კი','ონლაინ','ორივე'].includes(ol)
              : fmt==='პირადად' ? !['კი','ონლაინ'].includes(ol)
              : fmt==='ორივე'   ? ol==='ორივე' : true);
    const price = parseFloat(t.price)||0;
    const mp = price === 0 || (price >= minP && price <= maxP);
    const mq = !q || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.subcat.toLowerCase().includes(q);
    return mc && mr && mf && mp && mq;
  });
}

// ===================== FILTER PANEL =====================
function openFilter(type) {
  activeFilter = type;
  tempVal = type==='cat'?selectedCat:type==='reg'?selectedReg:selectedFmt;
  const overlay=document.getElementById('filterOverlay');
  const title=document.getElementById('fpTitle');
  const content=document.getElementById('fpContent');
  let items=[],labels=[];
  if(type==='cat'){title.textContent='სფერო';items=CATEGORIES;labels=CAT_LABELS;}
  else if(type==='reg'){title.textContent='რეგიონი';items=REGIONS;labels=REGIONS.map((r,i)=>i===0?'ყველა რეგიონი':r);}
  else{title.textContent='ფორმატი';items=FORMATS;labels=FMT_LABELS;}
  content.innerHTML=`<div class="fp-chips">${items.map((val,i)=>`<div class="fp-chip${val===tempVal||(!val&&!tempVal)?' sel':''}" onclick="selectChip(this,'${val}')">${labels[i]||val}</div>`).join('')}</div>`;
  overlay.classList.add('open');
}
function selectChip(el,val){document.querySelectorAll('.fp-chip').forEach(c=>c.classList.remove('sel'));el.classList.add('sel');tempVal=val;}
function closeFilter(){document.getElementById('filterOverlay')?.classList.remove('open');}
function clearFilter(){tempVal='';document.querySelectorAll('.fp-chip').forEach(c=>c.classList.remove('sel'));document.querySelector('.fp-chip')?.classList.add('sel');}
function applyFilter(){
  if(activeFilter==='cat'){selectedCat=tempVal;const idx=CATEGORIES.indexOf(tempVal);document.getElementById('pillCatLabel').textContent=tempVal?(CAT_LABELS[idx]||stripEmoji(tempVal)):'ყველა სფერო';document.getElementById('pillCat').classList.toggle('active',!!tempVal);}
  else if(activeFilter==='reg'){selectedReg=tempVal;document.getElementById('pillRegLabel').textContent=tempVal||'ყველა რეგიონი';document.getElementById('pillReg').classList.toggle('active',!!tempVal);}
  else{selectedFmt=tempVal;const idx=FORMATS.indexOf(tempVal);document.getElementById('pillFmtLabel').textContent=tempVal?FMT_LABELS[idx]:'ნებისმიერი';document.getElementById('pillFmt').classList.toggle('active',!!tempVal);}
  currentPage=1; closeFilter(); renderTeachers();
}

// ===================== RENDER TEACHERS =====================
function renderTeachers() {
  const list  = document.getElementById('teachersList');
  const count = document.getElementById('resultsCount');
  const pag   = document.getElementById('pagination');
  if (!list) return;
  const filtered = filterTeachers(allTeachers, selectedCat, selectedReg, selectedFmt, selectedMinP, selectedMaxP, searchQuery);
  if (count) count.textContent = `${filtered.length} მასწავლებელი`;
  if (!filtered.length) {
    list.innerHTML='<div class="empty-state">ამ ფილტრით მასწავლებელი ვერ მოიძებნა</div>';
    if(pag) pag.innerHTML=''; return;
  }
  const total=Math.ceil(filtered.length/PAGE_SIZE);
  if(currentPage>total) currentPage=1;
  const items=filtered.slice((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE);
  list.innerHTML=items.map(t=>renderCard(t,allTeachers.indexOf(t))).join('');
  setTimeout(initScrollReveal, 50);
  if(pag){
    if(total<=1){pag.innerHTML='';return;}
    let h=`<button class="page-btn" onclick="changePage(${currentPage-1})" ${currentPage===1?'disabled':''}>←</button>`;
    for(let i=1;i<=total;i++) h+=`<button class="page-btn${i===currentPage?' active':''}" onclick="changePage(${i})">${i}</button>`;
    h+=`<button class="page-btn" onclick="changePage(${currentPage+1})" ${currentPage===total?'disabled':''}>→</button>`;
    pag.innerHTML=h;
  }
}
function changePage(n){currentPage=n;renderTeachers();window.scrollTo({top:0,behavior:'smooth'});}
function openProfile(i){window.location.href='teacher.html?id='+i;}

// ===================== INIT TEACHERS =====================
async function initTeachers() {
  allTeachers = await fetchTeachers();
  const p=new URLSearchParams(location.search);
  selectedCat=p.get('cat')||''; selectedReg=p.get('reg')||'';
  if(selectedCat){const idx=CATEGORIES.findIndex(c=>stripEmoji(c)===selectedCat);document.getElementById('pillCatLabel').textContent=idx>0?CAT_LABELS[idx]:selectedCat;document.getElementById('pillCat').classList.add('active');}
  if(selectedReg){document.getElementById('pillRegLabel').textContent=selectedReg;document.getElementById('pillReg').classList.add('active');}

  const searchEl = document.getElementById('teacherSearch');
  if(searchEl){
    searchEl.addEventListener('input', e=>{
      searchQuery=e.target.value.toLowerCase().trim();
      currentPage=1; renderTeachers();
    });
  }

  const minSlider=document.getElementById('priceMin');
  const maxSlider=document.getElementById('priceMax');
  const priceLabel=document.getElementById('priceLabel');
  if(minSlider && maxSlider){
    function updatePrice(){
      selectedMinP=parseInt(minSlider.value);
      selectedMaxP=parseInt(maxSlider.value);
      if(selectedMinP>selectedMaxP) selectedMaxP=selectedMinP;
      maxSlider.value=selectedMaxP;
      if(priceLabel) priceLabel.textContent=`${selectedMinP}₾ — ${selectedMaxP}₾`;
      currentPage=1; renderTeachers();
    }
    minSlider.addEventListener('input',updatePrice);
    maxSlider.addEventListener('input',updatePrice);
  }
  renderTeachers();
}

// ===================== INDEX INIT =====================
const INDEX_CATS=['ყველა კატეგორია','🎵 მუსიკა','💃 ცეკვა','💅 სილამაზე','🎓 სასკოლო საგნები','💻 ტექნოლოგია','🎨 შემოქმედება','🌍 ენები','🔧 ხელსაქმე','🏋️ სპორტი','🍳 კულინარია','🎭 თეატრი','🚗 მართვა','📦 სხვა'];
const INDEX_REGS=['ყველა რეგიონი','📍 თბილისი','📍 კახეთი','📍 შიდა ქართლი','📍 ქვემო ქართლი','📍 მცხეთა-მთიანეთი','📍 სამცხე-ჯავახეთი','📍 იმერეთი','📍 რაჭა-ლეჩხუმი','📍 გურია','📍 სამეგრელო-ზემო სვანეთი','📍 აჭარა','📍 აფხაზეთი','🌐 ონლაინ'];

function buildDropdown(ddId,items,selId,stateKey){
  const dd=document.getElementById(ddId); if(!dd) return;
  dd.innerHTML=items.map((item,i)=>`<div class="dd-opt${i===0?' active':''}" data-val="${i===0?'':stripEmoji(item)}" onclick="pickOption('${selId}','${ddId}','${stateKey}',this,event)">${item}</div>`).join('');
}
function pickOption(selId,ddId,stateKey,el,e){
  if(e) e.stopPropagation();
  document.getElementById(selId).textContent=el.textContent;
  document.querySelectorAll('#'+ddId+' .dd-opt').forEach(o=>o.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(ddId).classList.remove('open');
  if(stateKey==='cat') selectedCat=el.dataset.val;
  if(stateKey==='reg') selectedReg=el.dataset.val;
  if(stateKey==='fmt') selectedFmt=el.dataset.val;
}
function doSearch(){const p=new URLSearchParams();if(selectedCat)p.set('cat',selectedCat);if(selectedReg)p.set('reg',selectedReg);if(selectedFmt)p.set('fmt',selectedFmt);window.location.href='teachers.html?'+p.toString();}
function goSearch(cat){window.location.href='teachers.html?cat='+encodeURIComponent(cat);}

// Animated counter
function animateCounter(el, target, suffix='') {
  let start=0; const dur=1500; const step=16;
  const inc=target/(dur/step);
  const timer=setInterval(()=>{
    start+=inc;
    if(start>=target){start=target;clearInterval(timer);}
    el.textContent=Math.floor(start)+(suffix);
  },step);
}

async function initIndex() {
  buildDropdown('ddCat',INDEX_CATS,'selCat','cat');
  buildDropdown('ddReg',INDEX_REGS,'selReg','reg');
  const map={sbCat:'ddCat',sbReg:'ddReg',sbFmt:'ddFmt'};
  Object.keys(map).forEach(id=>{
    const el=document.getElementById(id); if(!el) return;
    el.addEventListener('click',e=>{
      e.stopPropagation();
      const dd=document.getElementById(map[id]);
      const was=dd.classList.contains('open');
      document.querySelectorAll('.dropdown').forEach(d=>d.classList.remove('open'));
      if(!was) dd.classList.add('open');
    });
  });
  document.addEventListener('click',()=>document.querySelectorAll('.dropdown').forEach(d=>d.classList.remove('open')));

  allTeachers=await fetchTeachers();

  const sc=document.getElementById('statCount');
  if(sc) animateCounter(sc, allTeachers.length, '+');

  const grid=document.getElementById('featuredTeachers');
  if(!grid) return;
  const featured=allTeachers.slice(-5).reverse();
  grid.innerHTML=featured.length
    ? featured.map(t=>renderCard(t,allTeachers.indexOf(t))).join('')
    : '<div class="empty-state">ჯერ მასწავლებლები არ არის დამატებული</div>';
  setTimeout(initScrollReveal, 100);
}

// ===================== PROFILE =====================
async function initProfile() {
  const id=parseInt(new URLSearchParams(location.search).get('id'));
  const teachers=await fetchTeachers();
  const data=teachers[id];
  if(!data){window.location.href='teachers.html';return;}
  document.title=data.name+' — Moemzade';
  const wrap=document.getElementById('profPhotoWrap');
  const img=document.getElementById('profPhoto');
  const init=document.getElementById('profInitials');
  const bgs=['#1D9E75','#BA7517','#993556','#185FA5','#534AB7','#3B6D11'];
  wrap.style.background=bgs[colorIndex(data.name)];
  if(data.photo){img.src=data.photo;img.style.display='block';init.style.display='none';}
  else init.textContent=getInitials(data.name);
  document.getElementById('profName').textContent=data.name;
  document.getElementById('profSubtitle').textContent=(data.subcat||data.category)+(data.region?' · '+data.region:'');
  const badges=document.getElementById('profBadges');
  const ol=(data.online||'').toLowerCase();
  if(['კი','ონლაინ','ორივე'].includes(ol)) badges.innerHTML+='<span class="prof-badge online">🌐 ონლაინ</span>';
  if(['პირადად','ორივე'].includes(ol)) badges.innerHTML+='<span class="prof-badge">🏠 პირადად</span>';
  const sv=(id,val,cls)=>{const el=document.getElementById(id);if(el){el.textContent=val;if(cls)el.className='pir-val '+cls;}};
  sv('profCat',(data.subcat?data.subcat+' / ':'')+data.category);
  sv('profRegion',data.region||'—');
  sv('profPrice',data.price?data.price+'₾/სთ':'შეთანხმებით','green');
  sv('profPhone',data.phone||'—');
  if(data.instagram){document.getElementById('instRow').style.display='flex';sv('profInsta','@'+data.instagram.replace('@',''),'link');}
  if(data.facebook){document.getElementById('fbRow').style.display='flex';sv('profFb',data.facebook,'link');}
  const d=document.getElementById('profDesc');
  if(d) d.textContent=data.desc||'—';
  const btns=document.getElementById('contactBtns');
  if(!btns) return;
  if(data.phone) btns.innerHTML+=`<a href="tel:${data.phone}" class="contact-btn-main">📞 დარეკვა — ${data.phone}</a>`;
  const row=document.createElement('div');
  row.className='contact-btns-row';
  if(data.instagram) row.innerHTML+=`<a href="https://instagram.com/${data.instagram.replace('@','')}" target="_blank" class="contact-btn-sec">📸 Instagram</a>`;
  if(data.facebook){const u=data.facebook.startsWith('http')?data.facebook:'https://facebook.com/'+data.facebook;row.innerHTML+=`<a href="${u}" target="_blank" class="contact-btn-sec">📘 Facebook</a>`;}
  if(row.children.length) btns.appendChild(row);
}

// ===================== AUTO =====================
document.addEventListener('DOMContentLoaded',()=>{
  const page=document.body.dataset.page;
  if(page==='index')    initIndex();
  if(page==='teachers') initTeachers();
  if(page==='profile')  initProfile();
  setTimeout(initScrollReveal, 200);
});
