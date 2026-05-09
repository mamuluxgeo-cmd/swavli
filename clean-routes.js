// Keeps navigation on clean URLs such as /teachers/, /teacher/, /register/
(function () {
  function withBase(path) {
    const base = document.querySelector('base')?.getAttribute('href') || '';
    return base + path;
  }

  window.cleanHref = function (path) {
    return withBase(path);
  };

  window.openProfile = function (id) {
    window.location.href = withBase('teacher/') + '?id=' + encodeURIComponent(id);
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

  document.addEventListener('DOMContentLoaded', rewriteLinks);
  setTimeout(rewriteLinks, 300);
  setTimeout(rewriteLinks, 1000);
})();
