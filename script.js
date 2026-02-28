document.addEventListener('DOMContentLoaded', () => {
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
    themeBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
    });

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

    // Gallery lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const galleryItems = document.querySelectorAll('.gallery-item');

    function openLightbox(img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
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
    if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
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