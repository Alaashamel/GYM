const IF = (() => {
  const LANG_KEY = 'if_lang';
  const THEME_KEY = 'if_theme';
  const IN_PAGES = location.pathname.includes('/pages/');
  const HOME = IN_PAGES ? '../index.html' : 'index.html';
  const R = IN_PAGES ? '' : 'pages/';
  const CURRENT_FILE = location.pathname.split('/').pop() || 'index.html';

  const NAV_GROUPS = [
    { file: null, ar: 'الرئيسية', en: 'Home', href: () => HOME },
    { group: true, ar: 'تدريب', en: 'Training', items: [
        { file: 'exercises.html', ar: 'التمارين', en: 'Exercises' },
        { file: 'programs.html', ar: 'الأنظمة', en: 'Programs' },
        { file: 'challenges.html', ar: 'التحديات', en: 'Challenges' },
      ]
    },
    { group: true, ar: 'أدوات', en: 'Tools', items: [
        { file: 'tools.html', ar: 'الحاسبات', en: 'Calculators' },
        { file: 'food-analyzer.html', ar: 'محلل الأكل', en: 'Food Analyzer' },
        { file: 'progress.html', ar: 'التقدم', en: 'Progress' },
        { file: 'recipes.html', ar: 'الوصفات', en: 'Recipes' },
      ]
    },
    { group: true, ar: 'الجيم', en: 'Gym', items: [
        { file: 'plans.html', ar: 'الاشتراكات', en: 'Plans' },
        { file: 'trainers.html', ar: 'المدربين', en: 'Trainers' },
        { file: 'schedule.html', ar: 'الجدول', en: 'Schedule' },
        { file: 'about.html', ar: 'من نحن', en: 'About' },
      ]
    },
    { file: 'contact.html', ar: 'تواصل', en: 'Contact', href: () => R + 'contact.html' },
  ];

  function hrefFor(file){ return IN_PAGES ? file : R + file; }
  function getLang(){ return localStorage.getItem(LANG_KEY) || 'ar'; }
  function getTheme(){ return localStorage.getItem(THEME_KEY) || 'dark'; }

  function navLinkHTML(item, lang){
    const label = lang === 'ar' ? item.ar : item.en;
    if(item.group){
      const groupActive = item.items.some(it => it.file === CURRENT_FILE);
      const links = item.items.map(it => {
        const active = it.file === CURRENT_FILE ? ' style="color:var(--accent)"' : '';
        return `<a href="${hrefFor(it.file)}"${active}>${lang==='ar'?it.ar:it.en}</a>`;
      }).join('');
      return `<details class="nav-dropdown"><summary${groupActive ? ' style="color:var(--accent)"' : ''}>${label}</summary><div class="dropdown-panel">${links}</div></details>`;
    }
    const href = item.href();
    const isActive = (item.file === CURRENT_FILE) || (item.file === null && (CURRENT_FILE === 'index.html'));
    return `<a href="${href}" class="${isActive ? 'active' : ''}">${label}</a>`;
  }

  // دالة بناء الـ Top Bar (فوق)
  function buildNavbar(lang, theme){
    const sunMoon = theme === 'dark'
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>`;
    return `
    <div class="navbar">
      <div class="navbar-inner">
        <a class="brand" href="${HOME}">
          <svg class="brand-mark" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" fill="none" stroke="url(#gradNav)" stroke-width="3"/>
            <circle cx="20" cy="20" r="7" fill="url(#gradNav)"/>
            <defs><linearGradient id="gradNav" x1="0" y1="0" x2="40" y2="40"><stop offset="0" stop-color="#FF4B1F"/><stop offset="1" stop-color="#FFB020"/></linearGradient></defs>
          </svg>
          <span>${lang==='ar' ? 'آيرون فورج' : 'IRON FORGE'}</span>
        </a>
        <nav class="nav-links" id="navLinks"></nav>
        <div class="nav-actions">
          <a href="${hrefFor('login.html')}" class="icon-btn" title="${lang==='ar'?'حسابي':'My account'}" id="loginIconBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>
          </a>
          <button class="icon-btn lang-btn" id="langBtn" title="Language">${lang==='ar' ? 'EN' : 'ع'}</button>
          <button class="icon-btn" id="themeBtn" title="Theme">${sunMoon}</button>
        </div>
      </div>
    </div>`;
  }

  // دالة بناء الـ Bottom Nav (تحت - خاصة بالموبايل)
  function buildMobileBottomNav(lang){
    const items = [
      { link: null, icon: '🏠', label: lang==='ar'?'الرئيسية':'Home', href: HOME },
      { group: true, icon: '💪', label: lang==='ar'?'تدريب':'Training', items: [
          { file: 'exercises.html', label: lang==='ar'?'التمارين':'Exercises' },
          { file: 'programs.html', label: lang==='ar'?'الأنظمة':'Programs' },
          { file: 'challenges.html', label: lang==='ar'?'التحديات':'Challenges' },
        ]
      },
      { group: true, icon: '🛠️', label: lang==='ar'?'أدوات':'Tools', items: [
          { file: 'tools.html', label: lang==='ar'?'الحاسبات':'Calculators' },
          { file: 'food-analyzer.html', label: lang==='ar'?'محلل الأكل':'Food Analyzer' },
          { file: 'progress.html', label: lang==='ar'?'التقدم':'Progress' },
          { file: 'recipes.html', label: lang==='ar'?'الوصفات':'Recipes' },
        ]
      },
      { group: true, icon: '🏋️', label: lang==='ar'?'الجيم':'Gym', items: [
          { file: 'plans.html', label: lang==='ar'?'الاشتراكات':'Plans' },
          { file: 'trainers.html', label: lang==='ar'?'المدربين':'Trainers' },
          { file: 'schedule.html', label: lang==='ar'?'الجدول':'Schedule' },
          { file: 'about.html', label: lang==='ar'?'من نحن':'About' },
        ]
      },
      { link: 'contact.html', icon: '📞', label: lang==='ar'?'تواصل':'Contact', href: R + 'contact.html' }
    ];

    return `<div class="mobile-bottom-nav">` + items.map(item => {
      if(item.group){
        const groupActive = item.items.some(it => it.file === CURRENT_FILE);
        const links = item.items.map(it => {
          const active = it.file === CURRENT_FILE ? ' class="active" style="color:var(--accent)"' : '';
          return `<a href="${hrefFor(it.file)}"${active}>${it.label}</a>`;
        }).join('');
        return `
        <details class="nav-dropdown">
          <summary${groupActive ? ' style="color:var(--accent)"' : ''}><span style="font-size:1.3rem; display:block; margin-bottom:2px;">${item.icon}</span>${item.label}</summary>
          <div class="dropdown-panel">${links}</div>
        </details>`;
      } else {
        const active = (!item.link && CURRENT_FILE === 'index.html') || (item.link === CURRENT_FILE);
        return `<a href="${item.href}" class="${active ? 'active' : ''}"><span style="font-size:1.3rem; display:block; margin-bottom:2px;">${item.icon}</span>${item.label}</a>`;
      }
    }).join('') + `</div>`;
  }

  // دالة بناء الـ Footer
  function buildFooter(lang){
    const t = lang === 'ar' ? {
      tagline: 'مكان واحد لكل رحلتك الرياضية.',
      rights: `© ${new Date().getFullYear()} آيرون فورج.`,
      founder: 'عبدالرحمن إبراهيم سفيان',
      addr: 'شارع الرياضة، الجيزة، مصر', phone: '01000000000', mail: 'info@ironforge-gym.com',
    } : {
      tagline: 'One place for your fitness journey.',
      rights: `© ${new Date().getFullYear()} Iron Forge.`,
      founder: 'Abdelrahman Ibrahim Sofyan',
      addr: 'Sports St., Giza, Egypt', phone: '01000000000', mail: 'info@ironforge-gym.com',
    };
    const L = (file,label) => `<li style="list-style: none;"><a href="${hrefFor(file)}" style="display:inline-block; padding: 4px 0;">${label}</a></li>`;
    return `
    <div class="container">
      <div class="footer-grid">
        <div style="grid-column: 1 / -1; text-align:center; margin-bottom: 24px;">
          <div class="brand" style="justify-content:center; margin-bottom:6px;">
            <svg class="brand-mark" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" fill="none" stroke="url(#gradFoot)" stroke-width="3"/>
              <circle cx="20" cy="20" r="7" fill="url(#gradFoot)"/>
              <defs><linearGradient id="gradFoot" x1="0" y1="0" x2="40" y2="40"><stop offset="0" stop-color="#FF4B1F"/><stop offset="1" stop-color="#FFB020"/></linearGradient></defs>
            </svg>
            <span>${lang==='ar' ? 'آيرون فورج' : 'IRON FORGE'}</span>
          </div>
          <p style="max-width:320px; margin:0 auto; font-size:.9rem; color:var(--text-dim);">${t.tagline}</p>
        </div>
        <div style="display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 16px 30px; border-top: 1px solid var(--border); padding-top: 16px;">
           <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
              <span style="font-size:.7rem; color:var(--text-faint); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">${lang==='ar'?'تصفح':'Browse'}</span>
              <ul style="margin:0; padding:0; display:flex; flex-direction:column; gap:2px;">${L('exercises.html', lang==='ar'?'تمارين':'Exercises')}${L('programs.html', lang==='ar'?'برامج':'Programs')}${L('plans.html', lang==='ar'?'اشتراكات':'Plans')}</ul>
           </div>
           <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
              <span style="font-size:.7rem; color:var(--text-faint); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">${lang==='ar'?'أدوات':'Tools'}</span>
              <ul style="margin:0; padding:0; display:flex; flex-direction:column; gap:2px;">${L('tools.html', lang==='ar'?'حاسبات':'Calculators')}${L('progress.html', lang==='ar'?'تقدم':'Progress')}${L('recipes.html', lang==='ar'?'وصفات':'Recipes')}</ul>
           </div>
           <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
              <span style="font-size:.7rem; color:var(--text-faint); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">${lang==='ar'?'الجيم':'Gym'}</span>
              <ul style="margin:0; padding:0; display:flex; flex-direction:column; gap:2px;">${L('trainers.html', lang==='ar'?'مدربين':'Trainers')}${L('schedule.html', lang==='ar'?'جدول':'Schedule')}${L('about.html', lang==='ar'?'من نحن':'About')}</ul>
           </div>
        </div>
        <div style="grid-column: 1 / -1; text-align:center; margin-top: 10px; padding-top: 16px; border-top: 1px solid var(--border);">
           <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 12px 24px; font-size: .85rem; color: var(--text-faint);">
              <span>${t.addr}</span> <span dir="ltr">${t.phone}</span> <span dir="ltr">${t.mail}</span>
           </div>
           <div style="margin-top: 14px; font-size: .7rem; color: var(--text-faint);">${t.rights} ${lang==='ar' ? 'صنع بشغف للجيماوية 💪' : 'Made with passion 💪'}</div>
        </div>
      </div>
    </div>`;
  }

  function applyTheme(theme){ document.body.classList.toggle('light', theme === 'light'); localStorage.setItem(THEME_KEY, theme); }
  function applyLangToPage(lang){
    document.documentElement.setAttribute('lang', lang === 'ar' ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.querySelectorAll('[data-ar][data-en]').forEach(el => { el.textContent = lang === 'ar' ? el.getAttribute('data-ar') : el.getAttribute('data-en'); });
    document.querySelectorAll('[data-ar-html][data-en-html]').forEach(el => { el.innerHTML = lang === 'ar' ? el.getAttribute('data-ar-html') : el.getAttribute('data-en-html'); });
    document.querySelectorAll('[data-ar-ph][data-en-ph]').forEach(el => { el.setAttribute('placeholder', lang === 'ar' ? el.getAttribute('data-ar-ph') : el.getAttribute('data-en-ph')); });
    localStorage.setItem(LANG_KEY, lang);
  }

  function mountShell(){
    const lang = getLang(), theme = getTheme();
    const navRoot = document.getElementById('navbar-root');
    const footRoot = document.getElementById('footer-root');
    if(navRoot) {
      navRoot.innerHTML = buildNavbar(lang, theme);
      if(window.innerWidth <= 980) {
        const existingBottom = document.querySelector('.mobile-bottom-nav');
        if(existingBottom) existingBottom.remove();
        const bottomNav = document.createElement('div');
        bottomNav.innerHTML = buildMobileBottomNav(lang);
        document.body.appendChild(bottomNav.firstElementChild);
      }
    }
    if(footRoot){ footRoot.classList.add('footer'); footRoot.innerHTML = buildFooter(lang); }
    applyTheme(theme); applyLangToPage(lang);
    const langBtn = document.getElementById('langBtn'); const themeBtn = document.getElementById('themeBtn');
    if(langBtn) langBtn.addEventListener('click', () => { const newLang = getLang() === 'ar' ? 'en' : 'ar'; applyLangToPage(newLang); mountShell(); document.dispatchEvent(new CustomEvent('if:langchange', { detail: { lang: newLang } })); });
    if(themeBtn) themeBtn.addEventListener('click', () => { const newTheme = getTheme() === 'dark' ? 'light' : 'dark'; applyTheme(newTheme); mountShell(); document.dispatchEvent(new CustomEvent('if:themechange', { detail: { theme: newTheme } })); });
  }

  let resizeTimer; window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { mountShell(); }, 200); });
  function initReveal(){
    if(typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 });
    } else { const els = document.querySelectorAll('[data-aos]'); const io = new IntersectionObserver((entries)=>{ entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add('aos-animate'); io.unobserve(en.target); } }); }, { threshold: .15 }); els.forEach(e=>io.observe(e)); }
  }
  function initCounters(){
    const nums = document.querySelectorAll('.stat-num[data-count]'); if(!nums.length) return;
    const animate = (el) => { const target = parseFloat(el.getAttribute('data-count')); const suffix = el.getAttribute('data-suffix') || ''; const dur = 1200; const start = performance.now(); function tick(now){ const p = Math.min(1, (now-start)/dur); const val = Math.floor(target * (1 - Math.pow(1-p, 3))); el.textContent = val.toLocaleString() + suffix; if(p < 1) requestAnimationFrame(tick); } requestAnimationFrame(tick); };
    if(!('IntersectionObserver' in window)){ nums.forEach(animate); return; }
    const io = new IntersectionObserver((entries)=>{ entries.forEach(en=>{ if(en.isIntersecting){ animate(en.target); io.unobserve(en.target); } }); }, { threshold:.4 }); nums.forEach(n=>io.observe(n));
  }
  function initTabs(root=document){
    root.querySelectorAll('.tabs').forEach(tabBar=>{
      const panelWrapId = tabBar.getAttribute('data-panels'); const panelWrap = panelWrapId ? document.getElementById(panelWrapId) : tabBar.nextElementSibling;
      tabBar.querySelectorAll('.tab-btn').forEach(btn=>{ btn.addEventListener('click', ()=>{ tabBar.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); const target = btn.getAttribute('data-tab'); panelWrap.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active', p.id === target)); }); });
    });
  }
  document.addEventListener('DOMContentLoaded', () => { mountShell(); initReveal(); initCounters(); initTabs(); });
  return { getLang, getTheme, hrefFor, applyLangToPage, R, HOME, IN_PAGES };
})();