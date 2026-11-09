---
name: feature-spec
description: Start the spec for the next roadmap feature - make a branch, interview the user with AskUserQuestion, then write a dated spec folder (plan.md, requirements.md, validation.md) under specs/. Use whenever the user asks to spec, plan, or start the next phase or feature, says "next phase", "feature spec", or "write the spec" for something on specs/roadmap.md, or names a phase or group of phases (for example "the MVP", "Phase 3"). Use it even if they do not say the word "skill" or name the files. This writes specs only; it does not implement.
---

# Write a feature spec

Spec first, code second: every feature in this project gets an agreed spec folder before any implementation. This skill produces that folder, and the user's answers shape it, so the interview is the important part, not a formality.

The user may name a phase or feature (for example "MVP" or "Phase 3"). If they do, spec that. Otherwise spec the next roadmap phase that is not built yet.

## Steps

1. **Read the guidance.** Read `specs/roadmap.md`, `specs/mission.md`, and `specs/tech-stack.md`. Then read the existing feature folders under `specs/` (newest first) and use them as the model for format, depth, and tone. Keep the new spec consistent with what they already decided.

2. **Find the target.** Work out which roadmap phase is next. Existing spec folders, `CHANGELOG.md`, `git log`, and the code show what is already built; the roadmap itself has no "done" markers. If it is unclear which phase is meant, ask in the interview instead of guessing.

3. **Make the branch.** Check `git branch --show-current` and `git status --short` first. Create a branch from the right base with `git checkout -b <name>` (for example `phase-3-therapies` or `mvp`). Use `main` as the base, unless the previous work is not merged yet and this feature builds on it; then branch from where that work lives and say so. Do not create a branch if the working tree has unrelated uncommitted changes; tell the user instead.

4. **Interview before writing anything.** Use the AskUserQuestion tool, and do not write any file until the answers are in. The user wants the questions grouped on the three files that will be written, so the interview covers:
   - **Plan** - how to slice the work into numbered task groups, and the main implementation approach (for example how to structure data access or whether to keep the phase whole or split it).
   - **Requirements** - scope, what is explicitly out of scope, and the key decisions (data model, behaviour, edge cases, anything the roadmap leaves open).
   - **Validation** - how we will know it worked and can be merged (test approach, end-to-end checks, manual checks).

   AskUserQuestion accepts at most 4 questions per call, so keep each question tight and put the choice that matters most first. Make 2-4 options per question, mark your recommended option "(Recommended)" and list it first, and make every question self-contained, since the user may see only the dialog. Use multiSelect for choices that are not mutually exclusive. Ask only what the roadmap and existing specs cannot answer. If the user wants to clarify a question, ask what they would like to change, then reformulate; do not push ahead.

5. **Write the spec folder** at `specs/YYYY-MM-DD-feature-name/`, using today's date and a short kebab-case name. Create exactly three files:
   - `plan.md` - a series of numbered task groups (`## Group 1 - ...`), with tasks numbered continuously across groups. End with a verify group that runs `npm run validate`, starts the dev server and checks the main pages with `curl`, and updates `CHANGELOG.md`. Name real files, routes, and migrations so the plan can be followed without guessing.
   - `requirements.md` - sections for Scope, Out of scope, Decisions, Context (link `specs/mission.md`, `specs/tech-stack.md`, the roadmap, and the earlier feature specs), and Stakeholder notes. Record the user's interview answers as decisions, and record any decision you made yourself without asking, so nothing is silent.
   - `validation.md` - a numbered "done when" list, each item checkable. Tests live in `tests/` and run with `npm test`; `npm run validate` (typecheck plus tests) must pass. Separate automated criteria from manual ones, and say plainly when something cannot be tested automatically.

6. **Hold to the project-wide rules.** Every feature spec needs responsive acceptance criteria (mobile-first, usable from about 320px up, no horizontal page scrolling; wide tables scroll inside their own container), because `specs/roadmap.md` makes that a cross-cutting requirement. Specs must also respect `specs/tech-stack.md`; if the feature genuinely needs to change the stack, say so in the requirements and list the doc to update.

7. **Report and stop.** Summarise what was created (branch, folder, the three files), the answers that shaped it, and any decisions made without asking. Do not commit, push, merge, or start implementing; the user reviews the spec first and will ask for those steps.

## Rules

- No files before the AskUserQuestion interview is answered.
- Source the plan from the roadmap and the user's answers; do not invent scope beyond them. If you pull a later roadmap item in, call it out as a decision.
- Keep the spec small and readable; the audience includes course students.
- Keep dates ISO (`YYYY-MM-DD`), and use the environment's current date for the folder name.
