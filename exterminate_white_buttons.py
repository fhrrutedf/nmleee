import os
import re

root_dir = r'D:\tmleen'
folders = ['app', 'components']

# THE "WHITE BUTTON" EXTERMINATOR (v6.0)
# Goal: Find any remaining white buttons and FORCE them to Emerald.
# Targets: bg-white inside button tags or Link tags that look like buttons.

def exterminate_white_buttons():
    print("EXTERMINATING WHITE BUTTONS...")
    
    # We look for bg-white inside className that is likely a button
    # common patterns: btn-secondary, border-white, bg-white used for actions
    replacements = [
        (r'bg-white text-emerald-600', 'bg-emerald-600 text-white'),
        (r'bg-white text-black', 'bg-emerald-600 text-white'),
        (r'bg-white text-ink', 'bg-emerald-600 text-white'),
        (r'bg-white border border-white/10', 'bg-emerald-700 border border-emerald-500/30'),
        (r'bg-white/5 border border-white/10', 'bg-emerald-900/40 border border-emerald-500/20'),
        (r'btn-secondary', 'btn-accent'),
        (r'btn-outline', 'btn-accent'),
        (r'bg-slate-50', 'bg-emerald-900/20'),
        (r'bg-gray-50', 'bg-emerald-900/20'),
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
    print(f"White buttons exterminated in {count} files.")

if __name__ == "__main__":
    exterminate_white_buttons()
