// Emergency compatibility fixes for clean URLs and form navigation
(function () {
  function withBase(path) {
    const base = document.querySelector('base')?.getAttribute('href') || '';
    return base + path;
  }

  function normalizeVisibleUrl() {
    const p = location.pathname;
    const q = location.search + location.hash;
    if (p.endsWith('/register.html')) history.replaceState(null, '', p.replace(/register\.html$/, 'register/') + q);
    if (p.endsWith('/teachers.html')) history.replaceState(null, '', p.replace(/teachers\.html$/, 'teachers/') + q);
    if (p.endsWith('/teacher.html')) history.replaceState(null, '', p.replace(/teacher\.html$/, 'teacher/') + q);
  }

  function rewriteLinks() {
    document.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (!h || h.startsWith('http') || h.startsWith('tel:') || h.startsWith('mailto:') || h.startsWith('#')) return;
      if (h === 'index.html') a.setAttribute('href', withBase('./'));
      if (h === 'teachers.html') a.setAttribute('href', withBase('teachers/'));
      if (h === 'register.html') a.setAttribute('href', withBase('register/'));
      if (h.startsWith('teacher.html')) a.setAttribute('href', withBase('teacher/') + h.replace('teacher.html', ''));
    });
  }

  function installIndexDropdownFixes() {
    window.toggleDD = function (ddId, e) {
      if (e) e.stopPropagation();
      const dd = document.getElementById(ddId);
      if (!dd) return;
      const isOpen = dd.classList.contains('open');
      document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
      if (!isOpen) dd.classList.add('open');
    };

    window.doSearch = function () {
      const p = new URLSearchParams();
      if (window.selectedCat) p.set('cat', window.selectedCat);
      if (window.selectedReg) p.set('reg', window.selectedReg);
      if (window.selectedFmt) p.set('fmt', window.selectedFmt);
      window.location.href = withBase('teachers/') + (p.toString() ? '?' + p.toString() : '');
    };

    window.goSearch = function (cat) {
      window.location.href = withBase('teachers/') + '?cat=' + encodeURIComponent(cat || '');
    };

    window.openProfile = function (id) {
      window.location.href = withBase('teacher/') + '?id=' + encodeURIComponent(id);
    };
  }

  function showErr(id, show) {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? 'block' : 'none';
  }
  function value(id) {
    return (document.getElementById(id)?.value || '').trim();
  }
  function selectedFormat() {
    return document.querySelector('input[name="format"]:checked')?.value || '';
  }
  function validateStepOne() {
    let ok = true;
    ['name','region','price'].forEach(id => {
      const good = !!value(id);
      document.getElementById(id)?.classList.toggle('error', !good);
      showErr('err-' + id, !good);
      ok = ok && good;
    });
    const settlement = value('settlement') === 'სხვა' ? value('customSettlement') : value('settlement');
    const setOk = !!settlement;
    document.getElementById('settlement')?.classList.toggle('error', !setOk);
    showErr('err-settlement', !setOk);
    ok = ok && setOk;
    const fmtOk = !!selectedFormat();
    showErr('err-format', !fmtOk);
    ok = ok && fmtOk;
    return ok;
  }
  function validateStepTwo() {
    let ok = true;
    const catOk = !!value('category');
    document.getElementById('category')?.classList.toggle('error', !catOk);
    showErr('err-category', !catOk);
    ok = ok && catOk;
    const descOk = value('desc').length >= 30;
    document.getElementById('desc')?.classList.toggle('error', !descOk);
    showErr('err-desc', !descOk);
    ok = ok && descOk;
    return ok;
  }
  function validateStepThree() {
    const ok = !!value('phone');
    document.getElementById('phone')?.classList.toggle('error', !ok);
    showErr('err-phone', !ok);
    return ok;
  }
  function setStep(n) {
    document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('step' + n)?.classList.add('active');
    const progress = document.getElementById('progress');
    if (progress) progress.style.width = n === 1 ? '33%' : n === 2 ? '66%' : '100%';
    [1,2,3].forEach(i => {
      document.getElementById('sn' + i)?.classList.toggle('active', i === n);
      document.getElementById('sl' + i)?.classList.toggle('active', i === n);
      document.getElementById('sn' + i)?.classList.toggle('done', i < n);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function installRegisterFixes() {
    if (!document.body.classList.contains('reg-page')) return;
    window.goStep = function (n) {
      if (n === 2 && !validateStepOne()) return;
      if (n === 3 && !validateStepTwo()) return;
      setStep(n);
    };

    document.querySelectorAll('.btn-next').forEach(btn => {
      const txt = btn.textContent || '';
      if (txt.includes('გაგრძელება') && btn.getAttribute('onclick')?.includes('goStep(2)')) btn.onclick = () => window.goStep(2);
      if (txt.includes('გაგრძელება') && btn.getAttribute('onclick')?.includes('goStep(3)')) btn.onclick = () => window.goStep(3);
    });
  }

  normalizeVisibleUrl();
  installIndexDropdownFixes();
  document.addEventListener('DOMContentLoaded', function () {
    normalizeVisibleUrl();
    installIndexDropdownFixes();
    installRegisterFixes();
    rewriteLinks();
  });
  setTimeout(function () { normalizeVisibleUrl(); installRegisterFixes(); rewriteLinks(); }, 300);
  setTimeout(function () { normalizeVisibleUrl(); installRegisterFixes(); rewriteLinks(); }, 1000);
})();
