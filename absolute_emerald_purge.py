import os
import re

root_dir = r'D:\tmleen'
folders = ['app', 'components']

# THE ABSOLUTE EMERALD ENFORCEMENT
# Goal: Convert ALL remaining white/gray buttons and secondary UI elements to Emerald Green.

def absolute_emerald_purge():
    print("EXECUTING ABSOLUTE EMERALD PURGE...")
    
    replacements = [
        # 1. Backgrounds - Force Emerald on ANY button-like structure
        (r'bg-white text-ink', 'bg-emerald-600 text-white'),
        (r'bg-slate-50 text-slate-400', 'bg-emerald-900/20 text-emerald-500'),
        (r'bg-white border-slate-100', 'bg-[#111] border-emerald-500/30'),
        (r'bg-gray-100', 'bg-emerald-800'),
        (r'bg-slate-100', 'bg-emerald-800'),
        
        # 2. Border & Ring Fixes (No more gray borders on buttons)
        (r'border-gray-200', 'border-emerald-500/20'),
        (r'border-slate-100', 'border-emerald-500/20'),
        
        # 3. Hover States (Make sure they are emerald)
        (r'hover:bg-slate-50', 'hover:bg-emerald-600'),
        (r'hover:bg-gray-50', 'hover:bg-emerald-600'),
        (r'hover:text-primary-ink', 'hover:text-white'),
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
    print(f"Absolute Emerald Purge applied to {count} files.")

if __name__ == "__main__":
    absolute_emerald_purge()
