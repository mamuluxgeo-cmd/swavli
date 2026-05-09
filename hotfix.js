// Small emergency fix for routes, homepage dropdowns and register steps
(function(){
  'use strict';

  const FALLBACK_CATS = [
    ['', 'ყველა კატეგორია'],
    ['მუსიკა', '🎵 მუსიკა'],
    ['ცეკვა', '💃 ცეკვა'],
    ['სილამაზე', '💅 სილამაზე'],
    ['სასკოლო საგნები', '🎓 სასკოლო საგნები'],
    ['ტექნოლოგია', '💻 ტექნოლოგია'],
    ['შემოქმედება', '🎨 შემოქმედება'],
    ['ენები', '🌍 ენები'],
    ['ხელსაქმე', '🔧 ხელსაქმე'],
    ['სპორტი და ჯანმრთელობა', '🏋️ სპორტი და ჯანმრთელობა'],
    ['კულინარია', '🍳 კულინარია'],
    ['თეატრი და მედია', '🎭 თეატრი და მედია'],
    ['მართვა', '🚗 მართვა'],
    ['ბიზნესი და ფინანსები', '💼 ბიზნესი და ფინანსები'],
    ['სხვა', '📦 სხვა']
  ];

  const FALLBACK_REGIONS = [
    ['', 'ყველა რეგიონი'],
    ['თბილისი', '📍 თბილისი'],
    ['კახეთი', '📍 კახეთი'],
    ['შიდა ქართლი', '📍 შიდა ქართლი'],
    ['ქვემო ქართლი', '📍 ქვემო ქართლი'],
    ['მცხეთა-მთიანეთი', '📍 მცხეთა-მთიანეთი'],
    ['სამცხე-ჯავახეთი', '📍 სამცხე-ჯავახეთი'],
    ['იმერეთი', '📍 იმერეთი'],
    ['რაჭა-ლეჩხუმი და ქვემო სვანეთი', '📍 რაჭა-ლეჩხუმი და ქვემო სვანეთი'],
    ['გურია', '📍 გურია'],
    ['სამეგრელო-ზემო სვანეთი', '📍 სამეგრელო-ზემო სვანეთი'],
    ['აჭარა', '📍 აჭარა'],
    ['აფხაზეთი', '📍 აფხაზეთი']
  ];

  const FALLBACK_FORMATS = [
    ['', 'ნებისმიერი'],
    ['პირადად', '🏠 პირადად'],
    ['ონლაინ', '🌐 ონლაინ'],
    ['ორივე', '✓ ორივე']
  ];

  function base(){return location.pathname.includes('/swavli/')?'/swavli/':'/'}

  function clean(){
    const p=location.pathname,q=location.search+location.hash;
    if(p.endsWith('/register.html')) history.replaceState(null,'',p.replace(/register\.html$/,'register/')+q);
    if(p.endsWith('/teachers.html')) history.replaceState(null,'',p.replace(/teachers\.html$/,'teachers/')+q);
    if(p.endsWith('/teacher.html')) history.replaceState(null,'',p.replace(/teacher\.html$/,'teacher/')+q);
  }

  function addDropdownCss(){
    if(document.getElementById('homepage-dropdown-fix-css')) return;
    const style=document.createElement('style');
    style.id='homepage-dropdown-fix-css';
    style.textContent=`
      #sbInner, #sbCat, #sbReg, #sbFmt { overflow: visible !important; }
      #sbCat, #sbReg, #sbFmt { isolation: isolate; }
      #ddCat, #ddReg, #ddFmt {
        display: none;
        position: absolute;
        left: 10px;
        right: 10px;
        top: calc(100% + 8px);
        min-width: 240px;
        max-height: 310px;
        overflow-y: auto;
        background: #fff;
        border: 1px solid #dfe4df;
        border-radius: 16px;
        box-shadow: 0 18px 45px rgba(15,45,38,.18);
        z-index: 99999;
        padding: 7px;
      }
      #ddCat.open, #ddReg.open, #ddFmt.open { display: block !important; }
      .dd-opt {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 11px 12px;
        border-radius: 11px;
        font-size: 13px;
        color: #26352f;
        cursor: pointer;
        user-select: none;
        white-space: normal;
        line-height: 1.35;
      }
      .dd-opt:hover { background: #F2F7F4; color: #0F6E56; }
      .dd-opt.active { background: #E8F8F3; color: #0F6E56; font-weight: 700; }
      @media (min-width: 600px){
        #ddCat, #ddReg, #ddFmt { left: 0; right: auto; width: 270px; }
        #ddReg { width: 300px; }
      }
      @media (max-width: 599px){
        #ddCat, #ddReg, #ddFmt { left: 12px; right: 12px; width: auto; max-height: 270px; }
      }
    `;
    document.head.appendChild(style);
  }

  function setSearchOverflowVisible(){
    ['sbInner','sbCat','sbReg','sbFmt'].forEach(id=>{
      const el=document.getElementById(id);
      if(el) el.style.overflow='visible';
    });
  }

  function optionHtml(items, type){
    return items.map(([value,label],idx)=>`<div class="dd-opt${idx===0?' active':''}" data-val="${escapeAttr(value)}" onclick="pickOptionSafe('${type}', this, event)">${label}</div>`).join('');
  }

  function escapeAttr(v){
    return String(v||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function buildCats(){
    try{
      if(typeof CATEGORIES!=='undefined' && typeof CAT_LABELS!=='undefined'){
        return CATEGORIES.map((value,i)=>[String(value||'').replace(/^[^\wა-ჰ]+/,'').trim(), CAT_LABELS[i] || value || 'ყველა კატეგორია']);
      }
    }catch(e){}
    return FALLBACK_CATS;
  }

  function buildRegions(){
    try{
      if(typeof REGIONS!=='undefined'){
        return REGIONS.map((value,i)=>[value || '', i===0?'ყველა რეგიონი':'📍 '+value]);
      }
    }catch(e){}
    return FALLBACK_REGIONS;
  }

  function fillDropdowns(){
    const cat=document.getElementById('ddCat');
    const reg=document.getElementById('ddReg');
    const fmt=document.getElementById('ddFmt');
    if(cat && !cat.dataset.fixed){ cat.innerHTML=optionHtml(buildCats(),'cat'); cat.dataset.fixed='1'; }
    if(reg && !reg.dataset.fixed){ reg.innerHTML=optionHtml(buildRegions(),'reg'); reg.dataset.fixed='1'; }
    if(fmt){ fmt.innerHTML=optionHtml(FALLBACK_FORMATS,'fmt'); fmt.dataset.fixed='1'; }
  }

  window.pickOptionSafe=function(type, el, e){
    if(e) e.stopPropagation();
    const value=el?.dataset?.val || '';
    const label=(el?.textContent || '').replace(/^\s*[🎵💃💅🎓💻🎨🌍🔧🏋️🍳🎭🚗💼📦📍🏠✓]+\s*/,'').trim();

    if(type==='cat'){
      window.selectedCat=value;
      const target=document.getElementById('selCat');
      if(target) target.textContent=value?label:'ყველა კატეგორია';
      markActive('ddCat', el);
    }
    if(type==='reg'){
      window.selectedReg=value;
      const target=document.getElementById('selReg');
      if(target) target.textContent=value?label:'ყველა რეგიონი';
      markActive('ddReg', el);
    }
    if(type==='fmt'){
      window.selectedFmt=value;
      const target=document.getElementById('selFmt');
      if(target) target.textContent=value?label:'ნებისმიერი';
      markActive('ddFmt', el);
    }
    document.querySelectorAll('.dropdown').forEach(x=>x.classList.remove('open'));
  };

  function markActive(id, el){
    const box=document.getElementById(id);
    if(!box) return;
    box.querySelectorAll('.dd-opt').forEach(x=>x.classList.remove('active'));
    if(el) el.classList.add('active');
  }

  window.pickOption=function(selId, ddId, type, el, e){
    window.pickOptionSafe(type, el, e);
  };

  window.toggleDD=function(id,e){
    if(e) e.stopPropagation();
    addDropdownCss();
    setSearchOverflowVisible();
    fillDropdowns();
    const dd=document.getElementById(id);
    if(!dd) return;
    const was=dd.classList.contains('open');
    document.querySelectorAll('.dropdown').forEach(x=>x.classList.remove('open'));
    if(!was) dd.classList.add('open');
  };

  window.doSearch=function(){
    const p=new URLSearchParams();
    if(window.selectedCat) p.set('cat',window.selectedCat);
    if(window.selectedReg) p.set('reg',window.selectedReg);
    if(window.selectedFmt) p.set('fmt',window.selectedFmt);
    location.href=base()+'teachers/'+(p.toString()?'?'+p.toString():'');
  };

  window.goSearch=function(cat){location.href=base()+'teachers/?cat='+encodeURIComponent(cat||'')};

  function v(id){return (document.getElementById(id)?.value||'').trim()}
  function err(id,on){const e=document.getElementById(id);if(e)e.style.display=on?'block':'none'}
  function selectedFormat(){return document.querySelector('input[name="format"]:checked')?.value||''}
  function setStep(n){
    document.querySelectorAll('.step-panel').forEach(p=>p.classList.remove('active'));
    document.getElementById('step'+n)?.classList.add('active');
    const pr=document.getElementById('progress');
    if(pr) pr.style.width=n===1?'33%':n===2?'66%':'100%';
    [1,2,3].forEach(i=>{
      document.getElementById('sn'+i)?.classList.toggle('active',i===n);
      document.getElementById('sl'+i)?.classList.toggle('active',i===n);
      document.getElementById('sn'+i)?.classList.toggle('done',i<n);
    });
  }
  window.goStep=function(n){
    if(n===2){
      let ok=true;
      ['name','region','price'].forEach(id=>{const good=!!v(id);document.getElementById(id)?.classList.toggle('error',!good);err('err-'+id,!good);ok=ok&&good});
      const settlement=v('settlement')==='სხვა'?v('customSettlement'):v('settlement');
      if(document.getElementById('settlement')){document.getElementById('settlement').classList.toggle('error',!settlement);err('err-settlement',!settlement);ok=ok&&!!settlement;}
      const fmt=!!selectedFormat();err('err-format',!fmt);ok=ok&&fmt;
      if(!ok) return;
    }
    if(n===3){
      let ok=true;
      const cat=!!v('category');document.getElementById('category')?.classList.toggle('error',!cat);err('err-category',!cat);ok=ok&&cat;
      const desc=v('desc').length>=30;document.getElementById('desc')?.classList.toggle('error',!desc);err('err-desc',!desc);ok=ok&&desc;
      if(!ok) return;
    }
    setStep(n);
  };

  document.addEventListener('click',()=>document.querySelectorAll('.dropdown').forEach(x=>x.classList.remove('open')));
  window.addEventListener('resize',()=>setTimeout(setSearchOverflowVisible,30));

  function init(){
    addDropdownCss();
    fillDropdowns();
    setSearchOverflowVisible();
    setTimeout(setSearchOverflowVisible,100);
    setTimeout(setSearchOverflowVisible,400);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
  clean();
  setTimeout(clean,200);
})();
