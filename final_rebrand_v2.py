import os
import re

# Direct path to your project on D: drive
root_dir = r'D:\tmleen'
folders = ['app', 'components', 'styles']

# THE FINAL V2.0 BRAND SYSTEM (Hard Enforcement)
# ---------------------------------------------
# Ink (Main Text/Buttons): #1A1A1A
# Accent (Links/Active): #2563EB
# Surface (Backgrounds): #FFFFFF
# Subtle (Sections): #F9FAFB
# ---------------------------------------------

replacements = [
    # 1. DELETE AI SIGNATURES (Animations)
    (r'animate-float', ''),
    (r'animate-pulse', ''),
    (r'animate-bounce', ''),
    (r'animate-shimmer', ''),
    (r'animate-slide-up', ''),
    (r'animate-fade-in', ''),
    
    # 2. DELETE GLASSMORHISM & HEAVY SHADOWS
    (r'backdrop-blur-[a-z0-9]+', ''),
    (r'bg-opacity-[0-9]+', ''),
    (r'shadow-(xl|2xl|premium|glow|lg)', 'shadow-sm'),
    (r'border-glass', 'border-gray-100'),
    (r'bg-glass', 'bg-white'),
    
    # 3. COLOR TRANSFORMATION (Old to v2.0)
    # Map all blue/indigo variants to either INK (Dark) or ACCENT (Blue)
    (r'primary-indigo-600', 'ink'),
    (r'primary-indigo-500', 'ink'),
    (r'primary-indigo-50', 'subtle'),
    (r'blue-600', 'accent'),
    (r'blue-500', 'accent'),
    (r'blue-50', 'subtle'),
    (r'action-blue', 'accent'),
    (r'indigo-600', 'ink'),
    
    # 4. REMOVE GRADIENTS (Solidify)
    (r'bg-gradient-to-[a-z]+ from-[a-z0-9/-]+ to-[a-z0-9/-]+', 'bg-ink'),
    
    # 5. UNIFY CORNERS
    (r'rounded-full', 'rounded-xl'),
    (r'rounded-2xl', 'rounded-xl'),
    (r'rounded-3xl', 'rounded-xl'),
    
    # 6. TYPOGRAPHY CLEANUP
    (r'font-black', 'font-bold'),
]

def final_rebrand_execution():
    print("Starting Final Rebrand Execution for Tmleen v2.0...")
    count = 0
    for folder in folders:
        path = os.path.join(root_dir, folder)
        if not os.path.exists(path): continue
        
        for root, dirs, files in os.walk(path):
            for file in files:
                if file.endswith(('.tsx', '.ts', '.css')):
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
                            print(f"Refined: {file}")
                            count += 1
                    except Exception as e:
                        print(f"Error in {file}: {e}")
                        
    print(f"\n✅ SUCCESS! {count} files updated to Tmleen v2.0 Standard.")

if __name__ == "__main__":
    final_rebrand_execution()
