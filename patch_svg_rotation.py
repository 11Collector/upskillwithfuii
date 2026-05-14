import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# Remove the -rotate-90 class from the svg tag
old_svg = '<svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">'
new_svg = '<svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">'

content = content.replace(old_svg, new_svg)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
