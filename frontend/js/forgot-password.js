// Forgot Password Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetMethodRadios = document.querySelectorAll('input[name="resetMethod"]');
    const emailGroup = document.getElementById('emailGroup');
    const phoneGroup = document.getElementById('phoneGroup');
    const resetEmailInput = document.getElementById('resetEmail');
    const resetPhoneInput = document.getElementById('resetPhone');

    // Handle reset method toggle
    resetMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'email') {
                emailGroup.classList.add('active');
                phoneGroup.classList.remove('active');
                resetEmailInput.focus();
            } else {
                emailGroup.classList.remove('active');
                phoneGroup.classList.add('active');
                resetPhoneInput.focus();
            }
        });
    });

    // Handle form submission
    forgotPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const resetMethod = document.querySelector('input[name="resetMethod"]:checked').value;
        let identifier = '';
        let isValid = false;

        if (resetMethod === 'email') {
            identifier = resetEmailInput.value.trim();
            isValid = identifier && isValidEmail(identifier);
        } else {
            identifier = resetPhoneInput.value.trim();
            const countryCode = document.getElementById('countryCodeForgot').value;
            isValid = identifier && isValidMobile(identifier);
        }

        if (!isValid) {
            console.warn('Please enter a valid ' + resetMethod);
            return;
        }

        // Log reset request to console (placeholder for API call)
        console.log('%c[PASSWORD RESET REQUEST]', 'color: #FF9933; font-weight: bold;');
        console.log('%cMethod:', 'color: #FF9933; font-weight: bold;', resetMethod);
        
        if (resetMethod === 'email') {
            console.log('%cEmail:', 'color: #FF9933; font-weight: bold;', identifier);
        } else {
            const countryCode = document.getElementById('countryCodeForgot').value;
            console.log('%cPhone:', 'color: #FF9933; font-weight: bold;', countryCode + identifier);
        }
        
        console.log('%c[A reset link will be sent to the provided ' + resetMethod + ']', 'color: #aaaaaa; font-style: italic;');
        console.log('%c✓ Reset link sent successfully', 'color: #4CAF50; font-weight: bold;');

        // Clear form
        forgotPasswordForm.reset();
        emailGroup.classList.add('active');
        phoneGroup.classList.remove('active');
    });

    // Email validation on input
    resetEmailInput.addEventListener('input', function() {
        const email = this.value.trim();
        if (email && !isValidEmail(email)) {
            console.warn('Invalid email format');
        }
    });

    // Phone validation on input
    resetPhoneInput.addEventListener('input', function() {
        const phone = this.value.trim();
        if (phone && !isValidMobile(phone)) {
            console.warn('Invalid mobile number');
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
    const mobileRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return mobileRegex.test(mobile);
}

// Country Code Selector Functions for Forgot Password
function toggleDropdownForgot() {
    const dropdown = document.getElementById('countryDropdownForgot');
    const selected = document.getElementById('countrySelectedForgot');
    dropdown.classList.toggle('active');
    selected.classList.toggle('active');
}

function selectCountryForgot(code, iso) {
    const dropdown = document.getElementById('countryDropdownForgot');
    const selected = document.getElementById('countrySelectedForgot');
    const countryCodeInput = document.getElementById('countryCodeForgot');
    
    countryCodeInput.value = code;
    
    const flagImg = `https://flagcdn.com/w20/${iso}.png`;
    selected.innerHTML = `<img src="${flagImg}" alt="${iso.toUpperCase()}"><span>${code}</span><svg fill="currentColor" viewBox="0 0 20 20" style="width: 14px;"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>`;
    
    dropdown.classList.remove('active');
    selected.classList.remove('active');
}

function filterCountriesForgot(value) {
    const options = document.querySelectorAll('.country-option-forgot');
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
    const dropdown = document.getElementById('countryDropdownForgot');
    const selector = document.querySelector('.country-selector-forgot');
    if (dropdown && selector && !selector.contains(e.target)) {
        dropdown.classList.remove('active');
        const selected = document.getElementById('countrySelectedForgot');
        if (selected) selected.classList.remove('active');
    }
});
