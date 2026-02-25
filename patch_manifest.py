import json
import os
import glob

manifest_path = 'CTFd/themes/admin/static/manifest.json'
with open(manifest_path, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

for key, entry in manifest.items():
    if 'file' in entry:
        old_file = entry['file']
        if old_file.startswith('assets/'):
            # Append -v2 before the extension
            name, ext = os.path.splitext(old_file)
            new_file = f"{name}-v2{ext}"
            
            old_path = os.path.join('CTFd/themes/admin/static', old_file)
            new_path = os.path.join('CTFd/themes/admin/static', new_file)
            
            if os.path.exists(old_path):
                os.rename(old_path, new_path)
            
            entry['file'] = new_file
            print(f"Renamed {old_file} to {new_file}")

with open(manifest_path, 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2)

print("Updated manifest.json successfully!")
