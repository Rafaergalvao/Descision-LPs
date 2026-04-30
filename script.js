/* =========================
   HEADER SCROLL
========================= */
(function () {
  const header = document.getElementById('header');
  if (!header) return;

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 30);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load in case page is pre-scrolled
})();

/* =========================
   HAMBURGER MENU
========================= */
(function () {
  const hamb = document.getElementById('hamb');
  const menu = document.getElementById('menu');
  if (!hamb || !menu) return;

  function toggleMenu() {
    const isOpen = menu.classList.toggle('active');
    hamb.classList.toggle('active', isOpen);
    hamb.setAttribute('aria-expanded', isOpen);
  }

  hamb.addEventListener('click', toggleMenu);

  // Keyboard accessible
  hamb.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });

  // Close on nav link click
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      menu.classList.remove('active');
      hamb.classList.remove('active');
      hamb.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!header.contains(e.target)) {
      menu.classList.remove('active');
      hamb.classList.remove('active');
    }
  });
})();

/* =========================
   REVEAL ON SCROLL
========================= */
(function () {
  const io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    io.observe(el);
  });
})();

/* =========================
   HERO PARALLAX
========================= */
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Only on non-touch (desktop)
  const isTouchDevice = window.matchMedia('(hover: none)').matches;
  if (isTouchDevice) return;

  window.addEventListener('scroll', function () {
    hero.style.backgroundPositionY = (window.scrollY * 0.3) + 'px';
  }, { passive: true });
})();

/* =========================
   NETWORK CANVAS
========================= */
(function () {
  const canvas = document.getElementById('networkCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h, nodes;

  function resize() {
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    nodes = Array.from({ length: 18 }, function () {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6
      };
    });
  }

  window.addEventListener('resize', resize);
  resize();

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Draw edges between close nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.strokeStyle = 'rgba(0,217,255,' + (1 - dist / 110) * 0.55 + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw connections to left/right items
    const center = { x: w / 2, y: h / 2 };
    const canvasRect = canvas.getBoundingClientRect();

    document.querySelectorAll('.flow-col.left .flow-item').forEach(function (el) {
      const r = el.getBoundingClientRect();
      const x = r.right - canvasRect.left;
      const y = r.top + r.height / 2 - canvasRect.top;

      ctx.strokeStyle = 'rgba(0,217,255,.28)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(center.x - 30, center.y);
      ctx.stroke();
    });

    document.querySelectorAll('.flow-col.right .flow-item').forEach(function (el) {
      const r = el.getBoundingClientRect();
      const x = r.left - canvasRect.left;
      const y = r.top + r.height / 2 - canvasRect.top;

      ctx.strokeStyle = 'rgba(255,100,100,.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(center.x + 30, center.y);
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(function (n) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#00d9ff';
      ctx.fill();

      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    });

    requestAnimationFrame(draw);
  }

  draw();
})();

/* =========================
   MOBILE STATS CAROUSEL (duplicate for loop)
========================= */
(function () {
  function initCarousel() {
    const grid = document.querySelector('.stats-grid');
    if (!grid) return;

    if (window.innerWidth <= 768 && !grid.dataset.duplicated) {
      grid.innerHTML += grid.innerHTML;
      grid.dataset.duplicated = '1';
    }
  }

  initCarousel();
  window.addEventListener('resize', initCarousel);
})();

/* =========================
   CONTACT FORM UX
========================= */
(function () {
  const form = document.getElementById('contactForm');
  const btn = document.getElementById('submitBtn');
  if (!form || !btn) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Basic validation feedback
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let valid = true;

    inputs.forEach(function (input) {
      if (!input.value.trim()) {
        valid = false;
        input.style.borderColor = 'rgba(255,80,80,.6)';
        setTimeout(function () {
          input.style.borderColor = '';
        }, 2000);
      }
    });

    if (!valid) return;

    btn.classList.add('loading');

    setTimeout(function () {
      btn.classList.remove('loading');
      btn.querySelector('span').textContent = 'Mensagem enviada ✓';
      btn.style.borderColor = '#00d9ff';
      btn.style.color = '#00d9ff';

      setTimeout(function () {
        btn.querySelector('span').setAttribute('data-i18n', 'contact.cta');
        btn.querySelector('span').textContent = 'Enviar mensagem';
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 4000);
    }, 1600);
  });
})();

