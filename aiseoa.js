/* ═══════════════════ aiseoa.js — v2 ═══════════════════ */

let currentLang = localStorage.getItem('aiseoa_lang') || 'en';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('aiseoa_lang', lang);
  document.documentElement.setAttribute('lang', lang);
  document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  // Toggle active state on both desktop + mobile lang toggles
  document.querySelectorAll('.lang-toggle').forEach(toggle => {
    toggle.querySelectorAll('.lang-opt').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });
  });

  // Swap all elements that carry data-en / data-ar
  document.querySelectorAll('[data-en]').forEach(el => {
    const text = lang === 'ar' ? el.dataset.ar : el.dataset.en;
    if (text !== undefined) el.textContent = text;
  });
  document.querySelectorAll('[data-en-html]').forEach(el => {
    const html = lang === 'ar' ? el.dataset.arHtml : el.dataset.enHtml;
    if (html !== undefined) el.innerHTML = html;
  });
  document.querySelectorAll('[data-en-placeholder]').forEach(el => {
    const ph = lang === 'ar' ? el.dataset.arPlaceholder : el.dataset.enPlaceholder;
    if (ph !== undefined) el.placeholder = ph;
  });

  if (typeof renderHours === 'function') renderHours('hours-grid');
  if (typeof renderOpenStatus === 'function') renderOpenStatus();
}

function toggleMenu() {
  const m = document.getElementById('mobile-menu');
  if (m) m.classList.toggle('open');
}

/* ── ACTIVE NAV LINK ── */
function setActiveNav() {
  const page = (window.location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.main-nav a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ── FADE IN ON SCROLL ── */
function initFadeIn() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    const skillObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.skill-fill').forEach(bar => { bar.style.width = bar.dataset.width + '%'; });
        }
      });
    }, { threshold: 0.3 });
    skillObs.observe(skillsSection);
  }
}

/* ── COUNT UP ── */
function countUp(id, target, duration = 1400) {
  const el = document.getElementById(id);
  if (!el) return;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.round(current);
    if (current >= target) clearInterval(timer);
  }, 16);
}

/* ── WORKING HOURS ── */
const HOURS = {
  0: null,
  1: ['09:00', '18:00'],
  2: ['09:00', '18:00'],
  3: ['09:00', '18:00'],
  4: ['09:00', '18:00'],
  5: ['09:00', '15:00'],
  6: null,
};
const DAY_NAMES_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAY_NAMES_AR = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

function isOpenNow() {
  const now = new Date();
  const h = HOURS[now.getDay()];
  if (!h) return false;
  const [sh, sm] = h[0].split(':').map(Number);
  const [eh, em] = h[1].split(':').map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= sh * 60 + sm && mins < eh * 60 + em;
}

function renderHours(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const today = new Date().getDay();
  const order = [1,2,3,4,5,6,0];
  const names = currentLang === 'ar' ? DAY_NAMES_AR : DAY_NAMES_EN;
  const closedLabel = currentLang === 'ar' ? 'مغلق' : 'Closed';
  let html = '';
  order.forEach(d => {
    const h = HOURS[d];
    html += `<div class="hour-row${d===today?' today':''}">
      <span class="day">${names[d]}</span>
      <span class="time">${h ? h[0]+' – '+h[1] : closedLabel}</span>
    </div>`;
  });
  el.innerHTML = html;
}

function renderOpenStatus() {
  const el = document.getElementById('open-status');
  if (!el) return;
  const openText = currentLang === 'ar' ? 'متاح الآن' : 'Open Now';
  const closedText = currentLang === 'ar' ? 'مغلق حالياً' : 'Currently Closed';
  el.innerHTML = isOpenNow()
    ? `<span class="open-badge"><span style="width:6px;height:6px;background:#2EE6A6;border-radius:50%;display:inline-block"></span> ${openText}</span>`
    : `<span class="closed-badge">${closedText}</span>`;
}

/* ── TYPED HERO TEXT ── */
function initHero() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  const wordsEn = ['Organic Traffic', 'Your Revenue', 'Brand Authority', 'Global Reach'];
  const wordsAr = ['الترافيك', 'إيراداتك', 'مكانتك الرقمية', 'السوق العالمي'];
  let wi = 0, ci = 0, deleting = false;
  function type() {
    const words = currentLang === 'ar' ? wordsAr : wordsEn;
    const word = words[wi % words.length];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(type, 1800); return; }
      setTimeout(type, 70);
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi++; setTimeout(type, 300); return; }
      setTimeout(type, 38);
    }
  }
  setTimeout(type, 800);
}

