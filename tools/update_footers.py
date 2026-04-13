import os
import re

pages = [
    'pages/contact.html',
    'pages/psychology.html',
    'pages/lot-size.html',
    'pages/profit-loss.html',
    'pages/pips.html',
    'pages/calculator.html',
    'pages/risk-management.html',
    'pages/login.html',
    'pages/register.html',
    'pages/forgot-password.html',
    'pages/search-results.html'
]

old_pattern = r'<!-- Quick Links -->.*?<!-- Legal -->.*?</div>\s*</div>'

new_footer = '''                <!-- Main Pages -->
                <div>
                    <h3
                        style="color: #FF9933; font-size: 1.1rem; margin: 0 0 1.5rem 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                        Main Pages</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 0.8rem;"><a href="../index.html"
                                style="color: #ccc; text-decoration: none; transition: color 0.3s ease;"
                                onmouseover="this.style.color='#FF9933';" onmouseout="this.style.color='#ccc';">Home</a>
                        </li>
                        <li style="margin-bottom: 0.8rem;"><a href="about.html"
                                style="color: #ccc; text-decoration: none; transition: color 0.3s ease;"
                                onmouseover="this.style.color='#FF9933';" onmouseout="this.style.color='#ccc';">About Me</a></li>
                        <li style="margin-bottom: 0.8rem;"><a href="courses.html"
                                style="color: #ccc; text-decoration: none; transition: color 0.3s ease;"
                                onmouseover="this.style.color='#FF9933';" onmouseout="this.style.color='#ccc';">Courses</a></li>
                        <li style="margin-bottom: 0.8rem;"><a href="psychology.html"
                                style="color: #ccc; text-decoration: none; transition: color 0.3s ease;"
                                onmouseover="this.style.color='#FF9933';" onmouseout="this.style.color='#ccc';">Trading Psychology</a></li>
                    </ul>
                </div>

                <!-- Trading Tools -->
                <div>
                    <h3
                        style="color: #FF9933; font-size: 1.1rem; margin: 0 0 1.5rem 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                        Trading Tools</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 0.8rem;"><a href="lot-size.html"
                                style="color: #ccc; text-decoration: none; transition: color 0.3s ease;"
                                onmouseover="this.style.color='#FF9933';" onmouseout="this.style.color='#ccc';">Lot Size Calculator</a></li>
                        <li style="margin-bottom: 0.8rem;"><a href="profit-loss.html"
                                style="color: #ccc; text-decoration: none; transition: color 0.3s ease;"
                                onmouseover="this.style.color='#FF9933';" onmouseout="this.style.color='#ccc';">Profit &amp; Loss</a></li>
                        <li style="margin-bottom: 0.8rem;"><a href="pips.html"
                                style="color: #ccc; text-decoration: none; transition: color 0.3s ease;"
                                onmouseover="this.style.color='#FF9933';" onmouseout="this.style.color='#ccc';">Pips Calculator</a></li>
                        <li style="margin-bottom: 0.8rem;"><a href="risk-management.html"
                                style="color: #ccc; text-decoration: none; transition: color 0.3s ease;"
                                onmouseover="this.style.color='#FF9933';" onmouseout="this.style.color='#ccc';">Risk Management Advisor</a></li>
                    </ul>
                </div>

                <!-- Support & Legal -->
                <div>
                    <h3
                        style="color: #FF9933; font-size: 1.1rem; margin: 0 0 1.5rem 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                        Support &amp; Legal</h3>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 0.8rem;"><a href="contact.html"
                                style="color: #ccc; text-decoration: none; transition: color 0.3s ease;"
                                onmouseover="this.style.color='#FF9933';" onmouseout="this.style.color='#ccc';">Contact Us</a></li>
                        <li style="margin-bottom: 0.8rem;"><a href="#"
                                style="color: #ccc; text-decoration: none; transition: color 0.3s ease;"
                                onmouseover="this.style.color='#FF9933';" onmouseout="this.style.color='#ccc';">Terms &amp; Conditions</a></li>
                        <li style="margin-bottom: 0.8rem;"><a href="#"
                                style="color: #ccc; text-decoration: none; transition: color 0.3s ease;"
                                onmouseover="this.style.color='#FF9933';" onmouseout="this.style.color='#ccc';">Privacy Policy</a></li>
                        <li style="margin-bottom: 0.8rem;"><a href="#"
                                style="color: #ccc; text-decoration: none; transition: color 0.3s ease;"
                                onmouseover="this.style.color='#FF9933';" onmouseout="this.style.color='#ccc';">Risk Disclosure</a></li>
                    </ul>
                </div>
            </div>'''

for page in pages:
    if os.path.exists(page):
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find and replace Quick Links + Legal sections with new sections
        new_content = re.sub(old_pattern, new_footer, content, flags=re.DOTALL)
        
        if new_content != content:
            with open(page, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'✓ Updated {page}')
        else:
            print(f'✗ No changes needed for {page}')
    else:
        print(f'✗ File not found: {page}')

print('\nFooter update complete!')
