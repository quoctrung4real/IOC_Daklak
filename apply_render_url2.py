import os
import glob
import re

directory = '.'

for filepath in glob.iglob(directory + '/**/*.js', recursive=True):
    if not os.path.isfile(filepath):
        continue
    if 'node_modules' in filepath:
        continue
        
    with open(filepath, 'r') as file:
        content = file.read()
    
    # We want to replace `http://${window.location.hostname || 'localhost'}:5100...`
    # We will use regex to find the base part and replace it with a ternary operator.
    
    # Pattern to match exactly: http://${window.location.hostname || 'localhost'}:5100
    pattern = r"http://\$\{window\.location\.hostname\s*\|\|\s*'localhost'\}\:5100"
    
    # Replacement string
    replacement = r"${(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '' ? `http://${window.location.hostname || 'localhost'}:5100` : 'https://ioc-daklak.onrender.com')}"
    
    if re.search(pattern, content):
        new_content = re.sub(pattern, replacement, content)
        with open(filepath, 'w') as file:
            file.write(new_content)
        print(f'Updated {filepath}')

for filepath in glob.iglob(directory + '/**/*.html', recursive=True):
    if not os.path.isfile(filepath):
        continue
    if 'node_modules' in filepath:
        continue
        
    with open(filepath, 'r') as file:
        content = file.read()
    
    pattern = r"http://\$\{window\.location\.hostname\s*\|\|\s*'localhost'\}\:5100"
    replacement = r"${(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '' ? `http://${window.location.hostname || 'localhost'}:5100` : 'https://ioc-daklak.onrender.com')}"
    
    if re.search(pattern, content):
        new_content = re.sub(pattern, replacement, content)
        with open(filepath, 'w') as file:
            file.write(new_content)
        print(f'Updated {filepath}')
