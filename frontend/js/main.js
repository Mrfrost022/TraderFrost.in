// Trader Frost Website JavaScript

// Page Loader Functionality
window.addEventListener('load', function() {
    // Hide loader when page is fully loaded
    setTimeout(() => {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }, 200);
});

// Show loader on link clicks for internal navigation
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip for anchor links, external links, javascript:void, mailto, tel
            if (!href || 
                href.startsWith('#') || 
                href.startsWith('javascript:') || 
                this.getAttribute('target') === '_blank' || 
                href.startsWith('http://') || 
                href.startsWith('https://') ||
                href.startsWith('mailto:') || 
                href.startsWith('tel:') ||
                href.startsWith('wa.me')) {
                return;
            }
            
            // Show loader for internal page navigation
            e.preventDefault();
            const loader = document.getElementById('pageLoader');
            if (loader) {
                loader.classList.remove('hidden');
            }
            
            // Navigate after short delay for smooth transition
            setTimeout(() => {
                window.location.href = href;
            }, 200);
        });
    });
});

// Custom Country Dropdown with Flag Images
document.addEventListener('DOMContentLoaded', function() {
    const countryDisplay = document.getElementById('countryDisplay');
    const countryDropdown = document.getElementById('countryDropdown');
    const countrySelect = document.getElementById('country');
    const countryOptions = document.querySelectorAll('.country-option');
    const selectedFlag = document.getElementById('selectedFlag');
    const selectedCode = document.getElementById('selectedCode');

    if (countryDisplay && countryDropdown) {
        // Toggle dropdown on click
        countryDisplay.addEventListener('click', function(e) {
            e.stopPropagation();
            countryDropdown.style.display = countryDropdown.style.display === 'none' ? 'block' : 'none';
        });

        // Handle country option selection
        countryOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                const code = this.dataset.code;
                const flag = this.dataset.flag;
                const text = this.textContent.trim();

                // Update display
                selectedFlag.src = flag;
                selectedCode.textContent = code;

                // Update hidden select
                countrySelect.value = code;

                // Close dropdown
                countryDropdown.style.display = 'none';
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!countryDisplay.contains(e.target) && !countryDropdown.contains(e.target)) {
                countryDropdown.style.display = 'none';
            }
        });
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#!') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add shadow on scroll
    if (currentScroll > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(255, 153, 51, 0.3)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
    
    lastScroll = currentScroll;
});

