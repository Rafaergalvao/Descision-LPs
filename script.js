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
   CONTACT FORM — FORMSPREE
========================= */
(function () {
  const form = document.getElementById('contactForm');
  const btn = document.getElementById('submitBtn');
  const result = document.getElementById('formResult');
  if (!form || !btn || !result) return;

  // ── Validation rules ─────────────────────────────────────────
  const rules = [
    {
      id: 'fieldName',
      errId: 'err-name',
      groupId: 'group-name',
      validate: function (v) { return v.trim().length >= 2; },
      messages: { pt: 'Informe seu nome completo.', en: 'Please enter your full name.', es: 'Ingrese su nombre completo.' }
    },
    {
      id: 'fieldEmail',
      errId: 'err-email',
      groupId: 'group-email',
      validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
      messages: { pt: 'Informe um email válido.', en: 'Please enter a valid email.', es: 'Ingrese un email válido.' }
    },
    {
      id: 'fieldCompany',
      errId: 'err-company',
      groupId: 'group-company',
      validate: function (v) { return v.trim().length >= 2; },
      messages: { pt: 'Informe o nome da empresa.', en: 'Please enter your company name.', es: 'Ingrese el nombre de su empresa.' }
    },
    {
      id: 'fieldMessage',
      errId: 'err-message',
      groupId: 'group-message',
      validate: function (v) { return v.trim().length >= 10; },
      messages: { pt: 'Escreva uma mensagem com pelo menos 10 caracteres.', en: 'Write a message with at least 10 characters.', es: 'Escriba un mensaje con al menos 10 caracteres.' }
    }
  ];

  // ── Clear field error ─────────────────────────────────────────
  function clearError(rule) {
    var group = document.getElementById(rule.groupId);
    var errEl = document.getElementById(rule.errId);
    if (group) group.classList.remove('has-error');
    if (errEl) errEl.textContent = '';
  }

  // ── Show field error ──────────────────────────────────────────
  function showError(rule, lang) {
    var group = document.getElementById(rule.groupId);
    var errEl = document.getElementById(rule.errId);
    var input = document.getElementById(rule.id);
    if (group) group.classList.add('has-error');
    if (errEl) errEl.textContent = rule.messages[lang] || rule.messages['pt'];
    if (input) input.focus();
  }

  // ── Validate all fields ───────────────────────────────────────
  function validateAll(lang) {
    var valid = true;
    rules.forEach(function (rule) {
      clearError(rule);
      var input = document.getElementById(rule.id);
      if (!input) return;
      if (!rule.validate(input.value)) {
        if (valid) showError(rule, lang); // focus first error only
        else {
          var group = document.getElementById(rule.groupId);
          var errEl = document.getElementById(rule.errId);
          if (group) group.classList.add('has-error');
          if (errEl) errEl.textContent = rule.messages[lang] || rule.messages['pt'];
        }
        valid = false;
      }
    });
    return valid;
  }

  // ── Live clear on input ───────────────────────────────────────
  rules.forEach(function (rule) {
    var input = document.getElementById(rule.id);
    if (!input) return;
    input.addEventListener('input', function () { clearError(rule); });
  });

  // ── Result banner helpers ─────────────────────────────────────
  var SUCCESS_ICON = '<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
  var ERROR_ICON = '<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>';

  var RESULT_MSGS = {
    success: {
      pt: 'Mensagem enviada com sucesso! Nossa equipe entrará em contato em breve.',
      en: 'Message sent successfully! Our team will get back to you shortly.',
      es: '¡Mensaje enviado con éxito! Nuestro equipo se pondrá en contacto pronto.'
    },
    error: {
      pt: 'Ops, algo deu errado. Tente novamente ou nos contate diretamente por email.',
      en: 'Something went wrong. Please try again or contact us directly by email.',
      es: 'Algo salió mal. Inténtelo de nuevo o contáctenos directamente por correo.'
    }
  };

  function showResult(type, lang) {
    result.className = 'form-result ' + type;
    var icon = type === 'success' ? SUCCESS_ICON : ERROR_ICON;
    result.innerHTML = icon + '<span>' + (RESULT_MSGS[type][lang] || RESULT_MSGS[type]['pt']) + '</span>';
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideResult() {
    result.className = 'form-result';
    result.innerHTML = '';
  }

  // ── Set button state ──────────────────────────────────────────
  function setLoading(on) {
    btn.disabled = on;
    btn.classList.toggle('loading', on);
  }

  // ── Submit ────────────────────────────────────────────────────
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    hideResult();

    var lang = document.documentElement.lang || 'pt';
    if (!validateAll(lang)) return;

    setLoading(true);

    var data = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    })
      .then(function (response) {
        setLoading(false);
        if (response.ok) {
          showResult('success', lang);
          form.reset();
        } else {
          showResult('error', lang);
        }
      })
      .catch(function () {
        setLoading(false);
        showResult('error', lang);
      });
  });
})();

