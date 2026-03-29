import os
import re

root_dir = r'D:\tmleen'
folders = ['app', 'components']

# CLEANUP PHASE 2: ERADICATING REMAINING BLUE/PURPLE
replacements = [
    # 1. Navbar & Header Fixes
    (r'from-action-blue to-purple-600', 'from-ink to-ink'),
    (r'bg-action-blue', 'bg-ink'),
    (r'text-action-blue', 'text-accent'),
    (r'shadow-action-blue/20', 'shadow-black/5'),
    (r'bg-blue-50', 'bg-subtle'),
    
    # 2. General UI Consistency
    (r'blue-500', 'accent'),
    (r'blue-600', 'accent'),
    (r'indigo-600', 'ink'),
    (r'indigo-500', 'ink'),
    (r'purple-600', 'ink'),
    
    # 3. Form & Focus Rings
    (r'focus:ring-blue-500', 'focus:ring-ink'),
    (r'focus:border-blue-500', 'focus:border-ink'),
]

def final_polish():
    print("Executing Final Polish - Eradicating remaining blues...")
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
                        print(f"Polished: {file}")
                        count += 1
    print(f"Done! {count} files perfectly aligned.")

if __name__ == "__main__":
    final_polish()
