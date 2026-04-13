// Registration Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('regEmail');
    const mobileInput = document.getElementById('mobileNumber');
    const passwordInput = document.getElementById('regPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');

    // Handle form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get input values
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();
        const mobile = mobileInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const termsAccepted = termsCheckbox.checked;

        // Validate inputs
        if (!firstName || !lastName || !email || !mobile || !password || !confirmPassword) {
            console.warn('Please fill in all fields');
            return;
        }

        if (!termsAccepted) {
            console.warn('Please accept the Terms & Conditions');
            return;
        }

        if (!isValidEmail(email)) {
            console.warn('Invalid email format');
            return;
        }

        if (!isValidMobile(mobile)) {
            console.warn('Invalid mobile number. Please enter a valid phone number.');
            return;
        }

        if (password.length < 6) {
            console.warn('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            console.warn('Passwords do not match');
            return;
        }

        // Log registration data to console (placeholder for API call)
        console.log('%c[REGISTRATION ATTEMPT]', 'color: #FF9933; font-weight: bold;');
        console.log('%cFirst Name:', 'color: #FF9933; font-weight: bold;', firstName);
        console.log('%cLast Name:', 'color: #FF9933; font-weight: bold;', lastName);
        console.log('%cEmail:', 'color: #FF9933; font-weight: bold;', email);
        console.log('%cMobile Number:', 'color: #FF9933; font-weight: bold;', mobile);
        console.log('%cPassword:', 'color: #FF9933; font-weight: bold;', password);
        console.log('%cTerms Accepted:', 'color: #FF9933; font-weight: bold;', termsAccepted);
        console.log('%c[This is a placeholder. Future API call will be implemented here]', 'color: #aaaaaa; font-style: italic;');

        // Clear form
        registerForm.reset();

        // Optional: Show success message
        console.log('%c✓ Account created successfully', 'color: #4CAF50; font-weight: bold;');
    });

    // Add input event listeners for real-time feedback
    emailInput.addEventListener('input', function() {
        const email = this.value.trim();
        if (email && !isValidEmail(email)) {
            console.warn('Invalid email format');
        }
    });

    mobileInput.addEventListener('input', function() {
        const mobile = this.value.trim();
        if (mobile && !isValidMobile(mobile)) {
            console.warn('Invalid mobile number. Please enter a valid phone number.');
        }
    });

    passwordInput.addEventListener('input', function() {
        const password = this.value;
        if (password && password.length < 6) {
            console.warn('Password should be at least 6 characters');
        }
    });

    confirmPasswordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        const confirmPassword = this.value;
        if (password && confirmPassword && password !== confirmPassword) {
            console.warn('Passwords do not match');
        }
    });
});

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Mobile number validation helper
function isValidMobile(mobile) {
    // Accepts 10-15 digit phone numbers with optional +, spaces, dashes, and parentheses
    const mobileRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return mobileRegex.test(mobile);
}

// Country Code Selector Functions for Registration
function toggleDropdownRegister() {
    const dropdown = document.getElementById('countryDropdownRegister');
    const selected = document.getElementById('countrySelectedRegister');
    dropdown.classList.toggle('active');
    selected.classList.toggle('active');
}

function selectCountryRegister(code, iso) {
    const dropdown = document.getElementById('countryDropdownRegister');
    const selected = document.getElementById('countrySelectedRegister');
    const countryCodeInput = document.getElementById('countryCode');
    
    countryCodeInput.value = code;
    
    const flagImg = `https://flagcdn.com/w20/${iso}.png`;
    selected.innerHTML = `<img src="${flagImg}" alt="${iso.toUpperCase()}"><span>${code}</span><svg fill="currentColor" viewBox="0 0 20 20" style="width: 14px;"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>`;
    
    dropdown.classList.remove('active');
    selected.classList.remove('active');
}

function filterCountriesRegister(value) {
    const options = document.querySelectorAll('.country-option-register');
    const searchTerm = value.toLowerCase();
    
    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
        }
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('countryDropdownRegister');
    const selector = document.querySelector('.country-selector-register');
    if (dropdown && selector && !selector.contains(e.target)) {
        dropdown.classList.remove('active');
        const selected = document.getElementById('countrySelectedRegister');
        if (selected) selected.classList.remove('active');
    }
});
