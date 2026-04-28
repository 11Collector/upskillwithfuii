import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

old_audit_text = "{quest.title.includes('สรุปผล') ? 'Claim Bonus' : 'Audit'}"
new_audit_text = "{quest.title.includes('สรุปผล') ? 'Claim Bonus' : quest.title.includes('พักกายพักใจ') ? 'พักผ่อน 💤' : 'INFO'}"

content = content.replace(old_audit_text, new_audit_text)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