// Form validation and submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name')?.value;
        const email = document.getElementById('email')?.value;
        const country = document.getElementById('country')?.value;
        const mobile = document.getElementById('mobile')?.value;
        const subject = document.getElementById('subject')?.value;
        const message = document.getElementById('message')?.value;
        const terms = document.getElementById('terms')?.checked;
        
        // Basic validation
        if (!name || !email || !country || !mobile || !subject || !message) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Terms validation
        if (!terms) {
            showNotification('Please agree to receive WhatsApp updates', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Mobile validation (basic)
        const mobileRegex = /^[\d\s\-\(\)]+$/;
        if (!mobileRegex.test(mobile) || mobile.length < 6) {
            showNotification('Please enter a valid mobile number', 'error');
            return;
        }
        
        // If validation passes
        showNotification('Thank you! We will contact you soon on WhatsApp.', 'success');
        
        // Reset form
        this.reset();
        
        // Construct full WhatsApp number
        const whatsappNumber = country + mobile.replace(/\s/g, '');
        
        // Here you would typically send the data to a server
        console.log('Form submitted:', { name, email, country, mobile, whatsappNumber, subject, message, terms });
    });
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1.5rem 2rem;
        background: ${type === 'success' ? '#51cf66' : type === 'error' ? '#ff6b6b' : '#4dabf7'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-weight: 500;
        max-width: 400px;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards and stat cards
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .stat-card, .platform-card, .testimonial-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Mobile navigation controller (uses existing nav-hamburger + overlay in HTML)
document.addEventListener('DOMContentLoaded', () => {
    const navHamburger = document.getElementById('navHamburger');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');

    if (!navHamburger || !navLinks || !navOverlay) {
        return;
    }

    const closeNav = () => {
        navHamburger.classList.remove('active');
        navLinks.classList.remove('open');
        navOverlay.classList.remove('open');
        document.body.style.overflow = '';

        navLinks.querySelectorAll('.dropdown-menu.open').forEach(menu => {
            menu.classList.remove('open');
        });
    };

    const openNav = () => {
        navHamburger.classList.add('active');
        navLinks.classList.add('open');
        navOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    navHamburger.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) {
            closeNav();
        } else {
            openNav();
        }
    });

    navOverlay.addEventListener('click', closeNav);

    // Dropdown triggers - toggle menu without closing nav
    navLinks.querySelectorAll('.dropdown > a').forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            if (window.innerWidth > 900) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            const dropdownMenu = trigger.nextElementSibling;
            if (!dropdownMenu || !dropdownMenu.classList.contains('dropdown-menu')) {
                return;
            }

            const willOpen = !dropdownMenu.classList.contains('open');
            navLinks.querySelectorAll('.dropdown-menu.open').forEach(menu => {
                menu.classList.remove('open');
            });

            if (willOpen) {
                dropdownMenu.classList.add('open');
            }
        });
    });

    // Close nav when clicking destination links (not dropdown toggles)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (event) => {
            // Don't close if this is a dropdown toggle
            if (link.parentElement.classList.contains('dropdown') && 
                link.nextElementSibling && 
                link.nextElementSibling.classList.contains('dropdown-menu')) {
                return;
            }
            
            if (window.innerWidth <= 900) {
                closeNav();
            }
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) {
            closeNav();
        }
    });
});

// Counter animation for stats
function animateCounter(element) {
    const target = element.textContent;
    const isNumber = /^\d+/.test(target);
    
    if (isNumber) {
        const number = parseInt(target);
        const duration = 2000; // 2 seconds
        const increment = number / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= number) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + target.replace(/^\d+/, '');
            }
        }, 16);
    }
}

// Observe stat cards for counter animation
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            const h3 = entry.target.querySelector('h3');
            if (h3) {
                animateCounter(h3);
                entry.target.classList.add('counted');
            }
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.stat-card').forEach(card => {
        statObserver.observe(card);
    });
});

// Batch selection helper
const batchSelect = document.getElementById('batch');
if (batchSelect) {
    batchSelect.addEventListener('change', function() {
        const messageField = document.getElementById('message');
        if (this.value && messageField && !messageField.value) {
            const batchMessages = {
                'beginner': 'I am interested in the Beginner Batch. I am new to trading and want to learn the fundamentals.',
                'advanced': 'I am interested in the Advanced Batch. I have some trading experience and want to improve my skills.',
                'pro': 'I am interested in the Pro Trader Batch. I am serious about becoming a professional trader.',
                'custom': 'I am interested in Custom Mentorship. I would like personalized one-on-one guidance.'
            };
            
            if (batchMessages[this.value]) {
                messageField.value = batchMessages[this.value];
            }
        }
    });
}

// Add active state to navigation
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
    const linkPage = link.getAttribute('href').split('#')[0];
    if (linkPage && linkPage === currentPage) {
        link.style.color = '#FF9933';
        link.style.fontWeight = '600';
    }
});

console.log('Trader Frost Website Loaded Successfully! 🚀');

// ============================================
// ADVANCED SEARCH FUNCTIONALITY
// ============================================

