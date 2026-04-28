import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

old_classes = "absolute top-[calc(100%+12px)] right-0 md:left-1/2 md:-translate-x-1/2 bg-slate-900/90"
new_classes = "absolute top-[calc(100%+12px)] right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 bg-slate-900/90"

content = content.replace(old_classes, new_classes)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
