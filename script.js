// script.js
(function() {
  'use strict';

  // ----- LOADING SCREEN -----
  const loader = document.getElementById('loader');
  const app = document.getElementById('app');
  
  window.addEventListener('load', function() {
    // minimum 1.2s delay for smooth experience
    setTimeout(() => {
      loader.classList.add('fade-out');
      app.classList.add('app-visible');
      
      // init AOS after visible
      AOS.init({
        duration: 800,
        once: true,
        offset: 80,
        easing: 'ease-out-cubic'
      });
      
      // typed init
      if (typeof Typed !== 'undefined') {
        new Typed('#typed-output', {
          strings: [
            'Cyber Security Learner',
            'Ethical Hacking',
            'Network Security'
          ],
          typeSpeed: 50,
          backSpeed: 30,
          backDelay: 1500,
          startDelay: 300,
          loop: true,
          showCursor: true,
          cursorChar: '|'
        });
      }
    }, 1400);
  });

  // ----- HAMBURGER + SIDE MENU -----
  const hamburger = document.getElementById('hamburger');
  const sideMenu = document.getElementById('sideMenu');
  const overlay = document.getElementById('overlay');
  const sideLinks = document.querySelectorAll('.side-link');
  
  function closeMenu() {
    hamburger.classList.remove('active');
    sideMenu.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }
  
  function openMenu() {
    hamburger.classList.add('active');
    sideMenu.classList.add('active');
    overlay.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
  }
  
  hamburger.addEventListener('click', function() {
    if (sideMenu.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });
  
  overlay.addEventListener('click', closeMenu);
  sideLinks.forEach(link => link.addEventListener('click', closeMenu));
  
  // close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sideMenu.classList.contains('active')) {
      closeMenu();
    }
  });

  // ----- ACCORDION (Skills) -----
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      // close others? keep independent, but we can allow multiple open (better UX)
      // Toggle current
      this.setAttribute('aria-expanded', !expanded);
      const content = this.nextElementSibling;
      if (!expanded) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = '0';
      }
    });
    // set initial maxheight for transitions
    const content = header.nextElementSibling;
    if (header.getAttribute('aria-expanded') === 'true') {
      content.style.maxHeight = content.scrollHeight + 'px';
    } else {
      content.style.maxHeight = '0';
    }
  });

  // ----- CERTIFICATIONS CAROUSEL (swipe + buttons) -----
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carPrev');
  const nextBtn = document.getElementById('carNext');
  const container = document.getElementById('carouselContainer');
  
  if (track && prevBtn && nextBtn) {
    const slides = Array.from(track.children);
    let currentIndex = 0;
    let startX = 0;
    let isDragging = false;
    let startTransform = 0;
    
    function getSlideWidth() {
      if (!slides.length) return 300;
      const firstSlide = slides[0];
      const style = window.getComputedStyle(firstSlide);
      const marginRight = parseFloat(style.marginRight) || 24; // default gap
      return firstSlide.offsetWidth + marginRight;
    }
    
    function updateCarousel(animate = true) {
      if (!animate) track.style.transition = 'none';
      else track.style.transition = 'transform 0.4s ease';
      
      const slideWidth = getSlideWidth();
      const maxIndex = slides.length - 1;
      currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
      
      let offset = -currentIndex * slideWidth;
      
      // ensure we don't scroll past last visible properly (snap)
      const containerWidth = container.offsetWidth;
      const maxOffset = -(track.scrollWidth - containerWidth);
      if (offset < maxOffset) offset = maxOffset;
      
      track.style.transform = `translateX(${offset}px)`;
      
      if (!animate) {
        // force reflow
        track.offsetHeight;
        track.style.transition = 'transform 0.4s ease';
      }
    }
    
    function moveNext() {
      const slideWidth = getSlideWidth();
      const containerWidth = container.offsetWidth;
      const maxIndex = slides.length - Math.floor(containerWidth / slideWidth);
      if (currentIndex < maxIndex) {
        currentIndex++;
      } else {
        currentIndex = maxIndex;
      }
      updateCarousel(true);
    }
    
    function movePrev() {
      if (currentIndex > 0) {
        currentIndex--;
      } else {
        currentIndex = 0;
      }
      updateCarousel(true);
    }
    
    nextBtn.addEventListener('click', moveNext);
    prevBtn.addEventListener('click', movePrev);
    
    // Touch / swipe support
    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      const transform = window.getComputedStyle(track).transform;
      if (transform !== 'none') {
        const matrix = new DOMMatrix(transform);
        startTransform = matrix.m41;
      } else {
        startTransform = 0;
      }
      isDragging = true;
      track.style.transition = 'none';
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      let newTransform = startTransform + diff;
      
      // boundaries
      const maxTranslate = 0;
      const minTranslate = -(track.scrollWidth - container.offsetWidth);
      newTransform = Math.min(maxTranslate, Math.max(minTranslate, newTransform));
      track.style.transform = `translateX(${newTransform}px)`;
    }, { passive: false });
    
    container.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      
      const slideWidth = getSlideWidth();
      const endX = e.changedTouches[0].clientX;
      const diff = endX - startX;
      const threshold = slideWidth * 0.3;
      
      track.style.transition = 'transform 0.4s ease';
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          currentIndex = Math.max(0, currentIndex - 1);
        } else {
          const maxIndex = slides.length - Math.floor(container.offsetWidth / slideWidth);
          currentIndex = Math.min(maxIndex, currentIndex + 1);
        }
      }
      updateCarousel(true);
    });
    
    // mouse drag (optional but good)
    container.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      const transform = window.getComputedStyle(track).transform;
      startTransform = (transform !== 'none') ? new DOMMatrix(transform).m41 : 0;
      isDragging = true;
      track.style.transition = 'none';
      container.style.cursor = 'grabbing';
      e.preventDefault();
    });
    
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const diff = e.clientX - startX;
      let newTransform = startTransform + diff;
      const maxTranslate = 0;
      const minTranslate = -(track.scrollWidth - container.offsetWidth);
      newTransform = Math.min(maxTranslate, Math.max(minTranslate, newTransform));
      track.style.transform = `translateX(${newTransform}px)`;
    });
    
    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      container.style.cursor = 'grab';
      
      const slideWidth = getSlideWidth();
      const diff = e.clientX - startX;
      const threshold = slideWidth * 0.3;
      
      track.style.transition = 'transform 0.4s ease';
      if (Math.abs(diff) > threshold) {
        if (diff > 0) currentIndex = Math.max(0, currentIndex - 1);
        else {
          const maxIndex = slides.length - Math.floor(container.offsetWidth / slideWidth);
          currentIndex = Math.min(maxIndex, currentIndex + 1);
        }
      }
      updateCarousel(true);
    });
    
    // update on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateCarousel(false);
      }, 100);
    });
    
    // set initial
    setTimeout(() => updateCarousel(false), 50);
    container.style.cursor = 'grab';
  }

  // smooth scroll for anchor links (already html smooth, but prevent default for side links to close menu)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        // close menu if open
        if (sideMenu.classList.contains('active')) closeMenu();
      }
    });
  });

  // Also trigger AOS refresh on dynamic changes
  window.addEventListener('load', () => {
    if (typeof AOS !== 'undefined') AOS.refresh();
  });
  
})();