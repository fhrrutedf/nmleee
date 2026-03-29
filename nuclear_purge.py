import os
import re

root_dir = r'D:\tmleen'
folders = ['app', 'components']

# NUCLEAR CLEANUP: NO MORE ARBITRARY TAILWIND COLORS
# Converting everything to the defined CSS variables / Brand names
replacements = [
    # 1. Backgrounds to Brand Ink (Primary)
    (r'bg-blue-600', 'bg-ink'),
    (r'bg-blue-700', 'bg-ink'),
    (r'bg-blue-500', 'bg-ink'),
    (r'bg-indigo-600', 'bg-ink'),
    (r'bg-indigo-500', 'bg-ink'),
    (r'bg-purple-600', 'bg-ink'),
    (r'bg-purple-700', 'bg-ink'),
    
    # 2. Text to Brand Accent/Ink
    (r'text-blue-600', 'text-accent'),
    (r'text-blue-500', 'text-accent'),
    (r'text-indigo-600', 'text-ink'),
    (r'text-purple-600', 'text-ink'),
    
    # 3. Borders & Focus
    (r'border-blue-600', 'border-ink'),
    (r'border-blue-500', 'border-accent'),
    (r'focus:ring-blue-500', 'focus:ring-accent'),
    (r'focus:border-blue-500', 'focus:border-accent'),
    
    # 4. Erase AI Signatures (Gradients/Glass)
    (r'bg-white/10', 'bg-surface/10'),
    (r'backdrop-blur-xl', ''),
    (r'backdrop-blur-md', ''),
    (r'bg-white/30', 'bg-surface'),
    (r'from-blue-600 to-indigo-700', 'bg-ink'),
    (r'from-indigo-600 to-purple-600', 'bg-ink'),
    (r'from-indigo-500 via-purple-500 to-pink-500', 'bg-ink'),
    (r'from-blue-500 via-indigo-500 to-purple-500', 'bg-ink'),
    
    # 5. Buttons specifically
    (r'hover:bg-blue-700', 'hover:bg-black'),
    (r'hover:bg-indigo-700', 'hover:bg-black'),
]

def nuclear_purge():
    print("NUCLEAR PURGE: Cleaning up hardcoded colors...")
    count = 0
    for folder in folders:
        path = os.path.join(root_dir, folder)
        for root, dirs, files in os.walk(path):
            for file in files:
                if file.endswith(('.tsx', '.ts')):
                    f_path = os.path.join(root, file)
                    try:
                        with open(f_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        new_content = content
                        for pattern, subst in replacements:
                            new_content = re.sub(pattern, subst, new_content)
                        
                        if new_content != content:
                            with open(f_path, 'w', encoding='utf-8') as f:
                                f.write(new_content)
                            print(f"Cleaned: {f_path}")
                            count += 1
                    except Exception as e:
                        print(f"Error in {file}: {e}")
                        
    print(f"Purge complete! {count} files updated.")

if __name__ == "__main__":
    nuclear_purge()
