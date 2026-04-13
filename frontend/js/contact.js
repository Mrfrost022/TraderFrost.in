// Country selector functionality with enhanced animations
function selectCountry(code, iso) {
    document.getElementById('countryCode').value = code;
    const selectedDiv = document.getElementById('countrySelected');
    selectedDiv.innerHTML = `
        <img src="https://flagcdn.com/w20/${iso}.png" alt="${iso.toUpperCase()}" style="width: 22px; height: 16px; object-fit: cover; border-radius: 3px; box-shadow: 0 2px 6px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1);">
        <span>${code}</span>
        <svg style="margin-left: auto; width: 12px; height: 12px; transition: transform 0.3s ease; color: #FF9933;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
    `;

    const dropdown = document.getElementById('countryDropdown');
    dropdown.style.display = 'none';
    selectedDiv.classList.remove('open');
    document.getElementById('countrySearch').value = '';
    filterCountries('');

    // Add success feedback
    selectedDiv.style.transform = 'scale(0.95)';
    setTimeout(() => {
        selectedDiv.style.transform = '';
    }, 150);
}

function filterCountries(searchTerm) {
    const options = document.querySelectorAll('.country-option');
    const term = searchTerm.toLowerCase();
    let visibleCount = 0;

    options.forEach((option, index) => {
        const countryName = option.querySelector('span').textContent.toLowerCase();
        const countryCode = option.dataset.code.toLowerCase();

        if (countryName.includes(term) || countryCode.includes(term)) {
            option.style.display = 'flex';
            option.style.animationDelay = `${visibleCount * 0.02}s`;
            visibleCount++;
        } else {
            option.style.display = 'none';
        }
    });
}

// Toggle dropdown with animation
function toggleDropdown() {
    const dropdown = document.getElementById('countryDropdown');
    const selected = document.getElementById('countrySelected');
    const isOpen = dropdown.style.display === 'block';

    if (isOpen) {
        dropdown.style.display = 'none';
        selected.classList.remove('open');
    } else {
        dropdown.style.display = 'block';
        selected.classList.add('open');
        // Focus search input when opening
        setTimeout(() => {
            document.getElementById('countrySearch').focus();
        }, 100);
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('countryDropdown');
    const selected = document.getElementById('countrySelected');

    if (dropdown && selected && !dropdown.contains(event.target) && !selected.contains(event.target)) {
        dropdown.style.display = 'none';
        selected.classList.remove('open');
    }
});

// Prevent dropdown close when clicking inside
document.getElementById('countryDropdown')?.addEventListener('click', function(event) {
    event.stopPropagation();
});

// Keyboard navigation
document.getElementById('countrySearch')?.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.getElementById('countryDropdown').style.display = 'none';
        document.getElementById('countrySelected').classList.remove('open');
    }
});
