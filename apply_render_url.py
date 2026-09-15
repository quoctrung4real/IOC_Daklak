import os
import glob

directory = '.'

for filepath in glob.iglob(directory + '/**/*.js', recursive=True):
    if not os.path.isfile(filepath):
        continue
    if 'node_modules' in filepath:
        continue
        
    with open(filepath, 'r') as file:
        content = file.read()
    
    if 'YOUR_BACKEND_APP_NAME' in content:
        new_content = content.replace('YOUR_BACKEND_APP_NAME', 'ioc-daklak')
        with open(filepath, 'w') as file:
            file.write(new_content)
        print(f'Updated {filepath}')
