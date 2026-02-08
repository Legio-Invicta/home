// ================================
// Player Name Management
// ================================
let playerId = null;
let playerName = null;

// Generate unique player ID
function generatePlayerId() {
    return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get or create player ID from cookie
function getPlayerId() {
    let id = getCookie('playerId');
    if (!id) {
        id = generatePlayerId();
        setCookie('playerId', id, 365);
    }
    return id;
}

// Get player name from cookie
function getPlayerName() {
    return getCookie('playerName') || 'Player';
}

// Save player name to cookie
function savePlayerName(name) {
    setCookie('playerName', name, 365);
}

// Cookie utilities
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Initialize player name system
function initializePlayerName() {
    playerId = getPlayerId();
    playerName = getPlayerName();
    
    const nameDisplay = document.getElementById('playerName');
    const nameInput = document.getElementById('playerNameInput');
    
    nameDisplay.textContent = playerName;
    
    // Click to edit name
    nameDisplay.addEventListener('click', function() {
        nameDisplay.style.display = 'none';
        nameInput.style.display = 'inline-block';
        nameInput.value = playerName;
        nameInput.focus();
        nameInput.select();
    });
    
    // Save on Enter or blur
    function saveName() {
        const newName = nameInput.value.trim();
        if (newName && newName !== playerName) {
            playerName = newName;
            savePlayerName(newName);
            nameDisplay.textContent = newName;
        }
        nameInput.style.display = 'none';
        nameDisplay.style.display = 'inline-block';
    }
    
    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveName();
        }
    });
    
    nameInput.addEventListener('blur', saveName);
}