// Fixed Search Data - Only courses.html and psychology.html
const searchData = [
    // Courses (courses.html)
    {
        title: "Beginner Batch Course",
        description: "Learn trading from scratch with our structured 6-week beginner course covering basics and fundamentals.",
        url: "courses.html#courses",
        category: "Courses",
        keywords: ["beginner batch", "beginner course", "6-week course", "starter course", "new learner", "batch enrollment"]
    },
    {
        title: "Advanced Batch Course",
        description: "Intensive 8-week program for experienced learners with live sessions and advanced techniques.",
        url: "courses.html#courses",
        category: "Courses",
        keywords: ["advanced batch", "advanced course", "8-week program", "intensive course", "experienced level", "batch program"]
    },
    {
        title: "Pro Trader Batch Course",
        description: "Elite 12-week professional program for serious learners seeking mastery.",
        url: "courses.html#courses",
        category: "Courses",
        keywords: ["pro batch", "professional course", "elite program", "12-week batch", "master program", "pro level"]
    },
    {
        title: "Custom Mentorship Program",
        description: "One-on-one personalized coaching program with customized curriculum and dedicated support.",
        url: "courses.html#courses",
        category: "Courses",
        keywords: ["mentorship", "coaching program", "one-on-one", "personalized program", "custom curriculum", "private coaching"]
    },

    // Psychology (psychology.html)
    {
        title: "Emotional Mastery Module",
        description: "Learn emotional control techniques and mental frameworks for better decision-making.",
        url: "psychology.html#psychology",
        category: "Psychology",
        keywords: ["emotional mastery", "emotional module", "mental control", "emotions course", "mastery program", "emotional training"]
    },
    {
        title: "Discipline & Consistency Module",
        description: "Build strong habits and rule-based systems for consistent performance.",
        url: "psychology.html#psychology",
        category: "Psychology",
        keywords: ["discipline module", "consistency course", "habit building", "discipline training", "systematic approach", "consistency program"]
    },
    {
        title: "Risk Psychology Module",
        description: "Understand risk management mindset and develop healthy attitudes toward losses.",
        url: "psychology.html#psychology",
        category: "Psychology",
        keywords: ["risk module", "risk psychology", "loss management", "risk mindset", "psychology course", "risk training"]
    },
    {
        title: "5 Pillars Framework",
        description: "Complete framework covering five essential principles for long-term success.",
        url: "psychology.html#psychology",
        category: "Psychology",
        keywords: ["5 pillars", "pillars framework", "success framework", "five principles", "pillars course", "framework program"]
    }
];

// DOM Elements
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

// Handle Search Button Click - Redirect to search results page
const isPagesPath = window.location.pathname.replace(/\\/g, '/').includes('/pages/');
const searchResultsPath = isPagesPath ? 'search-results.html' : 'pages/search-results.html';
const indexPagePath = isPagesPath ? '../index.html' : 'index.html';

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query && query.length >= 2) {
            window.location.href = `${searchResultsPath}?q=${encodeURIComponent(query)}`;
        }
    });
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        const results = filterSearchData(query);
        renderSearchDropdown(results, query);
    });
    
    searchInput.addEventListener('focus', (e) => {
        const query = e.target.value.trim();
        const results = filterSearchData(query);
        renderSearchDropdown(results, query);
    });
}
// Handle Enter Key in Search Input - Redirect to search results page
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query && query.length >= 2) {
                window.location.href = `${searchResultsPath}?q=${encodeURIComponent(query)}`;
            }
        }
    });
}

// Search Dropdown (Suggestions)
let searchDropdown;
function ensureSearchDropdown() {
    if (!searchInput) return null;
    if (searchDropdown) return searchDropdown;

    const container = searchInput.parentElement;
    if (!container) return null;

    searchDropdown = document.createElement('div');
    searchDropdown.style.position = 'absolute';
    searchDropdown.style.top = 'calc(100% + 8px)';
    searchDropdown.style.left = '0';
    searchDropdown.style.right = '0';
    searchDropdown.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)';
    searchDropdown.style.border = '1px solid rgba(255,153,51,0.2)';
    searchDropdown.style.borderRadius = '12px';
    searchDropdown.style.boxShadow = '0 12px 30px rgba(0,0,0,0.5)';
    searchDropdown.style.padding = '0.5rem';
    searchDropdown.style.display = 'none';
    searchDropdown.style.zIndex = '999';
    searchDropdown.id = 'searchDropdown';

    container.appendChild(searchDropdown);
    return searchDropdown;
}

