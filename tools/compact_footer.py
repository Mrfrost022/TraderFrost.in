import os
import re

pages = [
    'pages/about.html',
    'pages/courses.html',
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

# Define replacement mappings
replacements = [
    # Footer padding
    (r'padding: 4rem 2rem 2rem;', 'padding: 2.5rem 2rem 1.5rem;'),
    
    # Grid gap and margins
    (r'minmax\(280px, 1fr\)', 'minmax(240px, 1fr)'),
    (r'gap: 3rem; margin-bottom: 3rem; padding-bottom: 3rem;', 'gap: 2.5rem; margin-bottom: 2rem; padding-bottom: 2rem;'),
    
    # Brand logo and title
    (r'gap: 0\.8rem; margin-bottom: 1rem;', 'gap: 0.6rem; margin-bottom: 0.8rem;'),
    (r'width: 36px; height: 36px;', 'width: 28px; height: 28px;'),
    (r'font-size: 1\.8rem; margin: 0; font-weight: 700;', 'font-size: 1.4rem; margin: 0; font-weight: 700;'),
    
    # Brand description
    (r'font-size: 0\.95rem; line-height: 1\.6; margin: 0;\)', 'font-size: 0.85rem; line-height: 1.5; margin: 0;)'),
    
    # Social icons
    (r'gap: 1rem; margin-top: 1\.5rem;', 'gap: 0.8rem; margin-top: 1rem;'),
    
    # Section headings
    (r'font-size: 1\.1rem; margin: 0 0 1\.5rem 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;', 
     'font-size: 0.95rem; margin: 0 0 1rem 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;'),
    
    # List item margins
    (r'margin-bottom: 0\.8rem;><a href=', 'margin-bottom: 0.6rem;><a href='),
    
    # Add font-size to links (more complex)
]

for page in pages:
    if os.path.exists(page):
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply replacements
        for old, new in replacements:
            content = re.sub(old, new, content)
        
        # Special handling for link styles (add font-size)
        # Find all links in footer and add font-size if not present
        content = re.sub(
            r'(margin-bottom: 0\.6rem;><a href=.*?style="color: #ccc; text-decoration: none; transition: color 0\.3s ease;)(?![^"]*font-size)',
            r'\1 font-size: 0.9rem;',
            content,
            flags=re.DOTALL
        )
        
        # Disclaimer box
        content = re.sub(
            r'padding: 1\.5rem; border-radius: 12px; border-left: 3px solid #FF9933; margin-bottom: 2rem;',
            'padding: 1rem 1.2rem; border-radius: 12px; border-left: 3px solid #FF9933; margin-bottom: 1.5rem;',
            content
        )
        
        # Disclaimer text sizes
        content = re.sub(
            r'color: #FF9933; font-size: 0\.9rem; margin: 0 0 0\.5rem 0; font-weight: 600;',
            'color: #FF9933; font-size: 0.8rem; margin: 0 0 0.4rem 0; font-weight: 600;',
            content
        )
        
        # Disclaimer description
        content = re.sub(
            r'color: #aaa; font-size: 0\.85rem; margin: 0; line-height: 1\.6;',
            'color: #aaa; font-size: 0.8rem; margin: 0; line-height: 1.5;',
            content
        )
        
        # Copyright section
        content = re.sub(
            r'padding-top: 1rem; border-top: 1px solid rgba\(255,153,51,0\.1\);',
            'padding-top: 0.8rem; border-top: 1px solid rgba(255,153,51,0.1);',
            content
        )
        
        # Copyright text
        content = re.sub(
            r'color: #888; font-size: 0\.85rem; margin: 0;',
            'color: #888; font-size: 0.8rem; margin: 0;',
            content
        )
        
        if content != original_content:
            with open(page, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'✓ Compacted footer in {page}')
        else:
            print(f'- No changes needed for {page}')
    else:
        print(f'✗ File not found: {page}')

print('\n✅ Footer optimization complete!')
