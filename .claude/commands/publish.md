Publish an article to the Upskill with Fuii library (คลังสมองอัพสกิล) directly to Firestore via `scripts/publish-article.mjs` — no admin UI, no dev server needed.

**Default behavior:** ใช้บทความล่าสุดที่ generate ใน conversation นี้เลย ไม่ต้องให้ user วางเนื้อหาซ้ำ ถ้าไม่มีบทความในบทสนทนาค่อยถาม

## Step 1 — Ask if not provided
If category is not specified, ask only:
- **Category:** หนังสือ / พัฒนาตัวเอง / การเงิน & ลงทุน / ธุรกิจ

## Step 2 — Generate article fields
From the content provided, create:
- `slug` — lowercase, hyphenated, Thai words romanized (e.g. "atomic-habits-summary"), no special chars or spaces
- `title` — ชื่อบทความ (ถ้าไม่มีให้ generate ให้ดูน่าอ่าน เป็นสไตล์เพื่อน)
- `excerpt` — 1-2 ประโยคดึงดูดใจ บอกว่าบทความนี้พูดถึงอะไร (max 100 คำ)
- `summary` — 1 ประโยคสรุปแก่นของบทความ (ใช้แสดงใต้ชื่อ)
- `category` — ตามที่เลือก (หนังสือ / พัฒนาตัวเอง / การเงิน & ลงทุน / ธุรกิจ)
- `readTime` — ประเมินจากความยาว (ประมาณ 200 คำ/นาที)
- `date` — วันที่วันนี้ในรูปแบบ "DD MMM YYYY" ภาษาไทย เช่น "14 พ.ค. 2026"
- `content` — เนื้อหาทั้งหมด format ด้วย Markdown (### สำหรับหัวข้อย่อย, **bold**, > blockquote สำหรับประโยคคม)

## Step 3 — Publish via script

Write the article data to a temp JSON file then run the script:

```bash
# Write payload to temp file (Python handles Thai/special chars safely)
python3 -c "
import json
article = {
  'title': 'TITLE_HERE',
  'slug': 'SLUG_HERE',
  'excerpt': 'EXCERPT_HERE',
  'summary': 'SUMMARY_HERE',
  'category': 'CATEGORY_HERE',
  'readTime': 'READTIME_HERE',
  'date': 'DATE_HERE',
  'content': '''CONTENT_HERE'''
}
print(json.dumps(article, ensure_ascii=False))
" | node scripts/publish-article.mjs
```

Replace each placeholder with the actual value. Use triple-quoted Python string for `content` to safely embed multi-line Markdown.

## Step 4 — Confirm
On success the script prints:
```
✅ Published: "title"
   ID: XX
   URL: /library/slug
```

Report the title, URL, and ID to the user.

## Rules
- Content ต้องเป็น Markdown — ใช้ ### สำหรับหัวข้อ, **bold** สำหรับคำสำคัญ, > สำหรับ quote
- ห้ามแก้เนื้อหาหลักของผู้ใช้ — แค่ format และเพิ่ม structure
- ถ้าเนื้อหายังไม่มี closing paragraph ให้เพิ่ม "สรุปส่งท้าย" สั้นๆ ปิดท้าย
- slug ต้องไม่มีอักขระพิเศษหรือช่องว่าง
- ไม่ต้องแก้ไข `src/constants/article.ts` — Firestore คือ source of truth
- รัน script จาก project root (`/Users/thanawatlovitayaolan/upskillwithfuii-web`)
