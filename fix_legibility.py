import os
import re

root_dir = r'D:\tmleen'
folders = ['app', 'components']

# THE CONTRAST & LEGIBILITY FIX (v5.0)
# Emerald Button + White Text (Force)
# Black Background + White Text (Force)

def fix_legibility():
    print("FIXING BUTTON TEXT VISIBILITY AND CONTRAST...")
    
    replacements = [
        # 1. Force White text on ALL Emerald Backgrounds (Buttons)
        (r'bg-emerald-600(?!\s+text-white)', 'bg-emerald-600 text-white'),
        (r'bg-emerald-700(?!\s+text-white)', 'bg-emerald-700 text-white'),
        (r'bg-emerald-500(?!\s+text-white)', 'bg-emerald-500 text-white'),
        (r'bg-\[#059669\](?!\s+text-white)', 'bg-[#059669] text-white'),
        
        # 2. Fix Dark background text (Ensure it's white/light)
        (r'bg-[#0A0A0A](?!\s+text-white)', 'bg-[#0A0A0A] text-white'),
        (r'bg-ink(?!\s+text-white)', 'bg-ink text-white'),
        
        # 3. Specifically fix cases where text-ink or text-slate-900 might be on dark bg
        (r'text-ink', 'text-white'),
        (r'text-slate-900', 'text-white'),
        (r'text-gray-900', 'text-white'),
        
        # 4. Remove any conflicting dark text classes on buttons
        (r'text-slate-600', 'text-gray-300'),
        (r'text-gray-600', 'text-gray-400'),
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
    print(f"Legibility fixed on {count} files.")

if __name__ == "__main__":
    fix_legibility()
