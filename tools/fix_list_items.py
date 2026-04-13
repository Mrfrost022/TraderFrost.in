import os

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

for page in pages:
    if os.path.exists(page):
        with open(page, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix list items margin from 0.8rem to 0.6rem and add font-size
        content = content.replace(
            'margin-bottom: 0.8rem;"><a href=',
            'margin-bottom: 0.6rem;"><a href='
        )
        
        # Add font-size to footer links that don't have it
        lines = content.split('\n')
        new_lines = []
        for i, line in enumerate(lines):
            if 'style="color: #ccc; text-decoration: none; transition: color 0.3s ease;"' in line:
                # Check if this is in footer (roughly)
                if i > 200:  # Footer is typically near the end
                    line = line.replace(
                        'style="color: #ccc; text-decoration: none; transition: color 0.3s ease;"',
                        'style="color: #ccc; text-decoration: none; transition: color 0.3s ease; font-size: 0.9rem;"'
                    )
            new_lines.append(line)
        
        content = '\n'.join(new_lines)
        
        with open(page, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'✓ Fixed list items in {page}')
    else:
        print(f'✗ File not found: {page}')

# Also fix index.html
if os.path.exists('index.html'):
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(
        'margin-bottom: 0.8rem;"><a href=',
        'margin-bottom: 0.6rem;"><a href='
    )
    
    lines = content.split('\n')
    new_lines = []
    for i, line in enumerate(lines):
        if 'style="color: #ccc; text-decoration: none; transition: color 0.3s ease;"' in line:
            if i > 200:
                line = line.replace(
                    'style="color: #ccc; text-decoration: none; transition: color 0.3s ease;"',
                    'style="color: #ccc; text-decoration: none; transition: color 0.3s ease; font-size: 0.9rem;"'
                )
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'✓ Fixed list items in index.html')

print('\n✅ List items fixed!')
