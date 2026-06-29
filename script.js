/* ============================================
   Sidhartha Kumar Malla — Portfolio JavaScript
   Space animation, smooth scroll,
   active nav highlight, scroll reveal, mobile menu,
   back-to-top button
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== SPACE ANIMATION ==========
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let shootingStars = [];
  let nebulae = [];
  let animationId;

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  // --- Star class ---
  class Star {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.3;
      this.opacity = Math.random() * 0.8 + 0.2;
      this.baseOpacity = this.opacity;
      this.twinkleSpeed = Math.random() * 0.02 + 0.005;
      this.twinklePhase = Math.random() * Math.PI * 2;
      // Subtle drift
      this.speedX = (Math.random() - 0.5) * 0.08;
      this.speedY = (Math.random() - 0.5) * 0.08;
      // Color variation: mostly white, some cyan/blue tint
      const colorRoll = Math.random();
      if (colorRoll < 0.15) {
        this.color = { r: 0, g: 255, b: 255 }; // cyan
      } else if (colorRoll < 0.25) {
        this.color = { r: 100, g: 180, b: 255 }; // light blue
      } else if (colorRoll < 0.3) {
        this.color = { r: 255, g: 200, b: 150 }; // warm
      } else {
        this.color = { r: 255, g: 255, b: 255 }; // white
      }
    }

    update(time) {
      // Twinkling
      this.opacity = this.baseOpacity + Math.sin(time * this.twinkleSpeed + this.twinklePhase) * 0.3;
      this.opacity = Math.max(0.05, Math.min(1, this.opacity));

      // Gentle drift
      this.x += this.speedX;
      this.y += this.speedY;

      // Wrap around
      if (this.x < -5) this.x = canvas.width + 5;
      if (this.x > canvas.width + 5) this.x = -5;
      if (this.y < -5) this.y = canvas.height + 5;
      if (this.y > canvas.height + 5) this.y = -5;
    }

    draw() {
      const { r, g, b } = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
      ctx.fill();

      // Glow for larger/brighter stars
      if (this.size > 1.2 && this.opacity > 0.5) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${this.opacity * 0.15})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }
  }

  // --- Shooting Star class ---
  class ShootingStar {
    constructor() {
      this.reset();
    }

    reset() {
      this.active = false;
      this.x = 0;
      this.y = 0;
      this.length = 0;
      this.speed = 0;
      this.angle = 0;
      this.opacity = 0;
      this.life = 0;
      this.maxLife = 0;
    }

    activate() {
      this.active = true;
      this.x = Math.random() * canvas.width * 0.8;
      this.y = Math.random() * canvas.height * 0.4;
      this.length = Math.random() * 80 + 50;
      this.speed = Math.random() * 8 + 6;
      this.angle = (Math.random() * 30 + 15) * (Math.PI / 180); // 15-45 degrees
      this.opacity = 1;
      this.life = 0;
      this.maxLife = Math.random() * 40 + 30;
    }

    update() {
      if (!this.active) return;
      this.life++;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.opacity = 1 - (this.life / this.maxLife);

      if (this.life >= this.maxLife || this.x > canvas.width + 50 || this.y > canvas.height + 50) {
        this.active = false;
      }
    }

    draw() {
      if (!this.active || this.opacity <= 0) return;

      const tailX = this.x - Math.cos(this.angle) * this.length;
      const tailY = this.y - Math.sin(this.angle) * this.length;

      const gradient = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
      gradient.addColorStop(0, `rgba(0, 255, 255, 0)`);
      gradient.addColorStop(0.6, `rgba(0, 255, 255, ${this.opacity * 0.3})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, ${this.opacity * 0.9})`);

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Bright head
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.fill();
    }
  }

  // --- Nebula class (subtle background glow) ---
  class Nebula {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.radius = Math.random() * 200 + 100;
      this.opacity = Math.random() * 0.03 + 0.01;
      this.baseOpacity = this.opacity;
      this.pulseSpeed = Math.random() * 0.003 + 0.001;
      this.pulsePhase = Math.random() * Math.PI * 2;
      // Color: cyan or teal hues
      const hue = Math.random() * 30 + 170; // 170-200 range (cyan/teal)
      this.color = `hsla(${hue}, 100%, 50%, `;
    }

    update(time) {
      this.opacity = this.baseOpacity + Math.sin(time * this.pulseSpeed + this.pulsePhase) * 0.01;
      this.opacity = Math.max(0.005, this.opacity);
    }

    draw() {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
      gradient.addColorStop(0, this.color + this.opacity + ')');
      gradient.addColorStop(1, this.color + '0)');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  // --- Connect nearby stars with faint lines ---
  function connectStars() {
    const maxDist = 120;
    const maxConnections = 80;
    let connections = 0;

    for (let i = 0; i < stars.length && connections < maxConnections; i++) {
      if (stars[i].size < 1) continue; // Only connect brighter stars
      for (let j = i + 1; j < stars.length && connections < maxConnections; j++) {
        if (stars[j].size < 1) continue;
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const opacity = 0.06 * (1 - dist / maxDist) * Math.min(stars[i].opacity, stars[j].opacity);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
          ctx.lineWidth = 0.4;
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke();
          connections++;
        }
      }
    }
  }

  // --- Init ---
  function initSpace() {
    const area = canvas.width * canvas.height;
    const starCount = Math.min(Math.floor(area / 4000), 200);

    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    shootingStars = [];
    for (let i = 0; i < 3; i++) {
      shootingStars.push(new ShootingStar());
    }

    nebulae = [];
    const nebulaCount = Math.min(Math.floor(area / 200000), 5);
    for (let i = 0; i < nebulaCount; i++) {
      nebulae.push(new Nebula());
    }
  }

  // --- Shooting star spawner ---
  let lastShootingStarTime = 0;
  function maybeSpawnShootingStar(time) {
    if (time - lastShootingStarTime > 3000) { // At least 3s between
      if (Math.random() < 0.008) { // ~0.8% chance per frame
        const inactive = shootingStars.find(s => !s.active);
        if (inactive) {
          inactive.activate();
          lastShootingStarTime = time;
        }
      }
    }
  }

  // --- Animation loop ---
  let startTime = performance.now();

  function animate(timestamp) {
    const time = timestamp - startTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw nebulae (background glow)
    nebulae.forEach(n => {
      n.update(time);
      n.draw();
    });

    // Draw and update stars
    stars.forEach(s => {
      s.update(time);
      s.draw();
    });

    // Connect stars
    connectStars();

    // Shooting stars
    maybeSpawnShootingStar(time);
    shootingStars.forEach(s => {
      s.update();
      s.draw();
    });

    animationId = requestAnimationFrame(animate);
  }

  resizeCanvas();
  initSpace();
  animate(performance.now());

  window.addEventListener('resize', () => {
    resizeCanvas();
    initSpace();
  });


  // ========== MOBILE HAMBURGER MENU ==========
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });


  // ========== ACTIVE NAV HIGHLIGHT (Intersection Observer) ==========
  const sections = document.querySelectorAll('.section, section');
  const navItems = document.querySelectorAll('.nav-links a');

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    if (section.id) {
      sectionObserver.observe(section);
    }
  });


  // ========== SCROLL REVEAL ANIMATION ==========
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // ========== NAVBAR SCROLL EFFECT & BACK TO TOP ==========
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 50) {
      navbar.style.borderBottomColor = 'rgba(0, 255, 255, 0.12)';
      navbar.style.background = 'rgba(10, 10, 20, 0.95)';
    } else {
      navbar.style.borderBottomColor = 'rgba(0, 255, 255, 0.08)';
      navbar.style.background = 'rgba(10, 10, 20, 0.85)';
    }

    // Back to top button visibility
    if (backToTop) {
      if (currentScrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  });

  // ========== CONTACT FORM SUBMIT (AJAX/Fetch) ==========
  const contactForm = document.getElementById('contact-form');
  const submitBtn = contactForm ? contactForm.querySelector('.form-submit-btn') : null;

  if (contactForm && submitBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Change button state to sending
      const originalBtnContent = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
      submitBtn.innerHTML = 'Sending...';

      const formData = new FormData(contactForm);

      fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.innerHTML = originalBtnContent;

        if (response.ok) {
          alert('Thank you! Your message has been sent successfully.');
          contactForm.reset();
        } else {
          alert('Oops! There was a problem submitting your form. Please try again.');
        }
      })
      .catch(error => {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.innerHTML = originalBtnContent;
        console.error('Error submitting form:', error);
        alert('An error occurred while sending your message. Please check your network and try again.');
      });
    });
  }

});
