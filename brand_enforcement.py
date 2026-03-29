import os
import re

root_dir = r'D:\tmleen'
folders = ['app', 'components']

# THE ROYAL EMERALD FINALE (v4.1)
# Deep Emerald: #065f46 (Primary Action)
# Glow/Bright Emerald: #10B981 (Hover/Pop)

def final_brand_enforcement():
    print("ENFORCING ROYAL EMERALD IDENTITY...")
    
    # 1. CSS Clean up (Remove duplicate selectors or issues)
    css_path = os.path.join(root_dir, 'app', 'globals.css')
    with open(css_path, 'r', encoding='utf-8') as f:
        css = f.read()
    
    # Ensure text-emerald-500 is mapped correctly and no blue remains
    new_css = css.replace('#2563EB', '#065f46').replace('#3B82F6', '#10B981')
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(new_css)

    # 2. File Swapping (Total coverage)
    replacements = [
        (r'bg-emerald-600', 'bg-emerald-700'), # Deepen the green
        (r'text-emerald-500', 'text-[#10B981]'), # Make sure pop color is bright
        (r'blue-600', 'emerald-700'),
        (r'indigo-600', 'emerald-800'),
    ]

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
                        count += 1
    print(f"Branding enforced on {count} files.")

if __name__ == "__main__":
    final_brand_enforcement()
