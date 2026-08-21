/**
 * ============================================================================
 * SAIHAN // INTERACTIVE GLASSMORPHIC PORTFOLIO ENGINE
 * ============================================================================
 * File: assets/js/main.js
 * Modules: Clean Background Particle Terrain, Glass Filters, Modal, AJAX Form
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundParticleTerrain();
  initFireEmbersOverlay();
  initMobileNav();
  initPortfolioFilters();
  initCaseStudyModal();
  initContactForm();
  initSmoothScroll();
  initInquiryRouting();
  initEmailCopy();
  initVisualsAccordion();
});

// ============================================================================
// 1. SUBTLE FIRE EMBERS RISING OVERLAY (SLOW & RANDOMIZED PATHS)
// ============================================================================
function initFireEmbersOverlay() {
  const canvas = document.getElementById('fireEmbersCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;
  let animationId = null;
  let isVisible = true;
  let time = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width || 360;
    height = rect.height || 450;
    dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);
  }

  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
  });

  // Balanced count: 26 slow, organic embers
  const emberCount = 26;
  const embers = [];

  function createEmber(initialY = null) {
    return {
      x: Math.random() * (width || 360),
      y: initialY !== null ? initialY : (height || 450) + Math.random() * 20,
      size: Math.random() * 2.2 + 0.7,
      // Slow, cinematic upward velocity
      speedY: Math.random() * 0.32 + 0.16,
      // Randomized horizontal drift & dual-harmonic turbulence
      driftX: (Math.random() - 0.5) * 0.28,
      freqX1: Math.random() * 1.4 + 0.6,
      ampX1: Math.random() * 1.8 + 0.6,
      freqX2: Math.random() * 3.2 + 1.2,
      ampX2: Math.random() * 0.6 + 0.2,
      phase1: Math.random() * Math.PI * 2,
      phase2: Math.random() * Math.PI * 2,
      maxAlpha: Math.random() * 0.6 + 0.25,
      alpha: 0,
      colorType: Math.random() // 0-0.45: red, 0.45-0.8: orange, 0.8-1: gold spark
    };
  }

  for (let i = 0; i < emberCount; i++) {
    embers.push(createEmber(Math.random() * (height || 450)));
  }

  function render() {
    if (!isVisible) {
      animationId = requestAnimationFrame(render);
      return;
    }

    // Slow, soothing time step
    time += 0.008;
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];

      // Slow upward progression
      e.y -= e.speedY;

      // Randomized multi-harmonic wavy path with steady drift
      const wobble = Math.sin(time * e.freqX1 + e.phase1) * e.ampX1 + Math.cos(time * e.freqX2 + e.phase2) * e.ampX2;
      e.x += e.driftX + wobble * 0.25;

      // Smooth fade in near bottom, fade out near top
      const progress = 1 - (e.y / (height || 450));
      if (progress < 0.12) {
        e.alpha = (progress / 0.12) * e.maxAlpha;
      } else if (progress > 0.82) {
        e.alpha = Math.max(0, (1 - (progress - 0.82) / 0.18) * e.maxAlpha);
      } else {
        // Soft organic thermal twinkle
        e.alpha = e.maxAlpha * (0.88 + 0.12 * Math.sin(time * 2.5 + e.phase1));
      }

      // Recycle ember when top is reached or out of bounds
      if (e.y < -15 || e.x < -20 || e.x > (width || 360) + 20 || e.alpha <= 0) {
        embers[i] = createEmber();
        continue;
      }

      // Warm Fire Ember Color Palette
      let fillCol, glowCol;
      if (e.colorType < 0.45) {
        fillCol = `rgba(255, 42, 58, ${e.alpha.toFixed(3)})`;
        glowCol = `rgba(255, 20, 30, ${(e.alpha * 0.4).toFixed(3)})`;
      } else if (e.colorType < 0.8) {
        fillCol = `rgba(255, 120, 40, ${e.alpha.toFixed(3)})`;
        glowCol = `rgba(255, 80, 20, ${(e.alpha * 0.4).toFixed(3)})`;
      } else {
        fillCol = `rgba(255, 220, 95, ${e.alpha.toFixed(3)})`;
        glowCol = `rgba(255, 160, 40, ${(e.alpha * 0.5).toFixed(3)})`;
      }

      // Soft ambient ember blur halo
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = glowCol;
      ctx.fill();

      // Sharp ember hot center
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fillStyle = fillCol;
      ctx.fill();
    }

    ctx.restore();
    animationId = requestAnimationFrame(render);
  }

  render();
}

// ============================================================================
// 2. BACKGROUND CLEAN 3D PARTICLE POINT-CLOUD TERRAIN (IMAGE 2 REF)
// ============================================================================
function initBackgroundParticleTerrain() {
  const canvas = document.getElementById('bgParticleTerrainCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  let animationId = null;
  let isVisible = true;
  let time = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
  });

  const getGrid = () => ({
    cols: window.innerWidth < 768 ? 45 : 75,
    rows: window.innerWidth < 768 ? 22 : 35
  });

  function render() {
    if (!isVisible) {
      animationId = requestAnimationFrame(render);
      return;
    }

    time += 0.008;
    ctx.clearRect(0, 0, width, height);

    const { cols, rows } = getGrid();
    const cellWidth = width / (cols - 1);
    const horizonY = height * 0.52;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Pure, clean undulating particle landscape
    for (let r = 0; r < rows; r++) {
      const depthFactor = r / rows;
      const yBase = horizonY + depthFactor * (height * 0.48);

      for (let c = 0; c < cols; c++) {
        const xBase = c * cellWidth;
        const nx = c / cols;

        const wave1 = Math.sin(nx * 4.2 + time * 0.8 + depthFactor * 3.0) * 25;
        const wave2 = Math.cos(nx * 2.6 - time * 0.5 + depthFactor * 1.8) * 15;
        const particleY = yBase - (wave1 + wave2);

        const pSize = 0.6 + depthFactor * 1.3;
        const pAlpha = 0.05 + depthFactor * 0.4;

        ctx.fillStyle = `rgba(244, 244, 240, ${pAlpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(xBase, particleY, pSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    animationId = requestAnimationFrame(render);
  }

  render();
}

// ============================================================================
// 3. MOBILE NAVIGATION DRAWER
// ============================================================================
function initMobileNav() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuLinks = document.querySelectorAll('.mobile-nav-link');

  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.contains('hidden') || mobileMenu.style.display === 'none';
    if (isHidden) {
      mobileMenu.style.display = 'block';
      mobileMenu.classList.remove('hidden');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      `;
    } else {
      mobileMenu.style.display = 'none';
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      `;
    }
  });

  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.style.display = 'none';
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      `;
    });
  });
}

// ============================================================================
// 4. GLASSMORPHIC PORTFOLIO FILTERS
// ============================================================================
function initPortfolioFilters() {
  const filterButtons = document.querySelectorAll('.portfolio-filter-btn');
  const projectCards = document.querySelectorAll('.portfolio-project-card');
  const activeCountEl = document.getElementById('visibleProjectsCount');

  if (!filterButtons.length || !projectCards.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedCategory = btn.getAttribute('data-filter');

      filterButtons.forEach(b => {
        b.classList.remove('active');
      });

      btn.classList.add('active');

      let visibleCount = 0;

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const matches = selectedCategory === 'all' || cardCategory === selectedCategory;

        if (matches) {
          card.style.display = 'flex';
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.classList.add('hidden');
          card.style.display = 'none';
        }
      });

      if (activeCountEl) {
        activeCountEl.textContent = `[SHOWING ${visibleCount} RELEASES]`;
      }
    });
  });
}

// ============================================================================
// 5. CASE STUDY MODAL SYSTEM
// ============================================================================
const PROJECT_DATABASE = {
  'proj-1': {
    title: 'MEDUSA PHUKET // 4K REELS & MEDIA',
    category: 'Visuals & Media',
    pillar: 'Visuals',
    client: 'Medusa Phuket',
    year: '2026',
    coverImage: 'assets/images/works/medusa.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop',
    overview: 'Commercial food photography, nightlife visual direction, and high-retention 4K social media reels.',
    deliverables: ['4K High-Retention Reels', 'Commercial Food Photography', 'Nightlife Visual Direction', 'Social Campaign Assets'],
    tools: ['Sony A7SIII', '35mm GM f/1.4', 'DaVinci Resolve Studio', 'Capture One Pro'],
    impact: 'Drove over 1.8M organic views across Instagram Reels with a notable surge in weekend bookings.'
  },
  'proj-2': {
    title: 'YOON SKIN // AQUA SHIELD CAMPAIGN',
    category: 'Visuals & Branding',
    pillar: 'Visuals',
    client: 'Yoon Skin',
    year: '2026',
    coverImage: 'assets/images/works/yoonskin.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop',
    overview: 'Key visual product direction, cosmetics packaging design, and multi-platform promotional poster visuals.',
    deliverables: ['Key Visual Master Layouts', 'Cosmetics Packaging Design', 'E-Commerce Hero Assets', 'Ad Creatives'],
    tools: ['Sony A7SIII', 'Macro 90mm GM', 'Adobe Photoshop', 'Illustrator'],
    impact: 'Hero campaign drove a 420% increase in product pre-orders within the first 14 days of launch.'
  },
  'proj-3': {
    title: 'OGGI RESTAURANT // SOCIAL SCALING',
    category: 'Growth & Social',
    pillar: 'Growth',
    client: 'Oggi Phuket',
    year: '2026',
    coverImage: 'assets/images/works/oggi.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
    overview: 'End-to-end social media growth, culinary content retainers, and customer engagement strategy.',
    deliverables: ['Culinary Content Retainer', 'Local Paid Ad Campaigns', 'Audience Growth Playbook', 'Meta Pixel Funnel'],
    tools: ['Meta Ads Manager', 'TikTok Creative Studio', 'CapCut Pro', 'Lightroom'],
    impact: 'Scaled in-venue foot traffic by 65% and grew local engaged Instagram follower base by +18,000 in 90 days.'
  },
  'proj-4': {
    title: 'PATONG FESTIVAL // LIVE STAGE & CROWD',
    category: 'Visuals & Concert',
    pillar: 'Visuals',
    client: 'Patong Beach Festival',
    year: '2025',
    coverImage: 'assets/images/works/patong.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    overview: 'High-energy concert photography, low-light stage visual coverage, and festival crowd documentation.',
    deliverables: ['Live Concert Photography', 'Stage Lighting Visual Direction', 'Crowd Media Coverage', 'Festival Recap Assets'],
    tools: ['Sony A7SIII', '70-200mm GM f/2.8', 'Capture One Pro', 'Adobe Lightroom'],
    impact: 'Captured primary festival headliners with high-impact live stage media used for official event wrap-ups.'
  },
  'proj-5': {
    title: 'RESTAURANT OS // INVENTORY & DB',
    category: 'Systems & Web',
    pillar: 'Systems',
    client: 'Internal System',
    year: '2026',
    coverImage: 'assets/images/works/system.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
    overview: 'Custom multi-branch management web application with normalized MySQL database and real-time tracking.',
    deliverables: ['Normalized MySQL Database', 'PHP 8 PDO API Engine', 'Real-Time Inventory Dashboard', 'Role-Based Access Control'],
    tools: ['PHP 8.3', 'MySQL / InnoDB', 'Tailwind CSS', 'Hostinger Cloud VPS'],
    impact: 'Automated daily inventory reconciliations and eliminated 98% of stock discrepancy errors across branches.'
  },
  'proj-6': {
    title: 'NIKE // "NIKE IN TOWN" AD CONCEPT',
    category: 'Growth & Retail Concept',
    pillar: 'Growth',
    client: 'Retail Store Concept',
    year: '2026',
    coverImage: 'assets/images/works/nike.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
    overview: 'Retail promotional visual direction, dynamic streetwear poster concept, and local store ad design.',
    deliverables: ['Retail Showcase Poster', 'Urban Street Typography Layout', 'Store Display Creatives', 'Social Promo Assets'],
    tools: ['Adobe Photoshop', 'Illustrator', 'Figma', 'Camera Raw'],
    impact: 'Created high-contrast urban visual concept tailored for local streetwear retail store promotions.'
  },
  'proj-7': {
    title: '35MM STREET // ANALOG ARCHIVE',
    category: 'Visuals & Street',
    pillar: 'Visuals',
    client: 'Independent Series',
    year: '2025',
    coverImage: 'assets/images/works/memories.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
    overview: 'Documentary street photography, low-light night captures, and raw 35mm grain aesthetics.',
    deliverables: ['Documentary Street Prints', 'Editorial Street Layouts', 'Film Tone Emulation', 'Visual Storytelling'],
    tools: ['Leica M / 35mm Prime', 'Kodak Portra 400', 'Capture One Pro', 'Lightroom'],
    impact: 'Curated independent documentary street photography collection published across visual features.'
  }
};

function initCaseStudyModal() {
  const modal = document.getElementById('caseStudyModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const modalTriggers = document.querySelectorAll('.open-case-study');

  if (!modal) return;

  const modalTitle = document.getElementById('modalTitle');
  const modalClient = document.getElementById('modalClient');
  const modalPillar = document.getElementById('modalPillar');
  const modalYear = document.getElementById('modalYear');
  const modalImage = document.getElementById('modalImage');
  const modalOverview = document.getElementById('modalOverview');
  const modalDeliverables = document.getElementById('modalDeliverables');
  const modalTools = document.getElementById('modalTools');
  const modalImpact = document.getElementById('modalImpact');

  const openModal = (projectId) => {
    const data = PROJECT_DATABASE[projectId];
    if (!data) return;

    if (modalTitle) modalTitle.textContent = data.title;
    if (modalClient) modalClient.textContent = data.client;
    if (modalPillar) modalPillar.textContent = data.pillar;
    if (modalYear) modalYear.textContent = data.year;
    if (modalImage) {
      modalImage.onerror = () => {
        if (data.fallbackImage) modalImage.src = data.fallbackImage;
      };
      modalImage.src = data.coverImage;
      modalImage.alt = data.title;
    }
    if (modalOverview) modalOverview.textContent = data.overview;
    if (modalImpact) modalImpact.textContent = data.impact;

    if (modalDeliverables) {
      modalDeliverables.innerHTML = data.deliverables
        .map(d => `<li class="flex items-start gap-2"><span class="text-red-500 font-bold">&bull;</span> <span>${d}</span></li>`)
        .join('');
    }

    if (modalTools) {
      modalTools.innerHTML = data.tools
        .map(t => `<span class="glass-badge font-mono-tech text-xs">${t}</span>`)
        .join('');
    }

    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.style.display = 'none';
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const projectId = trigger.getAttribute('data-project-id');
      openModal(projectId);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('glass-modal-backdrop')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

// ============================================================================
// 6. AJAX CONTACT FORM SUBMISSION
// ============================================================================
function initContactForm() {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const alertBox = document.getElementById('formAlert');

  if (!form || !submitBtn || !alertBox) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    alertBox.classList.add('hidden');
    alertBox.className = 'mt-6 p-4 text-xs font-mono-tech rounded-2xl border hidden';

    const inputs = form.querySelectorAll('.glass-input');
    inputs.forEach(input => input.classList.remove('has-error'));

    const nameInput = form.querySelector('[name="name"]');
    const contactInput = form.querySelector('[name="contact_info"]') || form.querySelector('[name="email"]');
    const messageInput = form.querySelector('[name="message"]');

    let hasClientError = false;

    if (!nameInput || !nameInput.value.trim() || nameInput.value.trim().length < 2) {
      if (nameInput) nameInput.classList.add('has-error');
      hasClientError = true;
    }

    if (!contactInput || !contactInput.value.trim() || contactInput.value.trim().length < 3) {
      if (contactInput) contactInput.classList.add('has-error');
      hasClientError = true;
    }

    if (!messageInput || !messageInput.value.trim() || messageInput.value.trim().length < 5) {
      if (messageInput) messageInput.classList.add('has-error');
      hasClientError = true;
    }

    if (hasClientError) {
      showAlert('ERROR: Please provide your name/brand, WhatsApp number or email, and a brief message.', 'error');
      return;
    }

    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `TRANSMITTING MESSAGE...`;

    const formData = new FormData(form);

    try {
      const response = await fetch('api/submit-contact.php', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showAlert(result.message || 'Brief received. I will review and reply within 24 hours.', 'success');
        form.reset();
      } else {
        const errorMsg = result.message || 'Failed to submit brief.';
        showAlert(`ERROR: ${errorMsg}`, 'error');
      }
    } catch (networkError) {
      showAlert('Brief verified. (Connect Hostinger MySQL in api/config.php for live database logging).', 'info');
      form.reset();
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  function showAlert(msg, type) {
    alertBox.textContent = msg;
    alertBox.classList.remove('hidden');

    if (type === 'success') {
      alertBox.classList.add('bg-black/70', 'text-white', 'border-red-500/50');
    } else if (type === 'error') {
      alertBox.classList.add('bg-black/70', 'text-red-400', 'border-red-500');
    } else {
      alertBox.classList.add('bg-black/70', 'text-zinc-300', 'border-white/20');
    }
    
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ============================================================================
// 7. SMOOTH SCROLLING WITH ACCURATE HEADER OFFSET & MULTI-PAGE SUPPORT
// ============================================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href*="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const rawHref = this.getAttribute('href');
      if (!rawHref) return;

      const hashIndex = rawHref.indexOf('#');
      if (hashIndex === -1) return;

      const pathPart = rawHref.substring(0, hashIndex);
      const hashPart = rawHref.substring(hashIndex);

      // Check if we are on the current page
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      const isCurrentPage = !pathPart || pathPart === 'index.html' || pathPart === './index.html' || pathPart === currentPath;

      // If linking to a different HTML page, let browser navigate naturally
      if (!isCurrentPage) return;

      // Back to top handler
      if (hashPart === '#' || hashPart === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Skip if it's an inquiry button (handled by initInquiryRouting)
      if (this.hasAttribute('data-inquiry-msg')) return;

      const targetEl = document.querySelector(hashPart);
      if (targetEl) {
        e.preventDefault();
        
        // Accurate header clearance calculation
        const headerEl = document.querySelector('header');
        const headerHeight = headerEl ? headerEl.offsetHeight : 80;
        const targetRect = targetEl.getBoundingClientRect();
        const offsetPosition = window.pageYOffset + targetRect.top - headerHeight - 16;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });

        // Close mobile drawer if open
        const mobileMenu = document.getElementById('mobileMenu');
        const menuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenu && (!mobileMenu.classList.contains('hidden') || mobileMenu.style.display !== 'none')) {
          mobileMenu.style.display = 'none';
          mobileMenu.classList.add('hidden');
          if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            `;
          }
        }

        // Brief focus glow if scrolling to a service card
        if (['#visuals', '#systems', '#growth'].includes(hashPart)) {
          const cardInner = targetEl.querySelector('.glass-card') || targetEl;
          cardInner.classList.add('border-vibrant-red');
          setTimeout(() => {
            cardInner.classList.remove('border-vibrant-red');
          }, 1400);
        }
      }
    });
  });
}

// ============================================================================
// 8. INQUIRY AUTO-ROUTING WITH PRE-FILLED BRIEF
// ============================================================================
function initInquiryRouting() {
  const inquireBtns = document.querySelectorAll('.service-inquire-btn, [data-inquiry-msg]');
  const messageInput = document.getElementById('message');
  const nameInput = document.getElementById('name');

  inquireBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const inquiryMsg = btn.getAttribute('data-inquiry-msg');
      if (inquiryMsg && messageInput) {
        messageInput.value = inquiryMsg;
      }

      // Smooth scroll to contact section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const headerEl = document.querySelector('header');
        const headerHeight = headerEl ? headerEl.offsetHeight : 80;
        const targetRect = contactSection.getBoundingClientRect();
        const offsetPosition = window.pageYOffset + targetRect.top - headerHeight - 16;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });

        // Focus and highlight name input field
        setTimeout(() => {
          if (nameInput) {
            nameInput.focus();
            nameInput.classList.add('border-vibrant-red');
            setTimeout(() => nameInput.classList.remove('border-vibrant-red'), 1500);
          } else if (messageInput) {
            messageInput.focus();
          }
        }, 500);
      }
    });
  });
}

// ============================================================================
// 9. QUICK COPY EMAIL
// ============================================================================
function initEmailCopy() {
  const copyBtns = document.querySelectorAll('.copy-email-btn');

  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const email = btn.getAttribute('data-email') || 'khainghtoar2000@gmail.com';
      
      navigator.clipboard.writeText(email).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span class="text-red-400">COPIED</span>`;
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 2000);
      }).catch(() => {
        prompt('Email address:', email);
      });
    });
  });
}

// ============================================================================
// 10. FEY-STYLE EXPANDABLE ACCORDION ENGINE (IMAGE 1 REF)
// ============================================================================
function initVisualsAccordion() {
  const accordion = document.getElementById('feyAccordion') || document.getElementById('homeVisualsAccordion');
  if (!accordion) return;

  const panels = accordion.querySelectorAll('.fey-panel, .accordion-panel');
  if (!panels.length) return;

  const setActivePanel = (targetPanel) => {
    panels.forEach((p) => {
      const isTarget = (p === targetPanel);
      const expandedView = p.querySelector('.fey-expanded-view, .panel-expanded-content');
      const collapsedView = p.querySelector('.fey-collapsed-view, .panel-collapsed-label');

      if (isTarget) {
        p.classList.add('is-active', 'border-white/30', 'bg-zinc-900/90', 'shadow-2xl', 'cursor-default');
        p.classList.remove('border-white/10', 'bg-zinc-950/80', 'cursor-pointer');
        
        if (expandedView) {
          expandedView.style.display = 'flex';
          expandedView.classList.remove('hidden');
          expandedView.classList.add('flex');
        }
        if (collapsedView) {
          collapsedView.style.display = 'none';
          collapsedView.classList.add('hidden');
          collapsedView.classList.remove('flex');
        }
      } else {
        p.classList.remove('is-active', 'border-white/30', 'bg-zinc-900/90', 'shadow-2xl', 'cursor-default');
        p.classList.add('border-white/10', 'bg-zinc-950/80', 'cursor-pointer');
        
        if (expandedView) {
          expandedView.style.display = 'none';
          expandedView.classList.add('hidden');
          expandedView.classList.remove('flex');
        }
        if (collapsedView) {
          collapsedView.style.display = 'flex';
          collapsedView.classList.remove('hidden');
          collapsedView.classList.add('flex');
        }
      }
    });
  };

  panels.forEach((panel) => {
    // Click & Touch Support
    panel.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      setActivePanel(panel);
    });

    // Desktop Hover Enhancement
    panel.addEventListener('mouseenter', () => {
      if (window.innerWidth >= 1024) {
        setActivePanel(panel);
      }
    });

    // Keyboard Accessibility
    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('a, button')) return;
        e.preventDefault();
        setActivePanel(panel);
      }
    });
  });
}
