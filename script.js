document.addEventListener('DOMContentLoaded', () => {
    // Intro: blank → J → E → reveal (slower, clearer)
    const overlay = document.getElementById('intro-overlay');
    const introJ = document.getElementById('intro-j');
    const introE = document.getElementById('intro-e');
    const INTRO_KEY = 'portfolio-intro-seen';
    const hasSeenIntro = (() => {
        try { return sessionStorage.getItem(INTRO_KEY) === '1'; } catch (_) { return false; }
    })();

    if (overlay && hasSeenIntro) {
        overlay.classList.add('done');
        overlay.setAttribute('aria-hidden', 'true');
    } else if (overlay && introJ && introE) {
        const t = (ms) => new Promise((r) => setTimeout(r, ms));
        (async () => {
            await t(550);
            introJ.classList.add('show');
            await t(480);
            introE.classList.add('show');
            await t(1100);
            overlay.classList.add('done');
            await t(950);
            overlay.setAttribute('aria-hidden', 'true');
            try { sessionStorage.setItem(INTRO_KEY, '1'); } catch (_) {}
        })();
    }

    // Back-to-top visibility on scroll (navbar always visible now)
    const backToTop = document.getElementById('back-to-top');
    const backToTopThreshold = 400;
    function updateBackToTop() {
        if (!backToTop) return;
        if (window.scrollY > backToTopThreshold) backToTop.classList.add('visible');
        else backToTop.classList.remove('visible');
    }
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    setTimeout(updateBackToTop, 100);

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        const id = a.getAttribute('href');
        if (id === '#') return;
        a.addEventListener('click', (e) => {
            const el = document.querySelector(id);
            if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Custom cursor with smoke trail (desktop only)
    const cursor = document.getElementById('custom-cursor');
    const trail = document.getElementById('cursor-trail');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (cursor && trail && !prefersReducedMotion && !isTouch) {
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        let trailCount = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            const el = document.elementFromPoint(e.clientX, e.clientY);
            const isPointer = el && (el.closest('a, button, [role="button"], input, select, textarea, .gallery-item, .project-card') || getComputedStyle(el).cursor === 'pointer');
            cursor.classList.toggle('pointer', !!isPointer);
            if (trailCount % 2 === 0) {
                const dot = document.createElement('span');
                const size = 8 + Math.random() * 6;
                dot.style.width = dot.style.height = size + 'px';
                dot.style.left = e.clientX + 'px';
                dot.style.top = e.clientY + 'px';
                trail.appendChild(dot);
                setTimeout(() => dot.remove(), 600);
            }
            trailCount++;
        });

        function animateCursor() {
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    } else if (cursor && trail) {
        document.body.classList.add('hide-custom-cursor');
    }

    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
        });
    }

    // Mobile navbar layout: single centered pill (move utils into main nav)
    const mainNavbar = document.getElementById('navbar');
    const mainLinks = document.querySelector('#navbar .navbar-links');
    const rightNavbar = document.querySelector('.navbar.navbar-right');
    const colorPickerWrap = document.querySelector('.navbar-right .color-picker-wrap') || document.querySelector('#navbar .color-picker-wrap');

    const originalParents = {
        colorPickerWrapParent: colorPickerWrap?.parentElement || null,
        themeBtnParent: themeBtn?.parentElement || null,
    };

    function syncNavbarLayout() {
        const isMobile = window.matchMedia('(max-width: 640px)').matches;
        if (!mainNavbar || !mainLinks || !rightNavbar || !colorPickerWrap || !themeBtn) return;

        if (isMobile) {
            // Put utils inside the main pill
            if (!mainLinks.contains(colorPickerWrap)) mainLinks.appendChild(colorPickerWrap);
            if (!mainLinks.contains(themeBtn)) mainLinks.appendChild(themeBtn);
            rightNavbar.style.display = 'none';
        } else {
            // Put utils back into the right pill
            const rightInner = rightNavbar.querySelector('.navbar-inner');
            if (rightInner) {
                if (!rightInner.contains(colorPickerWrap)) rightInner.appendChild(colorPickerWrap);
                if (!rightInner.contains(themeBtn)) rightInner.appendChild(themeBtn);
            } else {
                // Fallback to original parents if markup changes
                if (originalParents.colorPickerWrapParent && !originalParents.colorPickerWrapParent.contains(colorPickerWrap)) {
                    originalParents.colorPickerWrapParent.appendChild(colorPickerWrap);
                }
                if (originalParents.themeBtnParent && !originalParents.themeBtnParent.contains(themeBtn)) {
                    originalParents.themeBtnParent.appendChild(themeBtn);
                }
            }
            rightNavbar.style.display = '';
        }
    }
    syncNavbarLayout();
    window.addEventListener('resize', syncNavbarLayout);

    // Accent color picker
    const colorPickerBtn = document.getElementById('color-picker-btn');
    const colorPickerDropdown = document.getElementById('color-picker-dropdown');
    const ACCENT_KEY = 'portfolio-accent';

    function setAccent(accent) {
        body.classList.remove('accent-blue', 'accent-emerald', 'accent-violet', 'accent-amber', 'accent-rose');
        body.classList.add('accent-' + accent);
        try { localStorage.setItem(ACCENT_KEY, accent); } catch (_) {}
        document.querySelectorAll('.color-swatch').forEach((sw) => {
            sw.classList.toggle('active', sw.getAttribute('data-accent') === accent);
        });
    }

    const saved = localStorage.getItem(ACCENT_KEY);
    if (saved && ['blue', 'emerald', 'violet', 'amber', 'rose'].includes(saved)) setAccent(saved);
    else document.querySelector('.color-swatch[data-accent="blue"]')?.classList.add('active');

    if (colorPickerBtn && colorPickerWrap && colorPickerDropdown) {
        colorPickerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            colorPickerWrap.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
            if (!colorPickerWrap.contains(e.target)) colorPickerWrap.classList.remove('open');
        });
        colorPickerDropdown.querySelectorAll('.color-swatch').forEach((sw) => {
            sw.addEventListener('click', () => {
                setAccent(sw.getAttribute('data-accent'));
            });
        });
    }

    const bannerWrapper = document.getElementById('banner-wrapper');
    const bannerBtn = document.getElementById('hackathon-btn');
    if (bannerWrapper && bannerBtn) {
        bannerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            bannerWrapper.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
            if (!bannerWrapper.contains(e.target)) bannerWrapper.classList.remove('open');
        });
    }

    const scrollContainer = document.getElementById('gallery-scroll');
    const btnLeft = document.getElementById('scroll-left');
    const btnRight = document.getElementById('scroll-right');
    if (scrollContainer && btnLeft && btnRight) {
        btnLeft.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: -420, behavior: 'smooth' });
        });
        btnRight.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: 420, behavior: 'smooth' });
        });
    }

    // Gallery lightbox (optional per-page)
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const galleryItems = document.querySelectorAll('.gallery-item');

    function openLightbox(img) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    galleryItems.forEach((item) => {
        const img = item.querySelector('img');
        if (img) {
            item.addEventListener('click', () => openLightbox(img));
        }
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
    }

    // Home snapshot image rotator (uses gallery images)
    const snapshotImg = document.getElementById('snapshot-image');
    if (snapshotImg) {
        const snapshots = [
            'https://pbs.twimg.com/media/GoFW54gWgAA-Ls0.jpg',
            'https://www.pixground.com/wp-content/uploads/2023/05/Yoriichi-Tsugikuni-Demon-Slayer-4K-Anime-Wallpaper-1081x608.jpg',
            'https://cdn.wallpapersafari.com/63/16/vx2lL5.jpg',
            'https://m.gettywallpapers.com/wp-content/uploads/2022/02/Cool-Anime-Laptop-Wallpaper-4k.jpg',
            'https://m.gettywallpapers.com/wp-content/uploads/2023/11/Anime-Desktop-Wallpaper.jpg',
            'https://wallpapers-clan.com/wp-content/uploads/2025/01/asuke-hypebeast-graffiti-pc-wallpaper-preview.jpg',
            'https://www.hdwallpapers.in/download/anime_girl_red_black_dress_4k_hd_anime_girl-HD.jpg',
            'https://www.pixelstalk.net/wp-content/uploads/images6/4K-Anime-Wallpaper-Desktop-1.jpg',
            'https://cdn.wallpapersafari.com/55/83/Pl6QHc.jpg',
        ];
        let idx = 0;
        setInterval(() => {
            idx = (idx + 1) % snapshots.length;
            snapshotImg.style.opacity = '0';
            setTimeout(() => {
                snapshotImg.src = snapshots[idx];
                snapshotImg.style.opacity = '1';
            }, 300);
        }, 7000);
    }
});














