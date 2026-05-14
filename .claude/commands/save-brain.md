Add new knowledge to Second Brain from an article or content the user provides.

## Steps

1. Read the current `src/data/second-brain.md` to understand existing structure and avoid duplicates
2. Analyze the article/content the user provided and extract:
   - Core ideas and frameworks (2-5 bullet points)
   - Actionable insights that can be used in content
   - Quotable sentences (คำคมหรือประโยคที่จำง่าย)
   - Which content pillar this belongs to (Mindset/Career/Money/Self-awareness/Focus/Learning/Reflection)
3. Append to `src/data/second-brain.md` under a new section:

```
---
## [TITLE OF ARTICLE] — [PILLAR] — added [DATE]
> Source: [ระบุแหล่งที่มา เช่น บทความของฉัน / ชื่อหนังสือ / URL]

**แนวคิดหลัก:**
- [idea 1]
- [idea 2]

**ใช้ใน content:**
- [how to apply this in a post]

**ประโยคคม:**
> "[quote]"
```

4. Also update `src/data/second-brain.md` in the main repo path (same file, same content)
5. Confirm what was added in 2-3 sentences

## Rules
- Never overwrite existing content — always append
- If the article overlaps with existing knowledge, note the connection instead of duplicating
- Keep extracted ideas concise — second brain is a reference, not a copy of the article
