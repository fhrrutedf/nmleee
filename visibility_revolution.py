import os
import re

root_dir = r'D:\tmleen'
folders = ['app', 'components']

# REVOLUTION: THE VISIBILITY UPGRADE
# Goal: Convert ALL primary action buttons that might be hidden (Ink/Black) 
# into the high-contrast Emerald Green.

replacements = [
    # 1. Backgrounds for primary buttons/actions
    (r'bg-ink', 'bg-emerald-600'),
    (r'bg-primary-ink', 'bg-emerald-600'),
    (r'bg-slate-900', 'bg-emerald-600'),
    
    # 2. Hover states for these buttons
    (r'hover:bg-black', 'hover:bg-emerald-700'),
    (r'hover:bg-slate-800', 'hover:bg-emerald-700'),
    (r'hover:bg-gray-900', 'hover:bg-emerald-700'),
    
    # 3. Shadows for visibility
    (r'shadow-sm', 'shadow-lg shadow-emerald-600/20'),
    
    # 4. Text colors that need pop
    (r'text-ink', 'text-emerald-600'),
]

def visibility_revolution():
    print("VISIBILITY REVOLUTION: Making all buttons pop with Emerald Green...")
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
                        print(f"Highlighted: {file}")
                        count += 1
    print(f"Success! {count} files updated with visible Emerald buttons.")

if __name__ == "__main__":
    visibility_revolution()