function renderSearchDropdown(results, query) {
    const dropdown = ensureSearchDropdown();
    if (!dropdown) return;

    // Clear previous results
    dropdown.innerHTML = '';

    if (!query || query.length < 2) {
        dropdown.style.display = 'none';
        return;
    }

    if (results.length === 0) {
        dropdown.innerHTML = `
            <div class="search-item no-result" style="display: block; padding: 0.75rem 0.9rem; text-decoration: none; border-radius: 8px; color: #888; cursor: default; transition: all 0.2s ease;">
                <div style="font-size: 0.95rem; font-weight: 600;">No results found</div>
                <div style="font-size: 0.8rem; color: #666; margin-top: 0.2rem;">Try searching for courses or psychology topics</div>
            </div>
        `;
        dropdown.style.display = 'block';
        return;
    }

    const items = results.slice(0, 6).map(item => {
        const resolvedUrl = isPagesPath ? item.url : `pages/${item.url}`;
        return `
            <a href="${resolvedUrl}" style="display: block; padding: 0.75rem 0.9rem; text-decoration: none; border-radius: 8px; color: #fff; transition: all 0.2s ease;" 
               onmouseover="this.style.background='rgba(255,153,51,0.12)'; this.style.color='#FF9933';" 
               onmouseout="this.style.background='transparent'; this.style.color='#fff';">
                <div style="font-size: 0.95rem; font-weight: 600;">${item.title}</div>
                <div style="font-size: 0.8rem; color: #aaa; margin-top: 0.2rem;">${item.description}</div>
            </a>
        `;
    }).join('');

    dropdown.innerHTML = items;
    dropdown.style.display = 'block';
}

function filterSearchData(query) {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    const words = lowerQuery.split(' ').filter(w => w.length > 0);

    const results = searchData.map(item => {
        let score = 0;
        const searchText = `${item.title} ${item.description} ${item.keywords.join(' ')}`.toLowerCase();

        if (searchText.includes(lowerQuery)) score += 100;
        if (item.title.toLowerCase().includes(lowerQuery)) score += 80;
        if (item.keywords.some(kw => kw.toLowerCase().includes(lowerQuery))) score += 60;

        const allWordsPresent = words.every(word => searchText.includes(word));
        if (allWordsPresent) score += 40;

        words.forEach(word => {
            if (word.length < 3) return;
            if (item.title.toLowerCase().includes(word)) score += 20;
            if (item.description.toLowerCase().includes(word)) score += 10;
            if (item.keywords.some(kw => kw.toLowerCase().includes(word))) score += 15;
        });

        return score > 0 ? { ...item, score } : null;
    }).filter(Boolean);

    results.sort((a, b) => b.score - a.score);
    return results;
}

// Advanced Search Algorithm
function performSearch(query) {
    if (!query || query.length < 2) {
        return;
    }

    const results = filterSearchData(query);
    displayResults(results, query);
}

// Levenshtein Distance for fuzzy matching
function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

