import os
import re

root_dir = r'D:\tmleen'
folders = ['app', 'components']

# ULTIMATE ERADICATION: NO MORE BLUE/PURPLE
replacements = [
    # 1. Backgrounds
    (r'bg-blue-600', 'bg-ink'),
    (r'bg-blue-700', 'bg-ink'),
    (r'bg-blue-500', 'bg-ink'),
    (r'bg-indigo-600', 'bg-ink'),
    (r'bg-purple-600', 'bg-ink'),
    (r'bg-primary-600', 'bg-ink'),
    
    # 2. Text Colors
    (r'text-blue-600', 'text-accent'),
    (r'text-blue-500', 'text-accent'),
    (r'text-indigo-600', 'text-ink'),
    
    # 3. Borders & Rings
    (r'border-blue-600', 'border-ink'),
    (r'border-blue-500', 'border-ink'),
    (r'ring-blue-600', 'ring-ink'),
    (r'ring-blue-500', 'ring-ink'),
    
    # 4. Hover States
    (r'hover:bg-blue-700', 'hover:bg-black'),
    (r'hover:text-blue-700', 'hover:text-accent'),
    
    # 5. Complex Gradients (Pricing Section etc)
    (r'from-blue-600 to-indigo-700', 'from-ink to-ink'),
    (r'from-indigo-600 to-purple-600', 'from-ink to-ink'),
]

def extreme_polish():
    print("Executing Extreme UI Eradication - No more accidental blues...")
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
                        print(f"Purged: {file}")
                        count += 1
    print(f"Mission Complete! {count} files purged of old branding.")

if __name__ == "__main__":
    extreme_polish()