/* =========================
   I18N
========================= */
const translations = {
  pt: {
    'nav.home': 'Home',
    'nav.platform': 'Plataforma',
    'nav.capabilities': 'Capacidades',
    'nav.architecture': 'Arquitetura',
    'nav.vision': 'Visão',
    'nav.company': 'Empresa',
    'nav.demo': 'Solicitar demonstração →',

    'hero.label': 'Construída para a era da IA',
    'hero.title': 'Decision<span style="color: #0c7bf4">AI</span> <span style="color: #06effe">OS</span>',
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

    /* PLATAFORMA */
    'plat.hero_title': 'Orquestre decisões financeiras em tempo real.',
    'plat.hero_desc': 'A Decision<span style="color: #0c7bf4">AI</span> <span style="color: #06effe">OS</span> é a infraestrutura central de decisão que combina dados, APIs e modelos de IA para transformar sinais em decisões inteligentes em menos de 100 milissegundos.',
    'plat.offer_label': 'O QUE A PLATAFORMA OFERECE',
    'plat.offer_1_title': 'Orquestrador Visual No-Code',
    'plat.offer_1_desc': 'Crie fluxos de decisão complexos de forma visual, sem código, com total agilidade.',
    'plat.offer_2_title': 'Integração de APIs, Dados e Modelos',
    'plat.offer_2_desc': 'Conecte qualquer fonte de dados, API ou modelo de IA ao fluxo de decisão de forma segura.',
    'plat.offer_3_title': 'Simulação e Backtesting',
    'plat.offer_3_desc': 'Teste decisões com dados históricos, antecipando resultados e reduzindo riscos.',
    'plat.offer_4_title': 'Governança e Auditoria',
    'plat.offer_4_desc': 'Versione, audite e garanta conformidade em cada alteração realizada na plataforma.',
    'plat.offer_5_title': 'Execução em Tempo Real',
    'plat.offer_5_desc': 'Motor de decisão ultrarrápido com latência inferior a 100 milissegundos.',
    'plat.offer_6_title': 'Conectores Nativos',
    'plat.offer_6_desc': 'Integrações prontas com bureaus, provedores de identidade, pagamentos e ecossistema financeiro.',
    'plat.how_label': 'COMO FUNCIONA',
    'plat.how_1_title': 'Conecte',
    'plat.how_1_desc': 'Conecte fontes de dados, APIs e modelos ao orquestrador visual.',
    'plat.how_2_title': 'Modele',
    'plat.how_2_desc': 'Monte regras, políticas e estratégias de decisão com componentes reutilizáveis.',
    'plat.how_3_title': 'Simule',
    'plat.how_3_desc': 'Execute simulações e valide resultados com dados históricos antes de publicar.',
    'plat.how_4_title': 'Execute',
    'plat.how_4_desc': 'Coloque em produção e tome decisões em tempo real com máxima performance.',
    'plat.ben_label': 'BENEFÍCIOS PARA SUA INSTITUIÇÃO',
    'plat.ben_1': 'Redução de fraudes e perdas financeiras',
    'plat.ben_2': 'Menos falsos positivos e retrabalho',
    'plat.ben_3': 'Agilidade para criar e ajustar estratégias',
    'plat.ben_4': 'Visão unificada de risco e comportamento',
    'plat.ben_5': 'Conformidade, rastreabilidade e controle total',
    'plat.ben_6': 'Escalabilidade para milhões de decisões por segundo',

    /* CAPACIDADES */
    'cap_p.hero_title': 'Módulos inteligentes que trabalham juntos e evoluem com sua instituição.',
    'cap_p.hero_desc': 'A Decision<span style="color: #0c7bf4">AI</span> <span style="color: #06effe">OS</span> integra capacidades avançadas que analisam milhares de sinais em tempo real, combinando dados, modelos e inteligência contextual para entregar decisões mais precisas, seguras e escaláveis.',
    'cap_p.main_label': 'NOSSAS CAPACIDADES PRINCIPAIS',
    'cap_p.main_title': 'Módulos especializados que se complementam para entregar inteligência de decisão de ponta a ponta.',
    'cap_p.m1_title': 'Fraude e AML',
    'cap_p.m1_desc': 'Módulos avançados para detectar, prevenir e responder a atividades fraudulentas e de lavagem de dinheiro em tempo real.',
    'cap_p.m1_l1': 'Detecção de fraude transacional',
    'cap_p.m1_l2': 'Compliance AML completo',
    'cap_p.m1_l3': 'Monitoramento contínuo',
    'cap_p.m1_l4': 'Triagem e alertas inteligentes',
    'cap_p.m2_title': 'Detecção de Money Mule',
    'cap_p.m2_desc': 'Identifica e interrompe redes de mulas financeiras e esquemas de movimentação ilícita com análise comportamental e de rede.',
    'cap_p.m2_l1': 'Identificação de padrões de rede',
    'cap_p.m2_l2': 'Análise de fluxo e movimentações',
    'cap_p.m2_l3': 'Relacionamento entre contas e dispositivos',
    'cap_p.m2_l4': 'Pontuação de risco dinâmica',
    'cap_p.m3_title': 'IA Investigativa',
    'cap_p.m3_desc': 'Explora relações ocultas e descobre redes de fraude complexas com IA e grafos de inteligência.',
    'cap_p.m3_l1': 'Descoberta de redes e clusters',
    'cap_p.m3_l2': 'Correlação de entidades e eventos',
    'cap_p.m3_l3': 'Anomalias e comportamentos atípicos',
    'cap_p.m3_l4': 'Apoio completo à investigação',
    'cap_p.m4_title': 'Inteligência Contextual',
    'cap_p.m4_desc': 'Analisa múltiplos sinais simultaneamente para entender o contexto real por trás de cada interação ou transação.',
    'cap_p.m4_l1': 'Comportamento do usuário',
    'cap_p.m4_l2': 'Inteligência de dispositivo e sessão',
    'cap_p.m4_l3': 'Dados transacionais e biométricos',
    'cap_p.m4_l4': 'Score de confiança contextual',
    'cap_p.m5_title': 'Marketplace de Inteligência',
    'cap_p.m5_desc': 'Conecta sua instituição a um ecossistema aberto de dados, provedores e serviços de inteligência.',
    'cap_p.m5_l1': 'Bureaus e fontes de dados alternativas',
    'cap_p.m5_l2': 'Provedores de identidade e biometria',
    'cap_p.m5_l3': 'Modelos e algoritmos do ecossistema',
    'cap_p.m5_l4': 'APIs e integrações plug-and-play',

    /* ARQUITETURA */
    'arq.hero_title': 'Como a Decision<span style="color: #0c7bf4">AI</span> <span style="color: #06effe">OS</span> executa decisões inteligentes em tempo real.',
    'arq.hero_desc': 'Nossa arquitetura foi projetada para processar milhares de sinais, orquestrar regras e modelos de IA e entregar a decisão ideal em menos de 100ms, com máxima escalabilidade e segurança.',
    'arq.layer_label': 'CAMADA POR CAMADA',
    'arq.layer_title': 'Uma estrutura modular para máxima flexibilidade e performance.',
    'arq.l1_title': 'FONTES DE SINAIS E DADOS',
    'arq.l1_desc': 'Coleta sinais de múltiplas fontes em tempo real: dispositivos, navegadores, transações, bureaus, parceiros e dados internos.',
    'arq.l2_title': 'ORQUESTRADOR DE DECISÕES (NO-CODE)',
    'arq.l2_desc': 'Permite criar, testar e versionar fluxos de decisão complexos com regras, políticas e modelos de IA de forma visual.',
    'arq.l3_title': 'MOTOR DE DECISÃO EM TEMPO REAL',
    'arq.l3_desc': 'Executa milhões de combinações de sinais, regras e modelos em milissegundos para identificar o melhor resultado.',
    'arq.l4_title': 'AÇÕES / RESULTADOS',
    'arq.l4_desc': 'Decisões acionáveis entregues aos sistemas de origem para bloquear, revisar ou aprovar automaticamente.',
    'arq.l5_title': 'MÓDULOS DE PLATAFORMA',
    'arq.l5_desc': 'Camadas de suporte que garantem monitoramento, governança, auditoria, analytics e melhoria contínua da decisão.',
    'arq.stat_1': 'Decisões em tempo real com mínima latência',
    'arq.stat_2': 'Projetada para volumes globais de transações',
    'arq.stat_3': 'Arquitetura moderna, modular e flexível',
    'arq.iso_1': 'FONTES DE SINAIS E DADOS',
    'arq.iso_2': 'ORQUESTRADOR DE DECISÕES',
    'arq.iso_3': 'MOTOR DE DECISÃO EM TEMPO REAL',
    'arq.iso_4': 'AÇÕES / RESULTADOS',
    'arq.iso_5': 'MÓDULOS DE PLATAFORMA',

    /* VISÃO */
    'vis.hero_title': 'Construindo a Decision Intelligence Network.',
    'vis.hero_desc': 'Nossa visão é criar a maior rede colaborativa de inteligência de decisão do sistema financeiro, conectando instituições para combater o crime financeiro de forma conjunta e cada vez mais eficaz.',
    'vis.pillar_label': 'NOSSOS PILARES DE VISÃO',
    'vis.p1_title': 'Efeito de Rede',
    'vis.p1_desc': 'Cada nova instituição fortalece a rede e aumenta a precisão para todos.',
    'vis.p1_l1': 'Mais dados compartilhados',
    'vis.p1_l2': 'Modelos mais inteligentes',
    'vis.p1_l3': 'Detecção mais precisa',
    'vis.p1_l4': 'Respostas mais rápidas',
    'vis.p2_title': 'Inteligência Compartilhada',
    'vis.p2_desc': 'Sinais, padrões e indicadores são compartilhados de forma segura e anonimizada.',
    'vis.p2_l1': 'Compartilhamento seguro de indicadores',
    'vis.p2_l2': 'Colaboração entre instituições',
    'vis.p2_l3': 'Aprendizado contínuo da rede',
    'vis.p2_l4': 'Aumento da eficiência coletiva',
    'vis.p3_title': 'Mais Segurança para Todos',
    'vis.p3_desc': 'Fraudaores não respeitam fronteiras. Nossa inteligência também não.',
    'vis.p3_l1': 'Visão global dos riscos emergentes',
    'vis.p3_l2': 'Antecipação de ameaças',
    'vis.p3_l3': 'Proteção colaborativa',
    'vis.p3_l4': 'Ecossistema financeiro mais seguro',
    'vis.future_label': 'O FUTURO QUE CONSTRUÍMOS',
    'vis.f1_title': 'Rede Global de Inteligência',
    'vis.f1_desc': 'Conectamos instituições em uma rede global para fortalecer a prevenção de riscos.',
    'vis.f2_title': 'IA Cada Vez Mais Inteligente',
    'vis.f2_desc': 'Modelos que aprendem continuamente com milhões de decisões e interações reais.',
    'vis.f3_title': 'Confiança e Transparência',
    'vis.f3_desc': 'Governança, ética e transparência como pilares para uma inteligência confiável.',
    'vis.f4_title': 'Inovação Contínua',
    'vis.f4_desc': 'Investimos constantemente em tecnologia para antecipar o futuro do crime financeiro.',
    'vis.f5_title': 'Impacto Real',
    'vis.f5_desc': 'Decisões inteligentes que geram um mundo financeiro melhor e mais seguro.',

    /* EMPRESA */
    'emp.hero_title': 'Sobre a Decision<span style="color: #0c7bf4">AI</span> <span style="color: #06effe">OS</span>.',
    'emp.hero_desc': 'A infraestrutura de inteligência de decisão para o sistema financeiro global, construída para a era da IA. Combinamos IA avançada, orquestração no-code e inteligência contextual para entregar mais segurança, eficiência e crescimento sustentável.',
    'emp.journey_label': 'NOSSA MISSÃO',
    'emp.journey_desc': 'A DecisionAI OS nasceu da convicção de que o sistema financeiro precisa evoluir de regras isoladas para inteligência unificada.',
    'emp.t1_label': 'Início',
    'emp.t1_title': 'Identificamos o gargalo',
    'emp.t1_desc': 'Identificamos o gargalo da tomada de decisão fragmentada no sistema financeiro.',
    'emp.t2_label': 'Construção',
    'emp.t2_title': 'Camada unificada',
    'emp.t2_desc': 'Desenvolvemos a primeira camada unificada de decisão com orquestração visual e IA.',
    'emp.t3_label': 'Tração',
    'emp.t3_title': 'Validação de mercado',
    'emp.t3_desc': 'Fintechs e instituições inovadoras adotam a plataforma e comprovam resultados.',
    'emp.t4_label': 'Expansão',
    'emp.t4_title': 'Escala global',
    'emp.t4_desc': 'Escalamos globalmente para transformar a infraestrutura de decisão do sistema financeiro.',
    'emp.move_label': 'O QUE NOS MOVE',
    'emp.v1_title': 'Missão',
    'emp.v1_desc': 'Combater o crime financeiro e democratizar a inteligência de decisão de alta performance para todas as instituições.',
    'emp.v2_title': 'Visão',
    'emp.v2_desc': 'Ser a espinha dorsal de inteligência do sistema financeiro global, onde cada transação é protegida em tempo real.',
    'emp.v3_title': 'Valores',
    'emp.v3_desc': 'Segurança absoluta, inovação implacável, transparência ética e foco obsessivo no sucesso do cliente.',

    'contact.label': 'CONTATO',
    'contact.title': 'Fale com nossa equipe',
    'contact.desc': 'Descubra como a DecisionAI OS pode transformar suas operações com inteligência em tempo real.',
    'contact.name': 'Nome',
    'contact.email': 'Email',
    'contact.company': 'Empresa',
    'contact.phone': 'Telefone',
    'contact.message': 'Mensagem',
    'contact.cta': 'Enviar mensagem',

    'arq.diag_title': 'VISÃO GERAL DA ARQUITETURA',
    'arq.diag_col1_title': 'FONTES DE SINAIS E DADOS',
    'arq.diag_col1_1': 'Sinais Mobile',
    'arq.diag_col1_2': 'Sinais do Navegador',
    'arq.diag_col1_3': 'APIs e Conectores (Bureaus, SPC, etc.)',
    'arq.diag_col1_4': 'Dados Internos',
    'arq.diag_col1_5': 'Modelos de IA e Algoritmos',
    'arq.diag_col2_title': 'ORQUESTRADOR DE DECISÕES (NO-CODE)',
    'arq.diag_col2_1': 'Fluxos de Decisão',
    'arq.diag_col2_2': 'Regras de Negócio',
    'arq.diag_col2_3': 'Modelos de IA',
    'arq.diag_col2_4': 'Políticas e Estratégias',
    'arq.diag_col2_engine_title': 'MOTOR DE DECISÃO EM TEMPO REAL',
    'arq.diag_col2_engine_sub': '< 100ms',
    'arq.diag_col3_title': 'AÇÕES / RESULTADOS',
    'arq.diag_col3_1': 'Bloquear',
    'arq.diag_col3_2': 'Revisar / MFA',
    'arq.diag_col3_3': 'Aprovar',
    'arq.diag_col4_title': 'MÓDULOS DE PLATAFORMA',
    'arq.diag_col4_1': 'Monitoramento em Tempo Real',
    'arq.diag_col4_2': 'Gestão de Casos',
    'arq.diag_col4_3': 'Auditoria e Governança',
    'arq.diag_col4_4': 'Relatórios e Analytics',

    'footer.nav_title': 'Navegação',
    'footer.social_title': 'Redes Sociais',
    'footer.copy': '© 2026 DecisionAI OS. Todos os direitos reservados.'
  },

  en: {
    'nav.home': 'Home',
    'nav.platform': 'Platform',
    'nav.capabilities': 'Capabilities',
    'nav.architecture': 'Architecture',
    'nav.vision': 'Vision',
    'nav.company': 'Company',
    'nav.demo': 'Request Demo →',

    'hero.label': 'Built for the AI era',
    'hero.title': 'Decision<span style="color: #0c7bf4">AI</span> <span style="color: #06effe">OS</span>',
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

    /* PLATAFORMA */
    'plat.hero_title': 'Orchestrate financial decisions in real time.',
    'plat.hero_desc': 'Decision<span style="color: #0c7bf4">AI</span> <span style="color: #06effe">OS</span> is the central decision infrastructure that combines data, APIs, and AI models to transform signals into intelligent decisions in less than 100 milliseconds.',
    'plat.offer_label': 'WHAT THE PLATFORM OFFERS',
    'plat.offer_1_title': 'No-Code Visual Orchestrator',
    'plat.offer_1_desc': 'Create complex decision flows visually, without code, with total agility.',
    'plat.offer_2_title': 'API, Data and Model Integration',
    'plat.offer_2_desc': 'Connect any data source, API, or AI model to the decision flow securely.',
    'plat.offer_3_title': 'Simulation and Backtesting',
    'plat.offer_3_desc': 'Test decisions with historical data, anticipating results and reducing risks.',
    'plat.offer_4_title': 'Governance and Audit',
    'plat.offer_4_desc': 'Version, audit, and ensure compliance in every change made on the platform.',
    'plat.offer_5_title': 'Real-Time Execution',
    'plat.offer_5_desc': 'Ultra-fast decision engine with latency lower than 100 milliseconds.',
    'plat.offer_6_title': 'Native Connectors',
    'plat.offer_6_desc': 'Ready integrations with bureaus, identity providers, payments, and the financial ecosystem.',
    'plat.how_label': 'HOW IT WORKS',
    'plat.how_1_title': 'Connect',
    'plat.how_1_desc': 'Connect data sources, APIs, and models to the visual orchestrator.',
    'plat.how_2_title': 'Model',
    'plat.how_2_desc': 'Build rules, policies, and decision strategies with reusable components.',
    'plat.how_3_title': 'Simulate',
    'plat.how_3_desc': 'Execute simulations and validate results with historical data before publishing.',
    'plat.how_4_title': 'Execute',
    'plat.how_4_desc': 'Deploy to production and take real-time decisions with maximum performance.',
    'plat.ben_label': 'BENEFITS FOR YOUR INSTITUTION',
    'plat.ben_1': 'Reduction of fraud and financial losses',
    'plat.ben_2': 'Fewer false positives and rework',
    'plat.ben_3': 'Agility to create and adjust strategies',
    'plat.ben_4': 'Unified view of risk and behavior',
    'plat.ben_5': 'Compliance, traceability, and total control',
    'plat.ben_6': 'Scalability for millions of decisions per second',

    /* CAPACIDADES */
    'cap_p.hero_title': 'Intelligent modules that work together and evolve with your institution.',
    'cap_p.hero_desc': 'Decision<span style="color: #0c7bf4">AI</span> <span style="color: #06effe">OS</span> integrates advanced capabilities that analyze thousands of signals in real time, combining data, models, and contextual intelligence to deliver more precise, secure, and scalable decisions.',
    'cap_p.main_label': 'OUR MAIN CAPABILITIES',
    'cap_p.main_title': 'Specialized modules that complement each other to deliver end-to-end decision intelligence.',
    'cap_p.m1_title': 'Fraud and AML',
    'cap_p.m1_desc': 'Advanced modules to detect, prevent, and respond to fraudulent activities and money laundering in real time.',
    'cap_p.m1_l1': 'Transactional fraud detection',
    'cap_p.m1_l2': 'Full AML compliance',
    'cap_p.m1_l3': 'Continuous monitoring',
    'cap_p.m1_l4': 'Intelligent screening and alerts',
    'cap_p.m2_title': 'Money Mule Detection',
    'cap_p.m2_desc': 'Identifies and disrupts money mule networks and illicit movement schemes with behavioral and network analysis.',
    'cap_p.m2_l1': 'Network pattern identification',
    'cap_p.m2_l2': 'Flow and movement analysis',
    'cap_p.m2_l3': 'Relationship between accounts and devices',
    'cap_p.m2_l4': 'Dynamic risk scoring',
    'cap_p.m3_title': 'Investigative AI',
    'cap_p.m3_desc': 'Explores hidden relationships and uncovers complex fraud networks with AI and intelligence graphs.',
    'cap_p.m3_l1': 'Discovery of networks and clusters',
    'cap_p.m3_l2': 'Correlation of entities and events',
    'cap_p.m3_l3': 'Anomalies and atypical behaviors',
    'cap_p.m3_l4': 'Full support for investigation',
    'cap_p.m4_title': 'Contextual Intelligence',
    'cap_p.m4_desc': 'Analyzes multiple signals simultaneously to understand the real context behind each interaction or transaction.',
    'cap_p.m4_l1': 'User behavior',
    'cap_p.m4_l2': 'Device and session intelligence',
    'cap_p.m4_l3': 'Transactional and biometric data',
    'cap_p.m4_l4': 'Contextual confidence score',
    'cap_p.m5_title': 'Intelligence Marketplace',
    'cap_p.m5_desc': 'Connects your institution to an open ecosystem of data, providers, and intelligence services.',
    'cap_p.m5_l1': 'Bureaus and alternative data sources',
    'cap_p.m5_l2': 'Identity and biometric providers',
    'cap_p.m5_l3': 'Ecosystem models and algorithms',
    'cap_p.m5_l4': 'Plug-and-play APIs and integrations',

    /* ARQUITETURA */
    'arq.hero_title': 'How Decision<span style="color: #0c7bf4">AI</span> <span style="color: #06effe">OS</span> executes intelligent decisions in real time.',
    'arq.hero_desc': 'Our architecture was designed to process thousands of signals, orchestrate AI rules and models, and deliver the ideal decision in less than 100ms, with maximum scalability and security.',
    'arq.layer_label': 'LAYER BY LAYER',
    'arq.layer_title': 'A modular structure for maximum flexibility and performance.',
    'arq.l1_title': 'SIGNAL AND DATA SOURCES',
    'arq.l1_desc': 'Collects signals from multiple sources in real time: devices, browsers, transactions, bureaus, partners, and internal data.',
    'arq.l2_title': 'DECISION ORCHESTRATOR (NO-CODE)',
    'arq.l2_desc': 'Allows creating, testing, and versioning complex decision flows with rules, policies, and AI models visually.',
    'arq.l3_title': 'REAL-TIME DECISION ENGINE',
    'arq.l3_desc': 'Executes millions of signal combinations, rules, and models in milliseconds to identify the best result.',
    'arq.l4_title': 'ACTIONS / RESULTS',
    'arq.l4_desc': 'Actionable decisions delivered to source systems to block, review, or approve automatically.',
    'arq.l5_title': 'PLATFORM MODULES',
    'arq.l5_desc': 'Support layers that ensure monitoring, governance, audit, analytics, and continuous improvement of the decision.',
    'arq.stat_1': 'Real-time decisions with minimum latency',
    'arq.stat_2': 'Designed for global transaction volumes',
    'arq.stat_3': 'Modern, modular and flexible architecture',
    'arq.iso_1': 'SIGNAL AND DATA SOURCES',
    'arq.iso_2': 'DECISION ORCHESTRATOR',
    'arq.iso_3': 'REAL-TIME DECISION ENGINE',
    'arq.iso_4': 'ACTIONS / RESULTS',
    'arq.iso_5': 'PLATFORM MODULES',

    /* VISÃO */
    'vis.hero_title': 'Building the Decision Intelligence Network.',
    'vis.hero_desc': 'Our vision is to create the largest collaborative decision intelligence network for the financial system, connecting institutions to combat financial crime jointly and increasingly effectively.',
    'vis.pillar_label': 'OUR VISION PILLARS',
    'vis.p1_title': 'Network Effect',
    'vis.p1_desc': 'Every new institution strengthens the network and increases accuracy for everyone.',
    'vis.p1_l1': 'More shared data',
    'vis.p1_l2': 'Smarter models',
    'vis.p1_l3': 'More precise detection',
    'vis.p1_l4': 'Faster responses',
    'vis.p2_title': 'Shared Intelligence',
    'vis.p2_desc': 'Signals, patterns, and indicators are shared securely and anonymously.',
    'vis.p2_l1': 'Secure sharing of indicators',
    'vis.p2_l2': 'Collaboration between institutions',
    'vis.p2_l3': 'Continuous learning of the network',
    'vis.p2_l4': 'Increase in collective efficiency',
    'vis.p3_title': 'More Security for Everyone',
    'vis.p3_desc': 'Fraudsters don\'t respect borders. Our intelligence doesn\'t either.',
    'vis.p3_l1': 'Global view of emerging risks',
    'vis.p3_l2': 'Anticipation of threats',
    'vis.p3_l3': 'Collaborative protection',
    'vis.p3_l4': 'Safer financial ecosystem',
    'vis.future_label': 'THE FUTURE WE BUILD',
    'vis.f1_title': 'Global Intelligence Network',
    'vis.f1_desc': 'We connect institutions in a global network to strengthen risk prevention.',
    'vis.f2_title': 'Increasingly Intelligent AI',
    'vis.f2_desc': 'Models that learn continuously from millions of real decisions and interactions.',
    'vis.f3_title': 'Trust and Transparency',
    'vis.f3_desc': 'Governance, ethics, and transparency as pillars for a reliable intelligence.',
    'vis.f4_title': 'Continuous Innovation',
    'vis.f4_desc': 'We constantly invest in technology to anticipate the future of financial crime.',
    'vis.f5_title': 'Real Impact',
    'vis.f5_desc': 'Intelligent decisions that generate a better and safer financial world.',

    /* EMPRESA */
    'emp.hero_title': 'About Decision<span style="color: #0c7bf4">AI</span> <span style="color: #06effe">OS</span>.',
    'emp.hero_desc': 'Decision intelligence infrastructure for the global financial system, built for the AI era. We combine advanced AI, no-code orchestration, and contextual intelligence to deliver more security, efficiency, and sustainable growth.',
    'emp.journey_label': 'OUR MISSION',
    'emp.journey_desc': 'DecisionAI OS was born from the conviction that the financial system needs to evolve from isolated rules to unified intelligence.',
    'emp.t1_label': 'Start',
    'emp.t1_title': 'We identified the bottleneck',
    'emp.t1_desc': 'We identified the bottleneck of fragmented decision-making in the financial system.',
    'emp.t2_label': 'Construction',
    'emp.t2_title': 'Unified layer',
    'emp.t2_desc': 'We developed the first unified decision layer with visual orchestration and AI.',
    'emp.t3_label': 'Traction',
    'emp.t3_title': 'Market validation',
    'emp.t3_desc': 'Fintechs and innovative institutions adopt the platform and prove results.',
    'emp.t4_label': 'Expansion',
    'emp.t4_title': 'Global scale',
    'emp.t4_desc': 'We scale globally to transform the decision infrastructure of the financial system.',
    'emp.move_label': 'WHAT MOVES US',
    'emp.v1_title': 'Mission',
    'emp.v1_desc': 'Combat financial crime and democratize high-performance decision intelligence for all institutions.',
    'emp.v2_title': 'Vision',
    'emp.v2_desc': 'Be the intelligence backbone of the global financial system, where every transaction is protected in real time.',
    'emp.v3_title': 'Values',
    'emp.v3_desc': 'Absolute security, relentless innovation, ethical transparency, and obsessive focus on customer success.',

    'contact.label': 'CONTACT',
    'contact.title': 'Talk to our team',
    'contact.desc': 'Discover how DecisionAI OS can transform your operations with real-time intelligence.',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.company': 'Company',
    'contact.phone': 'Phone',
    'contact.message': 'Message',
    'contact.cta': 'Send message',

    'arq.diag_title': 'ARCHITECTURE OVERVIEW',
    'arq.diag_col1_title': 'SIGNAL AND DATA SOURCES',
    'arq.diag_col1_1': 'Mobile Signals',
    'arq.diag_col1_2': 'Browser Signals',
    'arq.diag_col1_3': 'APIs and Connectors (Bureaus, etc.)',
    'arq.diag_col1_4': 'Internal Data',
    'arq.diag_col1_5': 'AI Models and Algorithms',
    'arq.diag_col2_title': 'DECISION ORCHESTRATOR (NO-CODE)',
    'arq.diag_col2_1': 'Decision Flows',
    'arq.diag_col2_2': 'Business Rules',
    'arq.diag_col2_3': 'AI Models',
    'arq.diag_col2_4': 'Policies and Strategies',
    'arq.diag_col2_engine_title': 'REAL-TIME DECISION ENGINE',
    'arq.diag_col2_engine_sub': '< 100ms',
    'arq.diag_col3_title': 'ACTIONS / RESULTS',
    'arq.diag_col3_1': 'Block',
    'arq.diag_col3_2': 'Review / MFA',
    'arq.diag_col3_3': 'Approve',
    'arq.diag_col4_title': 'PLATFORM MODULES',
    'arq.diag_col4_1': 'Real-Time Monitoring',
    'arq.diag_col4_2': 'Case Management',
    'arq.diag_col4_3': 'Audit and Governance',
    'arq.diag_col4_4': 'Reporting and Analytics',

    'footer.nav_title': 'Navigation',
    'footer.social_title': 'Social Media',
    'footer.copy': '© 2026 DecisionAI OS. All rights reserved.'
  },

  es: {
    'nav.home': 'Inicio',
    'nav.platform': 'Plataforma',
    'nav.capabilities': 'Capacidades',
    'nav.architecture': 'Arquitectura',
    'nav.vision': 'Visión',
    'nav.company': 'Empresa',
    'nav.demo': 'Solicitar demostración →',

    'hero.label': 'Construida para la era de la IA',
    'hero.title': 'Decision<span style="color: #0c7bf4">AI</span> <span style="color: #06effe">OS</span>',
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
    'cap.market': 'Marketplace de Inteligência',
    'cap.market_desc': 'Conecta burós, proveedores de identidad y fuentes de datos en un ecosistema abierto.',

    /* PLATAFORMA */
    'plat.hero_title': 'Orqueste decisiones financieras en tiempo real.',
    'plat.hero_desc': 'Decision<span style="color: #0c7bf4">AI</span> <span style="color: #06effe">OS</span> es la infraestructura central de decisión que combina datos, APIs y modelos de IA para transformar señales en decisiones inteligentes en menos de 100 milisegundos.',
    'plat.offer_label': 'LO QUE LA PLATAFORMA OFRECE',
    'plat.offer_1_title': 'Orquestador Visual No-Code',
    'plat.offer_1_desc': 'Cree flujos de decisión complejos de forma visual, sin código, con total agilidad.',
    'plat.offer_2_title': 'Integración de APIs, Datos y Modelos',
    'plat.offer_2_desc': 'Conecte cualquier fuente de datos, API o modelo de IA al flujo de decisión de forma segura.',
    'plat.offer_3_title': 'Simulación e Backtesting',
    'plat.offer_3_desc': 'Pruebe decisiones con datos históricos, anticipando resultados y reduciendo riesgos.',
    'plat.offer_4_title': 'Gobernanza y Auditoría',
    'plat.offer_4_desc': 'Versione, audite y garantice conformidad en cada cambio realizado en la plataforma.',
    'plat.offer_5_title': 'Ejecución en Tiempo Real',
    'plat.offer_5_desc': 'Motor de decisión ultrarrápido con latencia inferior a 100 milisegundos.',
    'plat.offer_6_title': 'Conectores Nativos',
    'plat.offer_6_desc': 'Integraciones listas con burós, proveedores de identidad, pagos y ecosistema financiero.',
    'plat.how_label': 'CÓMO FUNCIONA',
    'plat.how_1_title': 'Conecte',
    'plat.how_1_desc': 'Conecte fuentes de datos, APIs y modelos al orquestador visual.',
    'plat.how_2_title': 'Modele',
    'plat.how_2_desc': 'Monte reglas, políticas y estrategias de decisión con componentes reutilizables.',
    'plat.how_3_title': 'Simule',
    'plat.how_3_desc': 'Ejecute simulaciones y valide resultados con datos históricos antes de publicar.',
    'plat.how_4_title': 'Ejecute',
    'plat.how_4_desc': 'Ponga en producción y tome decisiones en tiempo real con máximo rendimiento.',
    'plat.ben_label': 'BENEFICIOS PARA SU INSTITUCIÓN',
    'plat.ben_1': 'Reducción de fraudes y pérdidas financieras',
    'plat.ben_2': 'Menos falsos positivos y retrabajo',
    'plat.ben_3': 'Agilidad para crear y ajustar estrategias',
    'plat.ben_4': 'Visión unificada de riesgo y comportamiento',
    'plat.ben_5': 'Cumplimiento, trazabilidad y control total',
    'plat.ben_6': 'Escalabilidad para millones de decisiones por segundo',

    /* CAPACIDADES */
    'cap_p.hero_title': 'Módulos inteligentes que trabajan juntos y evolucionan con su institución.',
    'cap_p.hero_desc': 'Decision<span style="color: #0c7bf4">AI</span> <span style="color: #06effe">OS</span> integra capacidades avanzadas que analizan miles de señales en tiempo real, combinando datos, modelos e inteligencia contextual para entregar decisiones más precisas, seguras e escalables.',
    'cap_p.main_label': 'NUESTRAS CAPACIDADES PRINCIPALES',
    'cap_p.main_title': 'Módulos especializados que se complementan para entregar inteligencia de decisión de punta a punta.',
    'cap_p.m1_title': 'Fraude y AML',
    'cap_p.m1_desc': 'Módulos avanzados para detectar, prevenir y responder a actividades fraudulentas y de lavado de dinero en tiempo real.',
    'cap_p.m1_l1': 'Detección de fraude transaccional',
    'cap_p.m1_l2': 'Cumplimiento AML completo',
    'cap_p.m1_l3': 'Monitoreo continuo',
    'cap_p.m1_l4': 'Triaje y alertas inteligentes',
    'cap_p.m2_title': 'Detección de Money Mule',
    'cap_p.m2_desc': 'Identifica e interrumpe redes de mulas financieras y esquemas de movimentación ilícita con análisis conductual y de red.',
    'cap_p.m2_l1': 'Identificación de patrones de red',
    'cap_p.m2_l2': 'Análisis de flujo y movimientos',
    'cap_p.m2_l3': 'Relación entre cuentas y dispositivos',
    'cap_p.m2_l4': 'Puntuación de riesgo dinámica',
    'cap_p.m3_title': 'IA Investigativa',
    'cap_p.m3_desc': 'Explora relaciones ocultas y descubre redes de fraude complejas con IA y grafos de inteligencia.',
    'cap_p.m3_l1': 'Descubrimiento de redes y clusters',
    'cap_p.m3_l2': 'Correlación de entidades y eventos',
    'cap_p.m3_l3': 'Anomalías y comportamientos atípicos',
    'cap_p.m3_l4': 'Apoyo completo a la investigación',
    'cap_p.m4_title': 'Inteligencia Contextual',
    'cap_p.m4_desc': 'Analiza múltiples señales simultáneamente para entender el contexto real detrás de cada interacción o transacción.',
    'cap_p.m4_l1': 'Comportamiento del usuario',
    'cap_p.m4_l2': 'Inteligencia de dispositivo y sesión',
    'cap_p.m4_l3': 'Datos transaccionales y biométricos',
    'cap_p.m4_l4': 'Score de confianza contextual',
    'cap_p.m5_title': 'Marketplace de Inteligencia',
    'cap_p.m5_desc': 'Conecta su institución a un ecosistema abierto de datos, proveedores y servicios de inteligencia.',
    'cap_p.m5_l1': 'Burós y fuentes de datos alternativas',
    'cap_p.m5_l2': 'Proveedores de identidad y biometría',
    'cap_p.m5_l3': 'Modelos y algoritmos del ecosistema',
    'cap_p.m5_l4': 'APIs e integraciones plug-and-play',

    /* ARQUITETURA */
    'arq.hero_title': 'Cómo Decision<span style="color: #0c7bf4">AI</span> <span style="color: #06effe">OS</span> ejecuta decisiones inteligentes en tiempo real.',
    'arq.hero_desc': 'Nuestra arquitectura fue diseñada para procesar miles de señales, orquestar reglas y modelos de IA y entregar la decisión ideal en menos de 100ms, con máxima escalabilidad y seguridad.',
    'arq.layer_label': 'CAPA POR CAPA',
    'arq.layer_title': 'Una estructura modular para máxima flexibilidad y rendimiento.',
    'arq.l1_title': 'FUENTES DE SEÑALES Y DATOS',
    'arq.l1_desc': 'Recopila señales de múltiples fuentes en tiempo real: dispositivos, navegadores, transacciones, burós, socios y datos internos.',
    'arq.l2_title': 'ORQUESTADOR DE DECISIONES (NO-CODE)',
    'arq.l2_desc': 'Permite crear, probar y versionar flujos de decisión complejos con reglas, políticas y modelos de IA de forma visual.',
    'arq.l3_title': 'MOTOR DE DECISIÓN EN TIEMPO REAL',
    'arq.l3_desc': 'Ejecuta millones de combinaciones de señales, reglas y modelos en milisegundos para identificar el mejor resultado.',
    'arq.l4_title': 'ACCIONES / RESULTADOS',
    'arq.l4_desc': 'Decisiones accionables entregadas a los sistemas de origen para bloquear, revisar o aprobar automáticamente.',
    'arq.l5_title': 'MÓDULOS DE PLATAFORMA',
    'arq.l5_desc': 'Capas de soporte que garantizan monitoreo, gobernanza, auditoría, analítica y mejora continua de la decisión.',
    'arq.stat_1': 'Decisiones en tiempo real con mínima latencia',
    'arq.stat_2': 'Diseñada para volúmenes globales de transacciones',
    'arq.stat_3': 'Arquitectura moderna, modular y flexible',
    'arq.iso_1': 'FUENTES DE SEÑALES Y DATOS',
    'arq.iso_2': 'ORQUESTADOR DE DECISIONES',
    'arq.iso_3': 'MOTOR DE DECISIÓN EN TIEMPO REAL',
    'arq.iso_4': 'ACCIONES / RESULTADOS',
    'arq.iso_5': 'MÓDULOS DE PLATAFORMA',

    /* VISÃO */
    'vis.hero_title': 'Construyendo la Decision Intelligence Network.',
    'vis.hero_desc': 'Nuestra visión es crear la mayor red colaborativa de inteligencia de decisión del sistema financiero, conectando instituciones para combatir el crimen financiero de forma conjunta y cada vez más eficaz.',
    'vis.pillar_label': 'NUESTROS PILARES DE VISIÓN',
    'vis.p1_title': 'Efecto de Red',
    'vis.p1_desc': 'Cada nueva institución fortalece la red y aumenta la precisión para todos.',
    'vis.p1_l1': 'Más datos compartidos',
    'vis.p1_l2': 'Modelos más inteligentes',
    'vis.p1_l3': 'Detección más precisa',
    'vis.p1_l4': 'Respuestas más rápidas',
    'vis.p2_title': 'Inteligencia Compartida',
    'vis.p2_desc': 'Señales, patrones e indicadores se comparten de forma segura y anonimizada.',
    'vis.p2_l1': 'Uso compartido seguro de indicadores',
    'vis.p2_l2': 'Colaboración entre instituciones',
    'vis.p2_l3': 'Aprendizaje continuo de la red',
    'vis.p2_l4': 'Aumento de la eficiencia colectiva',
    'vis.p3_title': 'Más Seguridad para Todos',
    'vis.p3_desc': 'Los estafadores no respetan fronteras. Nuestra inteligencia tampoco.',
    'vis.p3_l1': 'Visión global de los riesgos emergentes',
    'vis.p3_l2': 'Anticipación de amenazas',
    'vis.p3_l3': 'Protección colaborativa',
    'vis.p3_l4': 'Ecosistema financiero más seguro',
    'vis.future_label': 'EL FUTURO QUE CONSTRUIMOS',
    'vis.f1_title': 'Red Global de Inteligencia',
    'vis.f1_desc': 'Conectamos instituciones en una red global para fortalecer la prevención de riesgos.',
    'vis.f2_title': 'IA Cada Vez Más Inteligente',
    'vis.f2_desc': 'Modelos que aprenden continuamente con millones de decisiones e interacciones reales.',
    'vis.f3_title': 'Confiança e Transparência',
    'vis.f3_desc': 'Gobernanza, ética y transparencia como pilares para una inteligencia confiable.',
    'vis.f4_title': 'Innovación Contínua',
    'vis.f4_desc': 'Invertimos constantemente en tecnología para anticipar el futuro del crimen financiero.',
    'vis.f5_title': 'Impacto Real',
    'vis.f5_desc': 'Decisiones inteligentes que generan un mundo financiero mejor y más seguro.',

    /* EMPRESA */
    'emp.hero_title': 'Sobre Decision<span style="color: #0c7bf4">AI</span> <span style="color: #06effe">OS</span>.',
    'emp.hero_desc': 'La infraestructura de inteligencia de decisión para el sistema financiero global, construida para la era de la IA. Combinamos IA avanzada, orquestación no-code e inteligencia contextual para entregar más seguridad, eficiencia y crecimiento sostenible.',
    'emp.journey_label': 'NUESTRA MISIÓN',
    'emp.journey_desc': 'DecisionAI OS nació de la convicción de que el sistema financiero necesita evoluir de reglas isoladas a inteligencia unificada.',
    'emp.t1_label': 'Inicio',
    'emp.t1_title': 'Identificamos el cuello de botella',
    'emp.t1_desc': 'Identificamos el cuello de botella de la toma de decisiones fragmentada en el sistema financiero.',
    'emp.t2_label': 'Construcción',
    'emp.t2_title': 'Capa unificada',
    'emp.t2_desc': 'Desarrollamos la primera capa unificada de decisión con orquestación visual e IA.',
    'emp.t3_label': 'Tracción',
    'emp.t3_title': 'Validación de mercado',
    'emp.t3_desc': 'Fintechs e instituciones innovadoras adoptan la plataforma y comprueban resultados.',
    'emp.t4_label': 'Expansão',
    'emp.t4_title': 'Escala global',
    'emp.t4_desc': 'Escalamos globalmente para transformar la infraestructura de decisión del sistema financiero.',
    'emp.move_label': 'LO QUE NOS MUEVE',
    'emp.mission_title': 'Nuestra Misión',
    'emp.mission_desc': 'Construir la infraestructura de inteligencia que permite a las instituciones financieras tomar las mejores decisiones en tiempo real.',
    'emp.vision_title': 'Nuestra Visión',
    'emp.vision_desc': 'Ser la principal infraestructura global de inteligencia de decisión para el sistema financiero en la era de la IA.',
    'emp.values_title': 'Nuestros Valores',
    'emp.v1': 'Innovación con propósito',
    'emp.v2': 'Integridad y transparencia',
    'emp.v3': 'Colaboración y alianza',
    'emp.v4': 'Excelencia técnica',
    'emp.v5': 'Enfoque en el cliente e impacto real',

    'contact.label': 'CONTACTO',
    'contact.title': 'Hable con nuestro equipo',
    'contact.desc': 'Descubra cómo DecisionAI OS puede transformar sus operaciones con inteligencia en tiempo real.',
    'contact.name': 'Nombre',
    'contact.email': 'Email',
    'contact.company': 'Empresa',
    'contact.phone': 'Teléfono',
    'contact.message': 'Mensaje',
    'contact.cta': 'Enviar mensaje',

    'arq.diag_title': 'VISIÓN GENERAL DE LA ARQUITECTURA',
    'arq.diag_col1_title': 'FUENTES DE SEÑALES Y DATOS',
    'arq.diag_col1_1': 'Señales Móviles',
    'arq.diag_col1_2': 'Señales del Navegador',
    'arq.diag_col1_3': 'APIs y Conectores (Bureaus, etc.)',
    'arq.diag_col1_4': 'Datos Internos',
    'arq.diag_col1_5': 'Modelos de IA y Algoritmos',
    'arq.diag_col2_title': 'ORQUESTADOR DE DECISIONES (NO-CODE)',
    'arq.diag_col2_1': 'Flujos de Decisión',
    'arq.diag_col2_2': 'Reglas de Negocio',
    'arq.diag_col2_3': 'Modelos de IA',
    'arq.diag_col2_4': 'Políticas y Estrategias',
    'arq.diag_col2_engine_title': 'MOTOR DE DECISIÓN EN TIEMPO REAL',
    'arq.diag_col2_engine_sub': '< 100ms',
    'arq.diag_col3_title': 'ACCIONES / RESULTADOS',
    'arq.diag_col3_1': 'Bloquear',
    'arq.diag_col3_2': 'Revisar / MFA',
    'arq.diag_col3_3': 'Aprobar',
    'arq.diag_col4_title': 'MÓDULOS DE PLATAFORMA',
    'arq.diag_col4_1': 'Monitoreo en Tiempo Real',
    'arq.diag_col4_2': 'Gestión de Casos',
    'arq.diag_col4_3': 'Auditoría y Gobernanza',
    'arq.diag_col4_4': 'Reportes y Analytics',

    'footer.nav_title': 'Navegación',
    'footer.social_title': 'Redes Sociales',
    'footer.copy': '© 2026 DecisionAI OS. Todos los derechos reservados.'
  }

};

