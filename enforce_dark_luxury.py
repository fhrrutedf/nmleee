import os
import re

root_dir = r'D:\tmleen'
folders = ['app', 'components']

# THE ELITE EMERALD & DEEP BLACK MANDATE
# Goal: Make sure ALL pages use the dark luxury theme with Emerald accents.

def enforce_dark_luxury():
    print("ENFORCING DARK LUXURY ACROSS ALL COMPONENTS...")
    
    replacements = [
        # 1. Backgrounds - Force Deep Black
        (r'bg-white(?!/)', 'bg-[#0A0A0A]'),
        (r'bg-slate-50', 'bg-[#111111]'),
        (r'bg-gray-50', 'bg-[#111111]'),
        (r'bg-subtle', 'bg-[#0A0A0A]'),
        (r'bg-surface', 'bg-[#0A0A0A]'),
        
        # 2. Text - Force White / Gray
        (r'text-slate-900', 'text-white'),
        (r'text-gray-900', 'text-white'),
        (r'text-ink', 'text-white'),
        (r'text-slate-600', 'text-gray-400'),
        (r'text-slate-500', 'text-gray-500'),
        
        # 3. Cards - Dark with Border
        (r'className="card"', 'className="bg-[#111] border border-white/10 rounded-2xl p-6"'),
        
        # 4. Success Icons & Accents (The Emerald Jewel)
        (r'text-emerald-600', 'text-[#10B981]'),
        (r'bg-emerald-600', 'bg-[#059669]'),
        (r'shadow-emerald-600/20', 'shadow-[#10B981]/20'),
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
    print(f"Dark Luxury Mandate applied to {count} files.")

if __name__ == "__main__":
    enforce_dark_luxury()
