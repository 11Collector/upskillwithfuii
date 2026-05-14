Generate a daily content post for upskilleveryday.com using Second Brain + external research.

## Step 1 — Load references
Read both files before writing anything:
- `src/data/brand-voice.md` — tone, style, dos and don'ts
- `src/data/second-brain.md` — core ideas, books, quotes, frameworks

## Step 2 — Parse arguments
- Platform: `social` (80-120 words) or `article` (300-500 words). Default: `social`
- Pillar: if not specified, pick by today's day of week:
  - Mon = Mindset, Tue = Career, Wed = Money, Thu = Self-awareness, Fri = Focus, Sat = Learning, Sun = Reflection
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

For `article` format: expand each section, add subheadings, include 2-3 sources, end with a link to the relevant platform tool.

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
