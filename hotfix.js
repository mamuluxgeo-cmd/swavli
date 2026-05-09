// Small emergency fix for index dropdowns and register steps
(function(){
  function base(){return location.pathname.includes('/swavli/')?'/swavli/':'/'}
  function clean(){
    const p=location.pathname,q=location.search+location.hash;
    if(p.endsWith('/register.html')) history.replaceState(null,'',p.replace(/register\.html$/,'register/')+q);
    if(p.endsWith('/teachers.html')) history.replaceState(null,'',p.replace(/teachers\.html$/,'teachers/')+q);
    if(p.endsWith('/teacher.html')) history.replaceState(null,'',p.replace(/teacher\.html$/,'teacher/')+q);
  }
  window.toggleDD=function(id,e){
    if(e) e.stopPropagation();
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
  clean();
  setTimeout(clean,200);
})();
