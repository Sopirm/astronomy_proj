/**
 * Advanced Space Effects JavaScript
 * Продвинутые космические эффекты для дашборда
 */

class SpaceEffects {
  constructor() {
    this.particles = [];
    this.mouseTrail = [];
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    this.init();
  }

  init() {
    this.createParticleSystem();
    this.initMouseEffects();
    this.initScrollEffects();
    this.initPageTransitions();
    this.initTypingEffects();
    
    console.log('✨ SpaceEffects инициализированы');
  }

  // ===== PARTICLE SYSTEM =====
  createParticleSystem() {
    if (this.isReducedMotion) return;
    
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);

    // Create floating particles
    for (let i = 0; i < 50; i++) {
      this.createParticle(particlesContainer);
    }

    // Continuously spawn new particles
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.createParticle(particlesContainer);
      }
    }, 2000);
  }

  createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random properties
    const size = Math.random() * 3 + 1;
    const opacity = Math.random() * 0.8 + 0.2;
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 5;
    
    // Random colors from neon palette
    const colors = ['#00d9ff', '#b084ff', '#00ff88', '#ff0080', '#ffff00'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.cssText = `
      left: ${Math.random() * 100}vw;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      opacity: ${opacity};
      animation: float-particle ${duration}s infinite linear;
      animation-delay: ${delay}s;
      box-shadow: 0 0 10px ${color};
    `;
    
    container.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, (duration + delay) * 1000);
  }

  // ===== MOUSE EFFECTS =====
  initMouseEffects() {
    if (this.isReducedMotion) return;

    let mouseX = 0;
    let mouseY = 0;
    let isMouseMoving = false;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseMoving = true;
      
      // Add point to trail
      this.mouseTrail.push({
        x: mouseX,
        y: mouseY,
        time: Date.now(),
        id: Math.random()
      });
      
      // Limit trail length
      if (this.mouseTrail.length > 15) {
        this.mouseTrail.shift();
      }
      
      // Remove old points
      this.mouseTrail = this.mouseTrail.filter(point => 
        Date.now() - point.time < 1000
      );

      clearTimeout(this.mouseStopTimer);
      this.mouseStopTimer = setTimeout(() => {
        isMouseMoving = false;
      }, 100);
    });

    // Parallax effect for cards
    document.addEventListener('mousemove', (e) => {
      const cards = document.querySelectorAll('.space-card, .metric-card');
      
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        
        if (Math.abs(x) < 1 && Math.abs(y) < 1) {
          card.style.transform = `
            perspective(1000px)
            rotateX(${y * 5}deg)
            rotateY(${x * 5}deg)
            translateZ(10px)
          `;
        }
      });
    });

    // Reset transform on mouse leave
    document.addEventListener('mouseleave', () => {
      const cards = document.querySelectorAll('.space-card, .metric-card');
      cards.forEach(card => {
        card.style.transform = '';
      });
    });
  }

  // ===== SCROLL EFFECTS =====
  initScrollEffects() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate__animated', 'animate__fadeInUp');
          
          // Add stagger effect for multiple elements
          const siblings = Array.from(entry.target.parentNode.children);
          const index = siblings.indexOf(entry.target);
          entry.target.style.animationDelay = `${index * 0.1}s`;
        }
      });
    }, observerOptions);

    // Observe all space-cards
    document.querySelectorAll('.space-card:not(.animate__animated)').forEach(card => {
      observer.observe(card);
    });
  }

  // ===== PAGE TRANSITIONS =====
  initPageTransitions() {
    const links = document.querySelectorAll('a[href^="/"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        if (link.href === window.location.href) return;
        
        // Add transition effect
        document.body.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        document.body.style.opacity = '0.7';
        document.body.style.transform = 'scale(0.98)';
        
        // Show loading notification
        SpaceApp.showNotification('Переход между страницами...', 'info', 1000);
        
        setTimeout(() => {
          document.body.style.opacity = '1';
          document.body.style.transform = 'scale(1)';
        }, 300);
      });
    });

    // Page load animation
    window.addEventListener('load', () => {
      document.body.style.animation = 'page-enter 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  }

  // ===== TYPING EFFECTS =====
  initTypingEffects() {
    const typeElements = document.querySelectorAll('[data-type]');
    
    typeElements.forEach(element => {
      const text = element.textContent;
      const speed = parseInt(element.dataset.typeSpeed) || 50;
      
      element.textContent = '';
      
      let i = 0;
      const typeTimer = setInterval(() => {
        element.textContent += text.charAt(i);
        i++;
        
        if (i >= text.length) {
          clearInterval(typeTimer);
        }
      }, speed);
    });
  }

  // ===== UTILITY METHODS =====
  
  // Create ripple effect
  static createRipple(element, event) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: radial-gradient(circle, rgba(0, 217, 255, 0.6) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      transform: scale(0);
      animation: ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }

  // Shake animation
  static shake(element, intensity = 5) {
    element.style.animation = `shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)`;
    
    setTimeout(() => {
      element.style.animation = '';
    }, 500);
  }

  // Glow effect
  static addGlow(element, color = '#00d9ff', duration = 2000) {
    element.style.transition = 'box-shadow 0.3s ease';
    element.style.boxShadow = `0 0 20px ${color}80`;
    
    setTimeout(() => {
      element.style.boxShadow = '';
    }, duration);
  }

  // Create floating text
  static floatingText(text, x, y, color = '#00d9ff') {
    const floater = document.createElement('div');
    floater.textContent = text;
    floater.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      color: ${color};
      font-weight: 600;
      pointer-events: none;
      z-index: 1000;
      animation: float-up 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    `;
    
    document.body.appendChild(floater);
    
    setTimeout(() => floater.remove(), 2000);
  }
}

// ===== CSS ANIMATIONS =====
const additionalCSS = `
@keyframes page-enter {
  0% { 
    opacity: 0; 
    transform: translateY(20px) scale(0.95);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1);
  }
}

@keyframes ripple {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-${5}px); }
  20%, 40%, 60%, 80% { transform: translateX(${5}px); }
}

@keyframes float-up {
  0% { 
    opacity: 1; 
    transform: translateY(0) scale(1);
  }
  100% { 
    opacity: 0; 
    transform: translateY(-50px) scale(1.2);
  }
}

@keyframes cosmic-pulse {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.7;
    transform: scale(1.1);
    filter: brightness(1.2);
  }
}
`;

// Add CSS to document
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Initialize Space Effects when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.spaceEffects = new SpaceEffects();
  
  // Add ripple effect to all buttons
  document.querySelectorAll('button, .btn-cosmic-primary').forEach(button => {
    button.addEventListener('click', (e) => {
      SpaceEffects.createRipple(button, e);
    });
  });
});

// Export for global use
window.SpaceEffects = SpaceEffects;
