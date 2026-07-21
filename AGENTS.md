# AGENTS.md

Instructions for AI agents working on this project.

## Required modes and skills

- **Ponytail mode is required.** Always operate in ponytail mode (full intensity by default). If it is not active, activate it first by invoking `/ponytail full`.
- **Caveman mode is required alongside ponytail.** Use caveman communication to keep responses terse and token-efficient while maintaining technical accuracy.
- **Frontend/design tasks use the `design-taste-frontend` skill.** For any web component, page, UI, or design task, load and follow the `design-taste-frontend` skill.

## Before you start

1. Read this file first.
2. Check `README.md` and any `docs/` for project context.
3. Read the relevant code before editing. Trace the actual flow end-to-end.

## How to work

- **Understand first.** Do not edit until you know what the code does and who calls it.
- **Prefer small diffs.** Edit existing files; do not rewrite them from scratch unless asked.
- **Use standard tools.** Use the stdlib or already-installed dependencies before adding new ones.
- **No speculative abstractions.** No interface with one implementation, no factory for one product, no config for a value that never changes.
- **Reuse existing patterns.** Match naming, structure, and conventions already in the repo.
- **Fix root causes.** A single guard in a shared function beats a guard in every caller.
- **Leave a check.** For non-trivial logic, add one small runnable check (a test, an `assert` in a `demo()`, or a `__main__` block) so the next person can verify it still works.
- **Verify before finishing.** Run the relevant tests, linter, or build before declaring done.

## What to avoid

- Boilerplate or scaffolding "for later."
- Clever one-liners that require explanation.
- New dependencies for functionality a few lines can cover.
- Patching only the reported symptom without checking sibling callers.

## Security and safety

- Never skip input validation at trust boundaries.
- Never expose secrets, tokens, or credentials.
- Do not weaken error handling that prevents data loss.
- If a request conflicts with safety or ethics, explain why and stop.

## Communication

- Be concise. Explain the change and any skipped alternatives in a few lines.
- Show file paths clearly when you modify files.
- Ask for clarification when the request is vague or could cause harm.

## Git policy

- **NEVER commit, push, or open PRs unless explicitly asked.**
- **NEVER ask** "¿querés que commitee?" / "shall I commit?" / "should I push?"
- If the user wants to commit, they will ask.

## Testing

- Suggest implementing tests for any new feature added.
- Keep tests minimal: one small runnable check per non-trivial logic path.

## Project-specific notes

- **Next.js 14** App Router + TypeScript + Tailwind CSS.
- **Geist fonts** (Sans, Mono, Pixel) + Open Sauce Sans (hero wordmark).
- **Design tokens** en `globals.css` (variables CSS, no JS theme object).
- **Notion** como CMS: eventos y suscripciones viven en databases de Notion.
- **No Nav** en la landing (removido en v2 por minimalismo); secciones son auto-explicativas.
- **CharTitle** (`components/CharTitle.tsx`) es el wrapper client-side para animación per-char en h2; reutilizarlo para nuevos títulos de sección.
- **Eventos**: pipeline de descubrimiento en `app/api/events/discover` (Luma, Eventbrite, Meetup) → Notion. La web lee `Status = curado` desde `lib/sources/notion.ts`.
- **Newsletter**: `app/api/subscribe` → Notion DB + welcome email vía Resend.
- **Revalidate**: landing y `/eventos` usan `revalidate = 3600` (ISR de 1h).