// ================================
// Event Navigation System
// ================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize player name system
    initializePlayerName();
    
    // Get all elements
    const mainMenu = document.getElementById('mainMenu');
    const eventButtons = document.querySelectorAll('.event-button');
    const backButtons = document.querySelectorAll('.back-button');
    const eventSections = document.querySelectorAll('.event-section');
    const bulletinBoardDisplay = document.getElementById('bulletinBoardDisplay');
    const logoToMenu = document.getElementById('logoToMenu');
    
    // ================================
    // Logo Click to Return to Menu
    // ================================
    logoToMenu.addEventListener('click', function() {
        showMainMenu();
    });
    
    logoToMenu.style.cursor = 'pointer';
    
    // ================================
    // Show Event Section
    // ================================
    function showEventSection(eventId) {
        // Hide main menu
        mainMenu.classList.remove('active');
        
        // Hide all event sections
        eventSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected event section
        const targetSection = document.getElementById(eventId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // For event pages (not chat, board-editor, calendar, rules), hide chat and bulletin board
            const hideableSections = ['horizon', 'outer-realms', 'nomad', 'samurai', 'berimond'];
            if (hideableSections.includes(eventId)) {
                bulletinBoardDisplay.style.display = 'none';
            } else {
                // Show bulletin board for menu, chat, board-editor, etc.
                bulletinBoardDisplay.style.display = 'block';
            }
            
            // Scroll to top smoothly
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
    
    // ================================
    // Show Main Menu
    // ================================
    function showMainMenu() {
        // Hide all event sections
        eventSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show main menu
        mainMenu.classList.add('active');
        
        // Show bulletin board when returning to menu
        bulletinBoardDisplay.style.display = 'block';
        
        // Scroll to top smoothly
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // ================================
    // Event Button Clicks
    // ================================
    eventButtons.forEach(button => {
        button.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event');
            
            // Special handling for calendar - just open link
            if (eventId === 'calendar') {
                // The calendar section now just shows a link
                showEventSection(eventId);
                return;
            }
            
            if (eventId) {
                showEventSection(eventId);
            }
        });
        
        // Hover effect
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // ================================
    // Back Button Clicks
    // ================================
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            showMainMenu();
        });
    });
    
    // ================================
    // Image Fallback System
    // ================================
    function setupImageFallbacks() {
        // Check all images and apply fallback styling if image doesn't exist
        const imagesToCheck = [
            { selector: '.back-button', imgPath: 'img/bouton-retour.png', className: 'back-button' },
            { selector: '.horizon-button', imgPath: 'img/horizon-button.png', className: 'horizon-button' },
            { selector: '.samurai-button', imgPath: 'img/samurai-button.png', className: 'samurai-button' },
            { selector: '.outer-realms-button', imgPath: 'img/outer-realms-button.png', className: 'outer-realms-button' },
            { selector: '.berimond-button', imgPath: 'img/berimond-button.png', className: 'berimond-button' },
            { selector: '.nomad-button', imgPath: 'img/nomad-button.png', className: 'nomad-button' },
            { selector: '.calendar-button', imgPath: 'img/calendar-button.png', className: 'calendar-button' },
            { selector: '.rules-button', imgPath: 'img/rules-button.png', className: 'rules-button' },
            { selector: '.board-button', imgPath: 'img/board-button.png', className: 'board-button' },
            { selector: '.chat-button', imgPath: 'img/chat-button.png', className: 'chat-button' }
        ];
        
        imagesToCheck.forEach(item => {
            const elements = document.querySelectorAll(item.selector);
            elements.forEach(element => {
                checkImageExists(item.imgPath, function(exists) {
                    if (exists) {
                        element.style.backgroundImage = `url('${item.imgPath}')`;
                        element.style.backgroundSize = 'cover';
                        element.style.backgroundPosition = 'center';
                    }
                    // If image doesn't exist, CSS default background will be used
                });
            });
        });
    }
    
    function checkImageExists(url, callback) {
        const img = new Image();
        img.onload = function() { callback(true); };
        img.onerror = function() { callback(false); };
        img.src = url;
    }
    
    // Run image fallback system
    setupImageFallbacks();
    
    // ================================
    // Scroll to Top Button
    // ================================
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--color-primary);
        color: var(--color-bg-dark);
        border: none;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        font-weight: bold;
    `;
    document.body.appendChild(scrollToTopBtn);
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.visibility = 'visible';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.visibility = 'hidden';
        }
    });
    
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    scrollToTopBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    
    scrollToTopBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
    
    // ================================
    // Intersection Observer for animations
    // ================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe feature boxes
    const featureBoxes = document.querySelectorAll('.feature-box');
    featureBoxes.forEach((box, index) => {
        box.style.opacity = '0';
        box.style.transform = 'translateY(30px)';
        box.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(box);
    });
    
    // Observe info blocks
    const infoBlocks = document.querySelectorAll('.info-block');
    infoBlocks.forEach((block, index) => {
        block.style.opacity = '0';
        block.style.transform = 'translateX(-30px)';
        block.style.transition = `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`;
        observer.observe(block);
    });
    
    // ================================
    // Enhanced button interactions
    // ================================
    const allButtons = document.querySelectorAll('button, .calendar-link');
    
    allButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            // Ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                transform: scale(0);
                animation: rippleEffect 0.6s ease-out;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleEffect {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes twinkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    // ================================
    // Particle effects
    // ================================
    function createParticle() {
        const particles = document.querySelector('.particles');
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(201, 169, 97, 0.5);
            border-radius: 50%;
            pointer-events: none;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: twinkle ${2 + Math.random() * 3}s ease-in-out infinite;
        `;
        particles.appendChild(particle);
        
        setTimeout(() => particle.remove(), 5000);
    }
    
    setInterval(createParticle, 500);
    
    // ================================
    // Keyboard navigation
    // ================================
    document.addEventListener('keydown', function(e) {
        // ESC key returns to main menu
        if (e.key === 'Escape') {
            const anyEventActive = Array.from(eventSections).some(section => 
                section.classList.contains('active')
            );
            
            if (anyEventActive) {
                showMainMenu();
            }
        }
    });
    
    // ================================
    // Console message
    // ================================
    console.log('%c⚔️ Legio Invicta - Goodgame Empire Guide ⚔️', 
        'font-size: 20px; font-weight: bold; color: #c9a961; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);');
    console.log('%cWelcome to the events guide!', 
        'font-size: 14px; color: #cccccc;');
    console.log('%cFor questions, contact alliance leaders in-game.', 
        'font-size: 12px; color: #999999;');
    
    // ================================
    // Performance optimization
    // ================================
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Recalculate any necessary positions
        }, 250);
    });
    
    // ================================
    // Image lazy loading fallback
    // ================================
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    }
    
    // ================================
    // Smooth scroll polyfill for older browsers
    // ================================
    if (!('scrollBehavior' in document.documentElement.style)) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js';
        document.head.appendChild(script);
    }
});

// ================================
// Additional utility functions
// ================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export player info for Firebase to use
window.getPlayerInfo = function() {
    return {
        id: playerId,
        name: playerName
    };
};