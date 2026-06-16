Generate a daily content post for upskilleveryday.com using Second Brain + external research.

## Step 1 — Load references
Read both files before writing anything:
- `src/data/brand-voice.md` — tone, style, dos and don'ts. Use this for **voice and style only** — do NOT borrow sentences, hooks, or ideas from examples in this file
- `src/data/second-brain.md` — use **frameworks and book concepts only** (Core Thesis, book summaries, quote patterns). The Content Log section is for **avoiding repeats only** — never reuse or remix previous post ideas into new content

## Step 2 — Parse arguments
- Platform: `social` (80-120 words) or `article` (300-500 words). Default: `social`
- Pillar: if not specified, pick by today's day of week:
  - Mon = Mindset, Tue = AI, Wed = Money, Thu = Self-awareness, Fri = Focus, Sat = Learning, Sun = Reflection
  - Career rotates in as alternate for Tue every other week
- Tool tie-in: if specified, reference that platform tool naturally

## Step 3 — Research from reliable external sources
Search for 1-2 recent, credible sources related to today's pillar. Prioritize:
- Research-backed: Harvard Business Review, psychology journals, McKinsey, MIT
- Books & authors: James Clear, Greg McKeown, Cal Newport, Adam Grant, Simon Sinek, Brené Brown
- Thai context when relevant: งานวิจัยไทย, สถาบันที่น่าเชื่อถือ

Use these to add one specific data point, study finding, or expert insight into the content — something the reader can't Google in 5 seconds.

## Step 4 — Write the content
Structure:
```
HOOK (1 sentence — specific, surprising, or challenges a common belief)

INSIGHT (2-3 sentences — combine second-brain idea + external source finding)

ACTION (1 concrete thing to do today, under 5 minutes)

REFLECTION PROMPT (1 open-ended question)

แหล่งอ้างอิง: [source name] — [1 line summary of what it contributed]

#upskilleveryday #พัฒนาตัวเอง #[pillar hashtag]
```

For `article` format: expand each section, add subheadings, include 2-3 sources. Only add a platform tool link if it genuinely fits the content — skip it if forcing it feels unnatural.

**Article title rules:**
- Title must be plain text — no hashtags, no emoji, no brackets
- Style it like a hook sentence from brand-voice.md: conversational, specific, challenges a belief
- Examples of good titles: "ทำไมคนฉลาดถึง procrastinate มากกว่าคนทั่วไป" / "อีโก้ซ่อนตัวในคำว่า ฉันแค่ตรงไปตรงมา" / "ทักษะที่ resume วัดไม่ได้ แต่หัวหน้าสังเกตเห็นทุกวัน"
- Never use: "5 วิธี...", "คู่มือ...", "วิธีที่ดีที่สุด..." — too generic

## Step 5 — Save to Second Brain
After generating the content, append a new entry to `src/data/second-brain.md` under a section `## Content Log` at the bottom of the file:

```
### [DATE] — [PILLAR] — [PLATFORM]
**Hook:** [hook sentence]
**Core idea:** [1 sentence summary]
**Source used:** [source name]
**Published:** [social/article]
```

This builds a running log so future content doesn't repeat the same ideas and can build on previous posts.

## Rules
- Thai only. Peer tone — not teacher, not motivational speaker
- ศัพท์อังกฤษเทคนิคทุกคำ ต้องวงเล็บแปลไทยง่ายๆ ต่อท้ายทันที เช่น Spaced Repetition (การทบทวนแบบเว้นช่วง), Massed Learning (ท่องยัดครั้งเดียว)
- **การจัดแต่ง Markdown เพื่อความสวยงามบนหน้าเว็บ (Aesthetics):**
  - **สำหรับ Article:** ไม่ต้องใส่หัวข้อ ACTION, REFLECTION PROMPT หรือกล่อง `Note จากฟุ้ย` ด้านล่างบทความ เพื่อป้องกันความรกทางสายตา ให้เขียนจบเนื้อหาหลักแล้วใส่แหล่งอ้างอิงทันที จากนั้นปิดท้ายด้วย `ปล.` แบบข้อความธรรมดาที่สั้น กระชับ **ยาวเพียง 1 บรรทัด (1 ประโยค) เท่านั้น** (เช่น ชวนตอบคำถามเกี่ยวกับเรื่องที่เพิ่งอ่าน หรือเชิญชวนไปเล่นเครื่องมือของเว็บที่เกี่ยวข้อง)
  - **การใช้ Bullet Points:** หากเนื้อหาในย่อหน้าหรือหัวข้อใดยาวหรือซับซ้อนเกินไป ให้ใช้รายการสัญลักษณ์ Bullet points (`-`) เพื่อแตกประเด็นย่อย ช่วยเพิ่มความอ่านง่าย (Scannability) และลดความแน่นของตัวอักษร
  - **การใช้ Backticks:** ใส่เครื่องหมาย backticks (`` `inline code` ``) ครอบคำศัพท์เทคนิคหลักๆ เท่านั้น (เช่น `` `Cognitive Offloading` ``) หลีกเลี่ยงการใช้กับคำศัพท์ภาษาอังกฤษทั่วไป เพื่อไม่ให้เกิดป้ายคำสี่เหลี่ยมสีดำขัดตารกหน้าจอ หรือคำแตกหักแบ่งครึ่งขึ้นบรรทัดใหม่
  - เว้นบรรทัดเปล่า 1 บรรทัดคั่นระหว่างย่อหน้าและหัวข้อ `###` เสมอ
- Every post must have one specific idea, not generic encouragement
- The external source must be real and verifiable — never fabricate citations
- If no strong external source found, rely on second-brain only and note it
- Avoid: "unlock your potential", "be the best version", "hustle"


## Fact-checking Rules (STRICT)
- **ตัวเลขและสถิติ**: ต้อง verify จากแหล่งจริงเท่านั้น — ระบุชื่อ source, ปีที่เผยแพร่, และลิงก์ถ้ามี ห้ามประมาณหรือแต่งตัวเลขขึ้นมาเอง
- **งานวิจัย**: ต้องระบุชื่อ study, สำนักพิมพ์/journal, และปี — ถ้าหาไม่ได้ให้ตัดออก ไม่ใช่แต่งขึ้น
- **ความคิดเห็น**: ถ้าเป็น insight หรือมุมมองที่ไม่มีงานวิจัยรองรับ ให้ระบุชัดเจนว่า "มุมมองส่วนตัว" หรือ "จากประสบการณ์" แทนที่จะเขียนราวกับว่าเป็นข้อเท็จจริง
- **ถ้า verify ไม่ได้**: ให้ตัดข้อมูลนั้นออก หรือเปลี่ยนเป็นความคิดเห็นที่ label ชัดเจน — ดีกว่าใส่ข้อมูลที่ไม่แน่ใจ
