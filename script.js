// ================================
// Event Navigation System
// ================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Get all elements
    const mainMenu = document.getElementById('mainMenu');
    const eventButtons = document.querySelectorAll('.event-button');
    const backButtons = document.querySelectorAll('.back-button');
    const eventSections = document.querySelectorAll('.event-section');
    
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
            
            // If calendar section, load events
            if (eventId === 'calendar') {
                loadCalendarEvents();
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
        
        // Scroll to top smoothly
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // ================================
    // Load Calendar Events from Official Site
    // ================================
    async function loadCalendarEvents() {
        const loadingEl = document.getElementById('calendarLoading');
        const errorEl = document.getElementById('calendarError');
        const contentEl = document.getElementById('calendarContent');
        
        try {
            // Show loading state
            loadingEl.style.display = 'block';
            errorEl.style.display = 'none';
            contentEl.style.display = 'none';
            
            // Attempt to fetch the calendar page
            const response = await fetch('https://communityhub.goodgamestudios.com/empire/event-plan/', {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'text/html',
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch calendar');
            }
            
            const html = await response.text();
            
            // Parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Try to extract event information
            // This is a simplified parser - adjust selectors based on actual page structure
            const events = extractEventsFromHTML(doc);
            
            if (events.length > 0) {
                displayCalendarEvents(events);
                loadingEl.style.display = 'none';
                contentEl.style.display = 'grid';
            } else {
                throw new Error('No events found');
            }
            
        } catch (error) {
            console.error('Calendar loading error:', error);
            // Show error state with fallback link
            loadingEl.style.display = 'none';
            errorEl.style.display = 'block';
        }
    }
    
    // ================================
    // Extract Events from HTML
    // ================================
    function extractEventsFromHTML(doc) {
        const events = [];
        
        // Try multiple potential selectors
        const selectors = [
            '.event-item',
            '.calendar-event',
            'article',
            '.post',
            '[class*="event"]',
            'table tr',
            '.entry-content > div',
            '.content-area li'
        ];
        
        for (const selector of selectors) {
            const elements = doc.querySelectorAll(selector);
            if (elements.length > 0) {
                elements.forEach(el => {
                    const text = el.textContent.trim();
                    
                    // Look for event patterns
                    const dateMatch = text.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}\s+\w+\s+\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i);
                    
                    // Check if text contains known event names
                    const eventNames = ['Samurai', 'Nomad', 'Berimond', 'Horizon', 'Outer Realms', 'Bloodcrow', 'War of Realms'];
                    const hasEventName = eventNames.some(name => text.toLowerCase().includes(name.toLowerCase()));
                    
                    if (dateMatch && hasEventName && text.length < 300) {
                        events.push({
                            name: text,
                            date: dateMatch[0],
                            status: determineEventStatus(text),
                            rawText: text
                        });
                    }
                });
                
                if (events.length > 0) break;
            }
        }
        
        return events;
    }
    
    // ================================
    // Determine Event Status
    // ================================
    function determineEventStatus(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('active') || lowerText.includes('now') || lowerText.includes('live')) {
            return 'active';
        } else if (lowerText.includes('upcoming') || lowerText.includes('soon') || lowerText.includes('next')) {
            return 'upcoming';
        } else if (lowerText.includes('ended') || lowerText.includes('finished') || lowerText.includes('past')) {
            return 'ended';
        }
        return 'upcoming';
    }
    
    // ================================
    // Display Calendar Events
    // ================================
    function displayCalendarEvents(events) {
        const contentEl = document.getElementById('calendarContent');
        contentEl.innerHTML = '';
        
        // Limit to reasonable number
        const displayEvents = events.slice(0, 20);
        
        displayEvents.forEach(event => {
            const card = document.createElement('div');
            card.className = 'calendar-event-card';
            
            // Clean up event name
            let eventName = event.rawText;
            const knownEvents = {
                'samurai': 'Samurai Invasion',
                'nomad': 'Nomad Invasion',
                'berimond': 'Berimond',
                'horizon': 'Beyond the Horizon',
                'outer realms': 'Outer Realms',
                'bloodcrow': 'Bloodcrow',
                'war of realms': 'War of Realms'
            };
            
            for (const [key, value] of Object.entries(knownEvents)) {
                if (eventName.toLowerCase().includes(key)) {
                    eventName = value;
                    break;
                }
            }
            
            card.innerHTML = `
                <div class="event-name">${eventName}</div>
                <div class="event-date">${event.date}</div>
                <span class="event-status ${event.status}">${event.status.toUpperCase()}</span>
            `;
            
            contentEl.appendChild(card);
        });
        
        // If no events were processed properly
        if (displayEvents.length === 0) {
            contentEl.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); grid-column: 1 / -1;">No upcoming events found. Please check the official calendar.</p>';
        }
    }
    
    // ================================
    // Event Button Clicks
    // ================================
    eventButtons.forEach(button => {
        button.addEventListener('click', function() {
            const eventId = this.getAttribute('data-event');
            showEventSection(eventId);
        });
        
        // Add hover effect
        button.addEventListener('mouseenter', function(e) {
            const overlay = this.querySelector('.button-overlay');
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            overlay.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(10, 10, 10, 0.3) 0%, rgba(10, 10, 10, 0.7) 100%)`;
        });
        
        button.addEventListener('mouseleave', function() {
            const overlay = this.querySelector('.button-overlay');
            overlay.style.background = 'linear-gradient(180deg, rgba(10, 10, 10, 0.4) 0%, rgba(10, 10, 10, 0.85) 100%)';
        });
    });
    
    // ================================
    // Back Button Clicks
    // ================================
    backButtons.forEach(button => {
        button.addEventListener('click', showMainMenu);
    });
    
    // ================================
    // Scroll to Top Button
    // ================================
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.innerHTML = '↑';
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #c9a961, #d4af37);
        color: #0a0a0a;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
        button.addEventListener('click', function() {
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