// Mobile Sidebar Toggle Script
// Get elements
const hamburgerMenu = document.getElementById('hamburgerMenu');
const sidebar = document.getElementById('dashboardSidebar');
const overlay = document.getElementById('sidebarOverlay');

// Toggle sidebar on hamburger click
if (hamburgerMenu && sidebar) {
    hamburgerMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
        hamburgerMenu.classList.toggle('active');
    });
}

// Close sidebar when clicking overlay
if (overlay && sidebar) {
    overlay.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        hamburgerMenu.classList.remove('active');
    });
}

// Close sidebar when clicking a link
const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
sidebarLinks.forEach(link => {
    link.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        hamburgerMenu.classList.remove('active');
    });
});

// Close sidebar on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        hamburgerMenu.classList.remove('active');
    }
});

// Prevent body scroll when sidebar is open
const updateBodyScroll = () => {
    if (sidebar && sidebar.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
};

hamburgerMenu?.addEventListener('click', updateBodyScroll);
overlay?.addEventListener('click', updateBodyScroll);
