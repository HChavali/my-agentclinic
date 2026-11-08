---
name: changelog
description: Update CHANGELOG.md in the project root from git commits, with a heading per date. Invoke manually before merging a branch.
disable-model-invocation: true
---

# Update the changelog

Keep `CHANGELOG.md` in the project root: one heading per date, newest first, with bullets summarizing what changed that day. Run this by hand before merging.

## Format

```markdown
# Changelog

## 2026-11-08
- Added Hono server with shared Header/Main/Footer layout
- Required responsive, mobile-first design across specs and CSS

## 2026-11-07
- ...
```

- Date headings are `## YYYY-MM-DD` (ISO), newest at the top, under a single `# Changelog` title.
- Bullets are short, past tense, and describe user-visible or project-level changes, not commit hashes.
- Group a day's commits into a few meaningful bullets; merge noise like "fix typo" or "restructure" follow-ups into the bullet they belong to.

## Steps

1. **Check state.** Run `git branch --show-current` and `git status --short`. Warn if there are uncommitted changes (they won't be in the changelog).
2. **Find what's missing.**
   - If `CHANGELOG.md` does not exist: read the full history with `git log --reverse --format='%ad|%h|%s' --date=short` and build the file from scratch.
   - If it exists: take the newest date heading in the file, then list commits from that date onward: `git log --since=<that date> --format='%ad|%h|%s' --date=short`. Skip commits already summarized under existing headings.
3. **Group by commit date** (author date, `YYYY-MM-DD`). Read commit bodies or `git show --stat <hash>` when a subject is unclear.
4. **Write the entries.** Add new date headings above older ones, or append bullets under an existing heading for the same date. Never rewrite or reorder older entries.
5. **Show the result.** Print the new/changed section and ask the user to confirm before they merge. Do not commit, push, or merge; leave `CHANGELOG.md` as an uncommitted edit for the user to review and include.

## Rules

- Source of truth is git history; don't invent changes.
- Don't include the changelog update itself as a bullet.
- If there are no new commits since the last heading, say so and make no changes.
