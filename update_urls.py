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
    
    if 'const API_BASE = `http://${window.location.hostname || \'localhost\'}:5100/api`;' in content:
        new_content = content.replace(
            "const API_BASE = `http://${window.location.hostname || 'localhost'}:5100/api`;",
            "const isLocalEnv = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';\nconst API_BASE = isLocalEnv ? `http://${window.location.hostname || 'localhost'}:5100/api` : 'https://YOUR_BACKEND_APP_NAME.onrender.com/api';"
        )
        
        if 'function resolveBackendUrl(url)' in new_content:
            new_content = new_content.replace(
                "return url.match(/^(http|data:)/) ? url : `http://${window.location.hostname || 'localhost'}:5100${url}`;",
                "return url.match(/^(http|data:)/) ? url : (isLocalEnv ? `http://${window.location.hostname || 'localhost'}:5100${url}` : `https://YOUR_BACKEND_APP_NAME.onrender.com${url}`);"
            )

        with open(filepath, 'w') as file:
            file.write(new_content)
        print(f'Updated {filepath}')