// Highlight search terms in text
function highlightText(text, query) {
    const words = query.toLowerCase().split(' ').filter(w => w.length >= 3);
    let highlightedText = text;
    
    words.forEach(word => {
        const regex = new RegExp(`(${word})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<span class="search-highlight">$1</span>');
    });
    
    return highlightedText;
}

// Display search results
function displayResults(results, query) {
    const searchResults = document.getElementById('searchResults');
    const searchQueryDisplay = document.getElementById('searchQuery');
    
    if (!searchResults) return;
    
    // Apply category filters if on search results page
    let filteredResults = results;
    const filterCourses = document.getElementById('filterCourses');
    const filterPsychology = document.getElementById('filterPsychology');
    
    if (filterCourses && filterPsychology) {
        filteredResults = results.filter(item => {
            const isCourse = item.category === 'Courses' && filterCourses.checked;
            const isPsych = item.category === 'Psychology' && filterPsychology.checked;
            return isCourse || isPsych;
        });
    }
    
    // Update query display
    if (searchQueryDisplay) {
        searchQueryDisplay.textContent = `Found ${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''} for "${query}"`;
    }
    
    if (filteredResults.length === 0) {
        searchResults.innerHTML = `
            <div style="text-align: center; padding: 6rem 2rem; color: #888;">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 2rem; opacity: 0.5;">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="11" y1="16" x2="11.01" y2="16"></line>
                </svg>
                <h3 style="color: #aaa; font-size: 1.8rem; margin-bottom: 0.5rem; font-weight: 600;">No results found</h3>
                <p style="color: #666; font-size: 1rem;">Try different keywords or check spelling</p>
            </div>
        `;
        return;
    }
    
    const resultsHTML = filteredResults.map((result, index) => {
        const highlightedTitle = highlightText(result.title, query);
        const highlightedDesc = highlightText(result.description.substring(0, 220) + '...', query);
        const resolvedLink = isPagesPath ? result.url : `pages/${result.url}`;
        
        return `
            <div style="background: linear-gradient(135deg, rgba(255,153,51,0.08), rgba(139,0,0,0.04)); border: 1px solid rgba(255,153,51,0.15); padding: 2rem; margin-bottom: 1.5rem; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden;" 
                onmouseover="this.style.background='linear-gradient(135deg, rgba(255,153,51,0.12), rgba(139,0,0,0.08))'; this.style.borderColor='rgba(255,153,51,0.4)'; this.style.transform='translateX(8px)'; this.style.boxShadow='0 10px 30px rgba(255,153,51,0.15)';" 
                onmouseout="this.style.background='linear-gradient(135deg, rgba(255,153,51,0.08), rgba(139,0,0,0.04))'; this.style.borderColor='rgba(255,153,51,0.15)'; this.style.transform='translateX(0)'; this.style.boxShadow='none';"
                onclick="window.location.href='${resolvedLink}'">
                <div style="position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg, #FF9933, #ff6600);\"></div>
                
                <div style="margin-left: 0.5rem;">
                    <span style="display: inline-block; background: linear-gradient(135deg, rgba(255,153,51,0.25), rgba(255,153,51,0.15)); color: #FF9933; padding: 0.4rem 1.2rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.8rem; letter-spacing: 0.5px; border: 1px solid rgba(255,153,51,0.3);">
                        ${result.category}
                    </span>
                    
                    <div style="color: #FF9933; font-size: 1.35rem; font-weight: 700; margin-bottom: 0.8rem; line-height: 1.4;">
                        ${highlightedTitle}
                    </div>
                    
                    <div style="color: #ccc; line-height: 1.8; margin-bottom: 1rem; font-size: 1rem;">
                        ${highlightedDesc}
                    </div>
                    
                    <a href="${resolvedLink}" style="display: inline-block; color: #FF9933; font-size: 0.95rem; text-decoration: none; font-weight: 600; padding: 0.5rem 1rem; background: rgba(255,153,51,0.1); border-radius: 6px; transition: all 0.3s ease; border: 1px solid rgba(255,153,51,0.3);" 
                        onmouseover="this.style.background='rgba(255,153,51,0.2)'; this.style.boxShadow='0 6px 15px rgba(255,153,51,0.2)';" 
                        onmouseout="this.style.background='rgba(255,153,51,0.1)'; this.style.boxShadow='none';"
                        onclick="event.stopPropagation();">
                        View Details →
                    </a>
                </div>
            </div>
        `;
    }).join('');
    
    searchResults.innerHTML = resultsHTML;
}

// Display placeholder (not used in new design, but keeping for compatibility)
function displayPlaceholder() {
    // No longer needed with new design
}

// Navigate to section and close modal
function navigateToSection(link, section) {
    // Navigate to link
    window.location.href = link;
    
    // Scroll to section after navigation
    setTimeout(() => {
        const targetSection = document.querySelector(link);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
}

console.log('✅ Advanced Search System Initialized');

        // Function to update market prices with live data
        async function updateMarketPrices() {
            try {
                // Fetch all crypto prices including Bitcoin
                const cryptoResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
                const cryptoData = await cryptoResponse.json();

                // Fetch Forex rates from Frankfurter API (more reliable)
                const forexResponse = await fetch('https://api.frankfurter.app/latest?from=USD');
                const forexData = await forexResponse.json();

                console.log('Forex Data:', forexData);
                console.log('Crypto Data:', cryptoData);

                // Update EUR/USD
                if (forexData.rates && forexData.rates.EUR) {
                    const eurRate = (1 / forexData.rates.EUR).toFixed(4);
                    const prevEur = parseFloat(document.getElementById('eurusd')?.querySelector('.price')?.textContent) || 1.0875;
                    const isUp = parseFloat(eurRate) > prevEur;
                    updateTicker('eurusd', eurRate, isUp);
                    updateTicker('eurusd2', eurRate, isUp);
                }

                // Update GBP/USD
                if (forexData.rates && forexData.rates.GBP) {
                    const gbpRate = (1 / forexData.rates.GBP).toFixed(4);
                    const prevGbp = parseFloat(document.getElementById('gbpusd')?.querySelector('.price')?.textContent) || 1.2745;
                    const isUp = parseFloat(gbpRate) > prevGbp;
                    updateTicker('gbpusd', gbpRate, isUp);
                    updateTicker('gbpusd2', gbpRate, isUp);
                }

                // Update USD/JPY
                if (forexData.rates && forexData.rates.JPY) {
                    const jpyRate = forexData.rates.JPY.toFixed(2);
                    const prevJpy = parseFloat(document.getElementById('usdjpy')?.querySelector('.price')?.textContent.replace(',', '')) || 147.82;
                    const isUp = parseFloat(jpyRate) > prevJpy;
                    updateTicker('usdjpy', jpyRate, isUp);
                    updateTicker('usdjpy2', jpyRate, isUp);
                }

                // Update BTC/USD
                if (cryptoData.bitcoin) {
                    const btcPrice = Math.floor(cryptoData.bitcoin.usd).toLocaleString();
                    const btcChange = cryptoData.bitcoin.usd_24h_change || 0;
                    updateTicker('btcusd', btcPrice, btcChange > 0, Math.abs(btcChange).toFixed(2) + '%');
                    updateTicker('btcusd2', btcPrice, btcChange > 0, Math.abs(btcChange).toFixed(2) + '%');
                }

                // Fetch Gold price from alternative API
                const goldResponse = await fetch('https://api.metals.live/v1/spot/gold');
                const goldData = await goldResponse.json();
                if (goldData && goldData[0]) {
                    const goldPrice = goldData[0].price.toFixed(2);
                    const prevGold = parseFloat(document.getElementById('xauusd')?.querySelector('.price')?.textContent.replace(',', '')) || 2045.50;
                    const isUp = parseFloat(goldPrice) > prevGold;
                    updateTicker('xauusd', goldPrice, isUp);
                }

                // S&P500 - use simulated movement (real-time stock data requires paid APIs)
                const spxElement = document.getElementById('spx');
                if (spxElement) {
                    const currentSpx = parseFloat(spxElement.querySelector('.price')?.textContent.replace(',', '')) || 4892.45;
                    const change = (Math.random() - 0.5) * 10;
                    const newSpx = (currentSpx + change).toFixed(2);
                    updateTicker('spx', parseFloat(newSpx).toLocaleString(), change > 0, Math.abs(change).toFixed(2));
                }

            } catch (error) {
                console.error('Error fetching market data:', error);
            }
        }

        function updateTicker(id, price, isUp, changeValue = null) {
            const element = document.getElementById(id);
            if (!element) return;

            const priceSpan = element.querySelector('.price');
            const changeSpan = element.querySelector('.change');

            if (priceSpan) priceSpan.textContent = price;

            if (changeSpan) {
                const arrow = isUp ? '▲' : '▼';
                const change = changeValue || (Math.random() * 0.05).toFixed(4);
                const sign = isUp ? '+' : '-';
                changeSpan.textContent = `${arrow} ${sign}${typeof changeValue === 'string' ? changeValue : Math.abs(change)}`;
            }

            element.style.color = isUp ? '#51cf66' : '#ff6b6b';
        }

        // Update prices on page load
        updateMarketPrices();

        // Update prices every 60 seconds
        setInterval(updateMarketPrices, 60000);

        let currentSlideIndex = 0;
        let autoSlideInterval;

        function showSlide(index) {
            const slides = document.querySelectorAll('.carousel-slide');
            const dots = document.querySelectorAll('.carousel-dot');
            
            if (index >= slides.length) currentSlideIndex = 0;
            if (index < 0) currentSlideIndex = slides.length - 1;
            
            slides.forEach((slide, i) => {
                slide.style.opacity = i === currentSlideIndex ? '1' : '0';
                slide.style.zIndex = i === currentSlideIndex ? '2' : '1';
            });
            
            dots.forEach((dot, i) => {
                if (i === currentSlideIndex) {
                    dot.style.background = '#FF9933';
                    dot.style.boxShadow = '0 0 10px rgba(255,153,51,0.6)';
                    dot.style.transform = 'scale(1.2)';
                } else {
                    dot.style.background = 'rgba(255,255,255,0.3)';
                    dot.style.boxShadow = 'none';
                    dot.style.transform = 'scale(1)';
                }
            });
        }

        function nextSlide() {
            currentSlideIndex++;
            showSlide(currentSlideIndex);
        }

        function currentSlide(index) {
            currentSlideIndex = index;
            showSlide(currentSlideIndex);
            resetAutoSlide();
        }

        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            autoSlideInterval = setInterval(nextSlide, 3500);
        }

        // Start auto-sliding when page loads
        document.addEventListener('DOMContentLoaded', function() {
            showSlide(currentSlideIndex);
            autoSlideInterval = setInterval(nextSlide, 3500);
            
            // About Section Carousel
            initAboutCarousel();
            
            // Fade-in animation on scroll
            setupScrollAnimation();
        });
        
        // About Carousel functionality
        let aboutSlideIndex = 0;
        let aboutAutoSlideInterval;
        
        function initAboutCarousel() {
            const aboutSlides = document.querySelectorAll('.about-carousel-slide');
            if (aboutSlides.length === 0) return;
            
            showAboutSlide(aboutSlideIndex);
            aboutAutoSlideInterval = setInterval(nextAboutSlide, 4000);
        }
        
        function showAboutSlide(index) {
            const slides = document.querySelectorAll('.about-carousel-slide');
            if (slides.length === 0) return;
            
            if (index >= slides.length) aboutSlideIndex = 0;
            if (index < 0) aboutSlideIndex = slides.length - 1;
            
            slides.forEach((slide, i) => {
                slide.style.opacity = i === aboutSlideIndex ? '1' : '0';
                slide.style.zIndex = i === aboutSlideIndex ? '2' : '1';
            });
        }
        
        function nextAboutSlide() {
            aboutSlideIndex++;
            showAboutSlide(aboutSlideIndex);
        }
        
        // Scroll animation for About section
        function setupScrollAnimation() {
            const aboutSection = document.querySelector('.about-section');
            if (!aboutSection) return;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            observer.observe(aboutSection);
        }

        // Page Loader Script
        window.addEventListener('load', function() {
            // Hide loader when page is fully loaded
            setTimeout(() => {
                document.getElementById('pageLoader').classList.add('hidden');
            }, 200);
        });

        // Show loader on link clicks
        document.addEventListener('DOMContentLoaded', function() {
            const links = document.querySelectorAll('a[href]');
            
            links.forEach(link => {
                link.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    
                    // Skip for anchor links, external links, and javascript:void
                    if (href.startsWith('#') || href.startsWith('javascript:') || 
                        this.getAttribute('target') === '_blank' || 
                        href.startsWith('http://') || href.startsWith('https://') ||
                        href.startsWith('mailto:') || href.startsWith('tel:')) {
                        return;
                    }
                    
                    // Show loader for internal page navigation
                    e.preventDefault();
                    const loader = document.getElementById('pageLoader');
                    loader.classList.remove('hidden');
                    
                    // Navigate after short delay
                    setTimeout(() => {
                        window.location.href = href;
                    }, 200);
                });
            });
        });