/* =========================
   I18N
========================= */
const translations = {

  pt: {
    'nav.home': 'Home',
    'nav.platform': 'Plataforma',
    'nav.problem': 'Problema',
    'nav.architecture': 'Arquitetura',
    'nav.contact': 'Contato',

    'hero.label': 'Construída para a era da IA',
    'hero.title': 'DecisionAI OS',
    'hero.subtitle': 'Infraestrutura de inteligência de decisão para o sistema financeiro global.',
    'hero.desc': 'Fraude, AML, identidade e risco integrados em uma única camada com respostas em tempo real.',
    'hero.cta': 'Saiba Mais',

    'stats.realtime': 'Decisões em tempo real',
    'stats.processed': 'Sinais processados',
    'stats.processed_val': 'Milhares',
    'stats.global': 'Instituições financeiras',
    'stats.global_val': 'Globais',
    'stats.ai': 'Inteligência',
    'stats.ai_val': 'Potencializada por IA',

    'problem.label': 'O PROBLEMA ESTRUTURAL',
    'problem.title': 'Sistemas fragmentados. Vulnerabilidades críticas.',
    'problem.desc': 'Instituições financeiras operam múltiplos sistemas isolados que não compartilham contexto entre fraude, AML, identidade e risco.',

    'flow.rules': 'Motores de Regras',
    'flow.aml': 'Plataformas AML',
    'flow.credit': 'Bureaus de Crédito',
    'flow.identity': 'Ferramentas de Identidade',
    'flow.false': 'Altos índices de falsos positivos',
    'flow.ineff': 'Ineficiências operacionais',
    'flow.risk': 'Lacunas de segurança exploradas',
    'flow.footer': 'Sem camada unificada de inteligência de decisão',

    'paradigm.title': 'UM NOVO PARADIGMA',
    'paradigm.heading': 'De decisões fragmentadas para inteligência unificada.',
    'paradigm.desc': 'A DecisionAI OS introduz uma nova camada unificada de inteligência de decisão que analisa milhares de sinais simultaneamente em tempo real.',
    'paradigm.cta': 'Fale com a gente',

    'cap.label': 'CAPACIDADES DA PLATAFORMA',
    'cap.title': 'Capacidades integradas. Inteligência que se reforça continuamente.',
    'cap.context': 'Inteligência Contextual',
    'cap.context_desc': 'Analisa múltiplos sinais simultaneamente para aumentar a precisão das decisões.',
    'cap.device': 'Inteligência Nativa de Dispositivos',
    'cap.device_desc': 'Coleta digitais e sinais comportamentais diretamente dos ambientes digitais.',
    'cap.fraud': 'Fraude e AML',
    'cap.fraud_desc': 'Módulos avançados para detectar crimes financeiros e atividades coordenadas.',
    'cap.ai': 'IA Investigativa',
    'cap.ai_desc': 'Explora automaticamente relacionamentos ocultos e descobre redes de fraude.',
    'cap.market': 'Marketplace de Inteligência',
    'cap.market_desc': 'Conecta bureaus, provedores de identidade e fontes de dados em um ecossistema aberto.',

    'contact.label': 'CONTATO',
    'contact.title': 'Fale com nossa equipe',
    'contact.desc': 'Descubra como a DecisionAI OS pode transformar suas operações com inteligência em tempo real.',
    'contact.name': 'Nome',
    'contact.email': 'Email',
    'contact.company': 'Empresa',
    'contact.phone': 'Telefone',
    'contact.message': 'Mensagem',
    'contact.cta': 'Enviar mensagem',

    'footer.social': 'Nos siga também nas redes sociais',
    'footer.copy': '© 2026 DecisionAI OS'
  },

  en: {
    'nav.home': 'Home',
    'nav.platform': 'Platform',
    'nav.problem': 'Problem',
    'nav.architecture': 'Architecture',
    'nav.contact': 'Contact',

    'hero.label': 'Built for the AI era',
    'hero.title': 'DecisionAI OS',
    'hero.subtitle': 'Decision intelligence infrastructure for the global financial system.',
    'hero.desc': 'Fraud, AML, identity and risk integrated into a single layer with real-time responses.',
    'hero.cta': 'Learn More',

    'stats.realtime': 'Real-time decisions',
    'stats.processed': 'Signals processed',
    'stats.processed_val': 'Thousands',
    'stats.global': 'Financial institutions',
    'stats.global_val': 'Global',
    'stats.ai': 'Intelligence',
    'stats.ai_val': 'AI Powered',

    'problem.label': 'THE STRUCTURAL PROBLEM',
    'problem.title': 'Fragmented systems. Critical vulnerabilities.',
    'problem.desc': 'Financial institutions operate multiple isolated systems that do not share context across fraud, AML, identity and risk.',

    'flow.rules': 'Rule Engines',
    'flow.aml': 'AML Platforms',
    'flow.credit': 'Credit Bureaus',
    'flow.identity': 'Identity Tools',
    'flow.false': 'High false positive rates',
    'flow.ineff': 'Operational inefficiencies',
    'flow.risk': 'Exploited security gaps',
    'flow.footer': 'No unified decision intelligence layer',

    'paradigm.title': 'A NEW PARADIGM',
    'paradigm.heading': 'From fragmented decisions to unified intelligence.',
    'paradigm.desc': 'DecisionAI OS introduces a new unified decision intelligence layer that analyzes thousands of signals simultaneously in real time.',
    'paradigm.cta': 'Talk to us',

    'cap.label': 'PLATFORM CAPABILITIES',
    'cap.title': 'Integrated capabilities. Intelligence that continuously reinforces itself.',
    'cap.context': 'Contextual Intelligence',
    'cap.context_desc': 'Analyzes multiple signals simultaneously to increase decision accuracy.',
    'cap.device': 'Device-native Intelligence',
    'cap.device_desc': 'Collects device fingerprints and behavioral signals directly from digital environments.',
    'cap.fraud': 'Fraud & AML',
    'cap.fraud_desc': 'Advanced modules to detect financial crimes and coordinated activities.',
    'cap.ai': 'Investigative AI',
    'cap.ai_desc': 'Automatically explores hidden relationships and uncovers fraud networks.',
    'cap.market': 'Intelligence Marketplace',
    'cap.market_desc': 'Connects bureaus, identity providers and data sources in an open ecosystem.',

    'contact.label': 'CONTACT',
    'contact.title': 'Talk to our team',
    'contact.desc': 'Discover how DecisionAI OS can transform your operations with real-time intelligence.',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.company': 'Company',
    'contact.phone': 'Phone',
    'contact.message': 'Message',
    'contact.cta': 'Send message',

    'footer.social': 'Follow us on social media',
    'footer.copy': '© 2026 DecisionAI OS'
  },

  es: {
    'nav.home': 'Inicio',
    'nav.platform': 'Plataforma',
    'nav.problem': 'Problema',
    'nav.architecture': 'Arquitectura',
    'nav.contact': 'Contacto',

    'hero.label': 'Construida para la era de la IA',
    'hero.title': 'DecisionAI OS',
    'hero.subtitle': 'Infraestructura de inteligencia de decisión para el sistema financiero global.',
    'hero.desc': 'Fraude, AML, identidad y riesgo integrados en una sola capa con respuestas en tiempo real.',
    'hero.cta': 'Saber Más',

    'stats.realtime': 'Decisiones en tiempo real',
    'stats.processed': 'Señales procesadas',
    'stats.processed_val': 'Miles',
    'stats.global': 'Instituciones financieras',
    'stats.global_val': 'Globales',
    'stats.ai': 'Inteligencia',
    'stats.ai_val': 'Potenciada por IA',

    'problem.label': 'EL PROBLEMA ESTRUCTURAL',
    'problem.title': 'Sistemas fragmentados. Vulnerabilidades críticas.',
    'problem.desc': 'Las instituciones financieras operan múltiples sistemas aislados que no comparten contexto entre fraude, AML, identidad y riesgo.',

    'flow.rules': 'Motores de Reglas',
    'flow.aml': 'Plataformas AML',
    'flow.credit': 'Burós de Crédito',
    'flow.identity': 'Herramientas de Identidad',
    'flow.false': 'Altos índices de falsos positivos',
    'flow.ineff': 'Ineficiencias operativas',
    'flow.risk': 'Brechas de seguridad explotadas',
    'flow.footer': 'Sin capa unificada de inteligencia de decisión',

    'paradigm.title': 'UN NUEVO PARADIGMA',
    'paradigm.heading': 'De decisiones fragmentadas a inteligencia unificada.',
    'paradigm.desc': 'DecisionAI OS introduce una nueva capa unificada de inteligencia de decisión que analiza miles de señales simultáneamente en tiempo real.',
    'paradigm.cta': 'Habla con nosotros',

    'cap.label': 'CAPACIDADES DE LA PLATAFORMA',
    'cap.title': 'Capacidades integradas. Inteligencia que se refuerza continuamente.',
    'cap.context': 'Inteligencia Contextual',
    'cap.context_desc': 'Analiza múltiples señales simultáneamente para aumentar la precisión de las decisiones.',
    'cap.device': 'Inteligencia Nativa de Dispositivos',
    'cap.device_desc': 'Recopila huellas digitales y señales de comportamiento directamente de los entornos digitales.',
    'cap.fraud': 'Fraude y AML',
    'cap.fraud_desc': 'Módulos avanzados para detectar delitos financieros y actividades coordinadas.',
    'cap.ai': 'IA Investigativa',
    'cap.ai_desc': 'Explora automáticamente relaciones ocultas y descubre redes de fraude.',
    'cap.market': 'Marketplace de Inteligencia',
    'cap.market_desc': 'Conecta burós, proveedores de identidad y fuentes de datos en un ecosistema abierto.',

    'contact.label': 'CONTACTO',
    'contact.title': 'Habla con nuestro equipo',
    'contact.desc': 'Descubre cómo DecisionAI OS puede transformar tus operaciones con inteligencia en tiempo real.',
    'contact.name': 'Nombre',
    'contact.email': 'Email',
    'contact.company': 'Empresa',
    'contact.phone': 'Teléfono',
    'contact.message': 'Mensaje',
    'contact.cta': 'Enviar mensaje',

    'footer.social': 'Síguenos en redes sociales',
    'footer.copy': '© 2026 DecisionAI OS'
  }

};

/* =========================
   APPLY / SWITCH LANGUAGE
========================= */
(function () {
  const langSelect = document.getElementById('langSelect');
  if (!langSelect) return;

  function applyTranslations(lang) {
    const t = translations[lang] || translations['pt'];
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        // For inputs / placeholders keep label separate
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });
  }

  function setLanguage(lang) {
    localStorage.setItem('lang', lang);
    langSelect.value = lang;
    applyTranslations(lang);
  }

  const saved = localStorage.getItem('lang') || 'pt';
  setLanguage(saved);

  langSelect.addEventListener('change', function (e) {
    setLanguage(e.target.value);
  });
})();
