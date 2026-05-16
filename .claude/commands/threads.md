Convert a content piece into a Twitter/X thread in the upskilleveryday.com brand voice.

## Input
- Paste the content to convert, OR reference the latest /content output
- Optional: specify tone tweak (e.g. "เน้น data", "เน้น story", "เน้น controversy")

## Step 1 — Load brand voice
Read `src/data/brand-voice.md` for tone and style rules before writing.

## Step 2 — Thread Structure Rules

**Format ต่อ tweet:**
- ทุก tweet ไม่เกิน 280 ตัวอักษร (นับ emoji ด้วย)
- ขึ้นต้นแต่ละ tweet ด้วยเลข `1/` `2/` `3/` ตาม Modular Logic ของแบรนด์
- ทุก tweet ต้องอ่านแล้วรู้สึกได้คุณค่าในตัวเอง — ไม่ใช่แค่ continuation

**โครงสร้าง Thread:**
```
1/ HOOK — ประโยคแรกต้องหยุด scroll ได้ทันที (specific, surprising หรือ challenge belief)

2/ - 4/ INSIGHT — ขยายแนวคิดหลัก ทีละ tweet ทีละ idea
     - ใช้ contrast, boolean-style หรือ list สั้นๆ
     - ถ้ามีตัวเลข/สถิติต้องระบุ source

5/ - 6/ (optional) STORY หรือ EXAMPLE — เล่าสั้นๆ 1-2 tweet ถ้าช่วยให้เข้าใจขึ้น

ก่อนจบ/ ACTION — สิ่งที่ทำได้วันนี้ใน 1 tweet

ท้ายสุด/ CLOSE + CTA
     - ปิดด้วยประโยคคมแบบ brand
     - ลงท้ายด้วย "ปล." ชวน engage เสมอ
     - ใส่ #upskilleveryday และ hashtag ที่เกี่ยวข้อง
```

**จำนวน tweet:** 5-8 tweet ต่อ thread (ไม่เกิน 10)

## Step 3 — Brand Voice Rules for X
- โทนเพื่อน ไม่ใช่ครู — เขียนเหมือนเล่าให้คนรู้จักฟัง
- ห้าม Wall of Text — ถ้า tweet ยาวเกิน 3 บรรทัดให้ตัดแบ่ง tweet ใหม่
- ภาษาพูดได้ เช่น "โคตรดี", "จริงอะ", "ลองดูสิ"
- ความคิดเห็นต้อง label ว่าเป็นมุมมองส่วนตัว ถ้าไม่มี research รองรับ
- ตัวเลข/สถิติต้อง verify จากแหล่งจริงเท่านั้น

## Output Format
แสดงผลแบบ copy-paste ready — แต่ละ tweet คั่นด้วย `---` เพื่อให้โพสต์ง่าย

```
1/ [tweet text]

---

2/ [tweet text]

---
...
```

พร้อมบอก **จำนวน tweet** และ **tweet ที่ยาวที่สุด (จำนวนตัวอักษร)** ท้ายสุด
