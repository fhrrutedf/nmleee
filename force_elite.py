import os
import re

root_dir = r'D:\tmleen'
folders = ['app', 'components']

# THE FINAL EMERALD & INK POLISH (v4.2)
# Emerald: #10B981 (Primary Action & Text)
# Ink: #0A0A0A (Backgrounds)

def force_elite_branding():
    print("FORCE ENFORCING ELITE BRANDING (v4.2)...")
    
    # Define the exact target colors
    EMERALD_GREEN = '#10B981'
    LUXURY_BLACK = '#0A0A0A'
    
    # 1. Update globals.css with force
    css_path = os.path.join(root_dir, 'app', 'globals.css')
    with open(css_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Massive replacement of any blue/indigo/purple vars to Emerald
    replacements = [
        (r'--accent:\s*#[A-Fa-f0-9]+', f'--accent: {EMERALD_GREEN}'),
        (r'--ink:\s*#[A-Fa-f0-9]+', f'--ink: {LUXURY_BLACK}'),
        (r'background-color:\s*#[A-Fa-f0-9]+', f'background-color: {LUXURY_BLACK}'),
    ]
    
    for pattern, subst in replacements:
        content = re.sub(pattern, subst, content)
    
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("CSS Hard-coded for Elite Identity.")

    # 2. Update tailwind.config.ts
    config_path = os.path.join(root_dir, 'tailwind.config.ts')
    with open(config_path, 'r', encoding='utf-8') as f:
        config = f.read()
    
    config = re.sub(r"'ink':\s*'#[A-Fa-f0-9]+'", f"'ink': '{LUXURY_BLACK}'", config)
    # Update accent DEFAULT
    config = re.sub(r"DEFAULT:\s*'#[A-Fa-f0-9]+'", f"DEFAULT: '{EMERALD_GREEN}'", config)
    
    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(config)
    print("Tailwind Config Hard-coded.")

    # 3. Direct File Cleanup for remaining 'blue' classes
    class_replacements = [
        (r'bg-blue-600', 'bg-emerald-600'),
        (r'text-blue-600', 'text-emerald-500'),
        (r'from-blue-600', 'from-emerald-900'),
        (r'to-indigo-700', 'to-black'),
        (r'bg-indigo-600', 'bg-emerald-700'),
    ]

    count = 0
    for folder in folders:
        path = os.path.join(root_dir, folder)
        for root, dirs, files in os.walk(path):
            for file in files:
                if file.endswith(('.tsx', '.ts')):
                    f_path = os.path.join(root, file)
                    with open(f_path, 'r', encoding='utf-8') as f:
                        file_content = f.read()
                    
                    new_file_content = file_content
                    for pattern, subst in class_replacements:
                        new_file_content = re.sub(pattern, subst, new_file_content)
                    
                    if new_file_content != file_content:
                        with open(f_path, 'w', encoding='utf-8') as f:
                            f.write(new_file_content)
                        count += 1
    print(f"Purged {count} files of legacy color strings.")

if __name__ == "__main__":
    force_elite_branding()