/* ── BOOKING SYSTEM ── */
let selectedService = { name: 'Free SEO Audit', price: 0 };

function selectService(el) {
  document.querySelectorAll('.service-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  selectedService.name = el.dataset.service;
  selectedService.price = parseInt(el.dataset.price);
  const label = document.getElementById('preview-label');
  const price = document.getElementById('preview-price');
  const note = document.getElementById('preview-note');
  if (label) label.textContent = el.dataset.service;
  if (price) price.textContent = selectedService.price === 0 ? (currentLang==='ar'?'مجاني':'Free') : 'From $' + selectedService.price;
  if (note) note.textContent = selectedService.price === 0
    ? (currentLang==='ar' ? '✓ بدون أي التزام — سنراجع موقعك أولاً' : "✓ No commitment — we'll review your website first")
    : (currentLang==='ar' ? '✓ السعر النهائي بعد مراجعة الموقع' : '✓ Final price discussed after website review');
}

function submitBooking() {
  const name = document.getElementById('b-name').value.trim();
  const email = document.getElementById('b-email').value.trim();
  const website = document.getElementById('b-website').value.trim();
  const country = document.getElementById('b-country').value.trim();
  const budget = document.getElementById('b-budget').value;
  const msg = document.getElementById('b-msg').value.trim();

  if (!name || !email || !website) {
    alert(currentLang==='ar' ? 'من فضلك أدخل الاسم والإيميل ورابط الموقع.' : 'Please fill in Name, Email & Website URL.');
    return;
  }

  // ⚠️ STEP 1: Replace YOUR_FORM_ID below with your real Formspree form ID
  // Get it from https://formspree.io after creating a free form.
  // Example: 'https://formspree.io/f/abcdwxyz'
  const FORMSPREE_URL = 'https://formspree.io/f/mlgkydbg';

  const submitBtn = document.querySelector('.submit-btn');
  const originalText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = currentLang==='ar' ? 'جاري الإرسال...' : 'Sending...'; }

  fetch(FORMSPREE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      name, email, website, country, budget,
      service: selectedService.name,
      message: msg
    })
  })
  .then(res => {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
    if (res.ok) {
      document.getElementById('confirm-msg').style.display = 'block';
      ['b-name','b-email','b-website','b-country','b-msg'].forEach(id => {
        const f = document.getElementById(id);
        if (f) f.value = '';
      });
    } else {
      alert(currentLang==='ar' ? 'حدث خطأ، حاول مرة أخرى.' : 'Something went wrong. Please try again.');
    }
  })
  .catch(() => {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
    alert(currentLang==='ar' ? 'تعذر الإرسال. تأكد من رابط Formspree في aiseoa.js' : 'Could not send. Make sure the Formspree URL is set in aiseoa.js');
  });
}

function subscribe() {
  const emailEl = document.getElementById('sub-email');
  if (!emailEl) return;
  const email = emailEl.value.trim();
  if (!email || !email.includes('@')) {
    alert(currentLang==='ar' ? 'من فضلك أدخل إيميل صحيح.' : 'Please enter a valid email.');
    return;
  }
  document.getElementById('sub-success').style.display = 'block';
  emailEl.value = '';
}

/* ── CASE STUDY MODAL + FILTERS (portfolio page) ── */
function filterCases(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.case-card').forEach(card => {
    card.style.display = (cat === 'all' || card.dataset.cat === cat) ? 'block' : 'none';
  });
}

function openModal(html) {
  const overlay = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  if (!overlay || !content) return;
  content.innerHTML = html;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(e) {
  const overlay = document.getElementById('modal');
  if (!overlay) return;
  if (!e || e.target === overlay || e.target.classList.contains('modal-close')) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  setLang(currentLang);
  setActiveNav();
  initFadeIn();
  initHero();
  renderHours('hours-grid');
  renderOpenStatus();
  setTimeout(() => {
    countUp('c1', 47, 1200);
    countUp('c2', 280, 1500);
    countUp('c3', 1, 800);
    countUp('c4', 850, 1400);
  }, 400);
});
