# Profile README Facts Refresh Design

## Goal

Refresh the public organization profile so its Android project description
matches the current `baomao_android` repository and its generated statistics
reflect the latest organization data.

## Scope

Update `profile/README.md` without redesigning the page:

- name the Android client as **天晴** while retaining `baomao_android` as the
  repository and code identity;
- change the Android project status from `MVP 0A` to `MVP 1` and state that it
  is connected to the real backend;
- update the architecture introduction and Android node label to use the same
  product name and repository identity;
- run `scripts/update-stats.mjs` so all automation-managed blocks and badge
  assets are regenerated from current organization data.

## Content Rules

- Treat `baomao_android/README.md` as the source of truth for the public product
  name, milestone, connection model, and backend integration status.
- Do not rename the repository, package, links, or internal `baomao` identity.
- Keep all other project descriptions unchanged.
- Preserve every top-level section, visual asset, HTML wrapper, table column,
  Mermaid style, and automation marker.
- Do not hand-edit generated statistics inside `STATS:BADGES`, `LANGS`,
  `LEADERBOARD`, or `MEMBERS` markers.
- Do not publish private hosts, credentials, signing details, or operational
  procedures from the Android repository.

## Verification

- confirm the profile contains `天晴`, `baomao_android`, `MVP 1`, and an accurate
  real-backend statement;
- confirm the old `MVP 0A` wording is absent;
- run the existing stats configuration test and stats refresh script;
- compile the Mermaid block and verify the generated SVG is non-empty;
- compare structural markers and section headings with `origin/main`;
- run `git diff --check` and inspect all changed generated assets.
