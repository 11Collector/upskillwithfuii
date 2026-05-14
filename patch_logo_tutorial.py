import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

old_logo = """<img src="/logo-upskill.png" alt="Upskill Logo" className="w-16 h-16 object-contain drop-shadow-md" />"""
new_logo = """<img src="/logo-invert.png" alt="Upskill Lightbulb" className="w-16 h-16 object-contain drop-shadow-md" />"""

content = content.replace(old_logo, new_logo)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
