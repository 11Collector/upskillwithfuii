import os
import glob
import re

files = [
    "src/app/tools/soul-guide/page.tsx",
    "src/app/tools/library-of-souls/info/page.tsx",
    "src/app/tools/library-of-souls/page.tsx",
    "src/app/tools/ai-mentor/info/page.tsx",
    "src/app/tools/ai-mentor/page.tsx",
    "src/app/tools/wheel-of-life/page.tsx",
    "src/app/dashboard/page.tsx"
]

for file in files:
    if not os.path.exists(file): continue
    with open(file, "r") as f:
        content = f.read()
    
    # We want to add loading="lazy" decoding="async" to <img tags that don't have them
    # But only to standard images, let's just do a naive replace
    
    # Find all <img tags
    parts = content.split('<img ')
    new_content = parts[0]
    for part in parts[1:]:
        if 'loading="lazy"' not in part and 'fetchPriority' not in part:
            new_content += '<img loading="lazy" decoding="async" ' + part
        else:
            new_content += '<img ' + part
            
    with open(file, "w") as f:
        f.write(new_content)

print("Images optimized.")
