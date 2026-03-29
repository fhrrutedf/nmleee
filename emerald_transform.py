import os
import re

root_dir = r'D:\tmleen'
folders = ['app', 'components']

# THE EMERALD & INK REVOLUTION (v3.0)
# Emerald: #10B981 (Success/Action)
# Ink: #1A1A1A (Primary)
# Surface: #FFFFFF

replacements = [
    # 1. Configuration Constants (Tailwind Token Mapping)
    (r'#2563EB', '#059669'), # Royal Blue to Emerald Green
    (r'#1D4ED8', '#047857'), # Dark Blue to Dark Emerald
    (r'#EFF6FF', '#ECFDF5'), # Light Blue bg to Light Emerald bg
    (r'#3B82F6', '#10B981'), # Standard Blue to Emerald
    
    # 2. Tailwind Class Replacements
    (r'text-accent', 'text-emerald-600'),
    (r'bg-accent', 'bg-emerald-600'),
    (r'border-accent', 'border-emerald-600'),
    (r'hover:bg-emerald-700', 'hover:bg-emerald-800'),
    
    # 3. Clean up any remaining blue strings
    (r'blue-600', 'emerald-600'),
    (r'blue-500', 'emerald-500'),
    (r'indigo-600', 'emerald-700'),
]

def apply_emerald_identity():
    print("TRANSFORMING TO EMERALD & BLACK IDENTITY...")
    
    # Update tailwind.config.ts first
    config_path = os.path.join(root_dir, 'tailwind.config.ts')
    with open(config_path, 'r', encoding='utf-8') as f:
        config = f.read()
    
    # Replace blue hex with emerald hex in config
    new_config = config.replace('#2563EB', '#059669').replace('#1D4ED8', '#047857').replace('#EFF6FF', '#ECFDF5')
    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(new_config)
    print("Tailwind Config Updated.")

    # Update global CSS
    css_path = os.path.join(root_dir, 'app', 'globals.css')
    with open(css_path, 'r', encoding='utf-8') as f:
        css = f.read()
    new_css = css.replace('#2563EB', '#059669').replace('#1D4ED8', '#047857')
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(new_css)
    print("Globals.css Updated.")

    # Update all TSX files
    count = 0
    for folder in folders:
        path = os.path.join(root_dir, folder)
        for root, dirs, files in os.walk(path):
            for file in files:
                if file.endswith(('.tsx', '.ts')):
                    f_path = os.path.join(root, file)
                    with open(f_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = content
                    for pattern, subst in replacements:
                        new_content = re.sub(pattern, subst, new_content)
                    
                    if new_content != content:
                        with open(f_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Emerald Transformation: {file}")
                        count += 1
    print(f"Done! {count} files now Emerald & Black.")

if __name__ == "__main__":
    apply_emerald_identity()