/* =========================
   APPLY / SWITCH LANGUAGE
========================= */
(function () {
  const langSwitch = document.getElementById('langSwitch');
  const langToggle = document.getElementById('langToggle');
  const langDropdown = document.getElementById('langDropdown');
  const langFlagActive = document.getElementById('langFlagActive');
  const langLabelActive = document.getElementById('langLabelActive');
  if (!langSwitch || !langToggle || !langDropdown) return;

  const langOptions = langDropdown.querySelectorAll('.lang-option');

  // Labels for the toggle button
  var langLabels = { pt: 'PT', en: 'EN', es: 'ES' };

  // Toggle dropdown open/close
  langToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    langSwitch.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!langSwitch.contains(e.target)) {
      langSwitch.classList.remove('open');
    }
  });

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
          el.innerHTML = t[key];
        }
      }
    });
  }

  function setLanguage(lang) {
    localStorage.setItem('lang', lang);

    // Update active state in dropdown
    langOptions.forEach(function (opt) {
      opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
    });

    // Update the toggle button flag & label
    var activeOpt = langDropdown.querySelector('.lang-option[data-lang="' + lang + '"]');
    if (activeOpt && langFlagActive) {
      var flagSvg = activeOpt.querySelector('svg');
      if (flagSvg) {
        langFlagActive.innerHTML = flagSvg.innerHTML;
      }
    }
    if (langLabelActive) {
      langLabelActive.textContent = langLabels[lang] || lang.toUpperCase();
    }

    applyTranslations(lang);
  }

  const saved = localStorage.getItem('lang') || 'pt';
  setLanguage(saved);

  langOptions.forEach(function (opt) {
    opt.addEventListener('click', function () {
      setLanguage(opt.getAttribute('data-lang'));
      langSwitch.classList.remove('open');
    });
  });
})();

