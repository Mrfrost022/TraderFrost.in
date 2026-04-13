// Login Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get input values
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Validate inputs
        if (!email || !password) {
            console.warn('Please fill in all fields');
            return;
        }

        // Log credentials to console (placeholder for API call)
        console.log('%c[LOGIN ATTEMPT]', 'color: #FF9933; font-weight: bold;');
        console.log('%cEmail:', 'color: #FF9933; font-weight: bold;', email);
        console.log('%cPassword:', 'color: #FF9933; font-weight: bold;', password);
        console.log('%c[This is a placeholder. Future API call will be implemented here]', 'color: #aaaaaa; font-style: italic;');

        // Clear form
        loginForm.reset();

        // Optional: Show success message (you can enhance this with a toast notification)
        console.log('%c✓ Form submitted successfully', 'color: #4CAF50; font-weight: bold;');
    });

    // Add input event listeners for real-time feedback
    emailInput.addEventListener('input', function() {
        const email = this.value.trim();
        if (email && !isValidEmail(email)) {
            console.warn('Invalid email format');
        }
    });

    passwordInput.addEventListener('input', function() {
        const password = this.value;
        if (password && password.length < 6) {
            console.warn('Password should be at least 6 characters');
        }
    });
});

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