(function() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;
  const banner = canvas.parentElement;

  function setSize() {
    const w = banner.clientWidth;
    const h = banner.clientHeight;
    if (w > 0 && h > 0) {
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  // --- SCENE SETUP ---
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(banner.clientWidth, banner.clientHeight);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0f);

  const camera = new THREE.PerspectiveCamera(50, banner.clientWidth / banner.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 4);

  // --- LIGHTING ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const blueLight = new THREE.PointLight(0x4488ff, 3, 10);
  blueLight.position.set(-2, 2, 2);
  scene.add(blueLight);

  const purpleLight = new THREE.PointLight(0xaa44ff, 2, 10);
  purpleLight.position.set(2, -1, 1);
  scene.add(purpleLight);

  const rimLight = new THREE.PointLight(0x00ffcc, 1.5, 8);
  rimLight.position.set(0, -2, -2);
  scene.add(rimLight);

  // --- MAIN OBJECT: Low-poly icosahedron ---
  const geoMain = new THREE.IcosahedronGeometry(1, 0);
  const matMain = new THREE.MeshPhongMaterial({
    color: 0x111122,
    emissive: 0x0a0a2a,
    specular: 0x4488ff,
    shininess: 120,
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geoMain, matMain);
  scene.add(mesh);

  // --- WIREFRAME OVERLAY ---
  const geoWire = new THREE.IcosahedronGeometry(1.01, 0);
  const matWire = new THREE.MeshBasicMaterial({
    color: 0x4488ff,
    wireframe: true,
    opacity: 0.35,
    transparent: true,
  });
  const wireMesh = new THREE.Mesh(geoWire, matWire);
  scene.add(wireMesh);

  // --- OUTER GLOW SHELL ---
  const geoGlow = new THREE.IcosahedronGeometry(1.18, 0);
  const matGlow = new THREE.MeshBasicMaterial({
    color: 0x2244aa,
    wireframe: true,
    opacity: 0.08,
    transparent: true,
  });
  const glowMesh = new THREE.Mesh(geoGlow, matGlow);
  scene.add(glowMesh);

  // --- FLOATING PARTICLES ---
  const particleCount = 80;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 1.8 + Math.random() * 1.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x88aaff,
    size: 0.035,
    transparent: true,
    opacity: 0.7,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // --- DRAG TO ROTATE ---
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let rotVel = { x: 0, y: 0 };
  let targetRot = { x: 0, y: 0 };
  let currentRot = { x: 0, y: 0 };

  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };
    rotVel = { x: 0, y: 0 };
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    rotVel.y = dx * 0.012;
    rotVel.x = dy * 0.012;
    targetRot.y += rotVel.y;
    targetRot.x += rotVel.x;
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  // Touch support
  canvas.addEventListener('touchstart', e => {
    isDragging = true;
    prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });
  canvas.addEventListener('touchmove', e => {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - prevMouse.x;
    const dy = e.touches[0].clientY - prevMouse.y;
    targetRot.y += dx * 0.012;
    targetRot.x += dy * 0.012;
    prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: false });
  canvas.addEventListener('touchend', () => { isDragging = false; });

  // Scroll to zoom
  canvas.addEventListener('wheel', e => {
    camera.position.z = Math.max(2, Math.min(7, camera.position.z + e.deltaY * 0.005));
  });

  // --- ANIMATE ---
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.012;

    // Idle auto-rotate when not dragging
    if (!isDragging) {
      rotVel.x *= 0.92;
      rotVel.y *= 0.92;
      targetRot.y += 0.005;
    }

    // Smooth lerp
    currentRot.x += (targetRot.x - currentRot.x) * 0.08;
    currentRot.y += (targetRot.y - currentRot.y) * 0.08;

    mesh.rotation.x = currentRot.x;
    mesh.rotation.y = currentRot.y;
    wireMesh.rotation.x = currentRot.x;
    wireMesh.rotation.y = currentRot.y;
    glowMesh.rotation.x = currentRot.x + t * 0.3;
    glowMesh.rotation.y = currentRot.y - t * 0.2;

    particles.rotation.y = t * 0.04;
    particles.rotation.x = t * 0.02;

    // Pulsing lights
    blueLight.intensity   = 3 + Math.sin(t * 1.2) * 0.8;
    purpleLight.intensity = 2 + Math.cos(t * 0.9) * 0.6;

    renderer.render(scene, camera);
  }
  animate();

  // Resize: window + ResizeObserver for layout changes (e.g. grid collapse on tablet)
  window.addEventListener('resize', setSize);
  const ro = new ResizeObserver(() => setSize());
  ro.observe(banner);
  setSize();
})();