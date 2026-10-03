---
name: sparck-release
description: Prepare and open a Spärck pull request to master by validating the branch, running quality and coverage checks, reviewing the complete diff, and writing an accurate PR title and description. Use when a contributor asks to prepare, publish, or open a release PR. Do not use to merge the PR or create a production release.
---

# Spärck Release

Prepare one reviewable PR from the current branch to `master`. Keep the process
predictable and stop on any failed guard or check.

## Authorization boundary

- Invoking the skill to inspect or prepare a PR does not authorize commits,
  pushes, rebases, force pushes, or opening the PR.
- Treat an explicit request to "abrir", "crear", "publicar" or "enviar" the PR
  as authorization to push the current branch when needed and create the PR.
- Never merge the PR, delete branches, create tags, or publish a GitHub Release.
- Never force push. If updating from `master` would rewrite history or create
  conflicts, stop and ask for direction.

## Preflight

1. Confirm repository root, clean working tree, and current branch:

   ```bash
   git status --short --branch
   git branch --show-current
   ```

2. Stop if the branch is `master`, detached, dirty, or has no commits beyond
   `origin/master`. Do not silently commit local work.
3. Fetch `origin/master`, then require the current branch to contain it:

   ```bash
   git fetch origin master
   git merge-base --is-ancestor origin/master HEAD
   ```

4. Inspect changed filenames before reading diffs. Block the release if tracked
   secrets, credentials, `.env` files, generated artifacts, or unrelated changes
   appear. Never echo secret values.
5. Run every required check from repository root:

   ```bash
   pnpm lint
   pnpm exec tsc --noEmit
   pnpm test:coverage
   pnpm build
   ```

Stop at the first failure. Report the failing command and useful error summary.
Do not open the PR with failing checks.

## Understand the release

Review the complete branch, not only the last commit:

```bash
git log --oneline origin/master..HEAD
git diff --name-status origin/master...HEAD
git diff --stat origin/master...HEAD
git diff origin/master...HEAD
```

Identify user-visible behavior, implementation changes, configuration or
environment changes, test coverage, risks, migrations, and follow-up work. Do
not invent motivation, issue numbers, verification, or impact absent from the
diff.

## Write the PR

Create a concise Spanish title that describes the main outcome. Prefer the
repository's conventional style (`feat:`, `fix:`, `refactor:`, `docs:`,
`chore:`) when one category clearly fits.

Use this body structure, omitting empty sections:

```markdown
## Resumen

- Resultado principal del cambio.
- Segundo resultado relevante, si existe.

## Cambios

- Detalle concreto derivado del diff.

## Verificación

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm test:coverage`
- `pnpm build`

## Riesgos o notas

- Riesgo, variable de entorno, migración o seguimiento real.
```

Do not paste a file-by-file changelog. Explain outcomes and only the technical
details reviewers need.

## Publish

1. Push the current branch normally if it has no upstream or unpublished
   commits. Never use `--force` or `--force-with-lease`.
2. Check whether a PR already exists for the branch. Update it instead of
   creating a duplicate.
3. Open a non-draft PR against `master` unless the user explicitly asks for a
   draft. Prefer GitHub CLI. Use a safely created body file so diff content is
   never interpolated into shell commands.
4. If GitHub CLI is unauthenticated, use an available authenticated GitHub
   connector or browser. If none exists, stop and report the authentication
   blocker.
5. Return the PR URL, title, checks executed, and coverage percentages. State
   clearly that review and merge remain pending.
