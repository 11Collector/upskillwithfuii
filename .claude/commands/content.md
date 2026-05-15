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
- Every post must have one specific idea, not generic encouragement
- The external source must be real and verifiable — never fabricate citations
- If no strong external source found, rely on second-brain only and note it
- Avoid: "unlock your potential", "be the best version", "hustle"
