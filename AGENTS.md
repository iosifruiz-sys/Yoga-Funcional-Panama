# Yoga Funcional Panama — Development Rules

## Existing site is the source of truth
Do not change existing layout, typography, spacing, responsive behavior, content or visual appearance unless explicitly requested.
Always make the smallest possible change.

## Scope control
Before changing code:
- identify the exact page, language, component and breakpoint involved;
- determine whether the relevant code is shared;
- prefer scoped/local changes;
- never change global CSS to solve a local problem unless absolutely necessary;
- never refactor unrelated code during a fix.

## Bilingual protection
The site has Spanish and Russian versions.
A change to ES must not unintentionally affect RU.
A change to RU must not unintentionally affect ES.
Language-specific visual fixes should be scoped to that language.

## Responsive protection
Desktop and mobile must be treated separately.
Desktop fixes must not unintentionally affect mobile.
Mobile fixes must not unintentionally affect desktop.

## Visual regression protection
Do not unintentionally change:
- font sizes
- line heights
- margins/padding
- section heights
- positioning
- overflow
- breakpoints
- accordion dimensions
- image sizing/cropping

## CSS safety
Before modifying CSS:
- locate the existing rule;
- identify all selectors/media queries affecting it;
- determine whether it is global or scoped;
- avoid duplicate overrides;
- never replace large CSS sections for a small visual fix.

## Git safety
Never restore or replace an entire current file from an older commit to solve a local issue unless explicitly requested.
Before using historical code, verify that newer intentional changes will not be lost.

## Verification
After every code change:
- run the existing build/check commands;
- inspect git diff;
- verify only relevant files changed;
- check for regressions affecting:
  - Spanish homepage
  - Russian homepage
  - Spanish blog
  - Russian blog
  - desktop
  - mobile.

If verification cannot be performed, explicitly say so.

## Completion report
Before reporting a task complete, state:
- files changed;
- exact changes made;
- checks performed;
- whether anything outside the requested scope changed.

## Opt-in specialist-agent workflow

Agent review is opt-in and must be explicitly requested by the user.

Do not invoke any specialist agent, reviewer, skill, `visual-qa`, `code-review`, or `emil-design-eng` / Kowalski for an ordinary task unless the user explicitly requests that review in the current task. Do not infer agent use from the fact that work involves UI, CSS, typography, layout, responsive behavior, copy, bug fixes, visual tweaks, or refactoring.

### Default workflow

Unless the user explicitly requests agent review:

1. Inspect the relevant code directly.
2. Make the smallest requested change without broadening scope.
3. Run only the necessary lightweight validation, including `git diff --check` and, when relevant, `npm run check` and `npm run build`.
4. Inspect and report the exact diff or a precise summary.
5. Do not launch agents automatically before or after implementation.

### Explicit agent requests

Invoke agents or skills only when the user explicitly asks to run the task through agents, use Kowalski, perform `code-review`, run `visual-qa`, review with agents, or gives an equivalent direct instruction.

If the user requests one specific agent, invoke only that agent. Invoke a multi-agent pre/post pipeline only when the user explicitly requests that pipeline. Follow the requested agent's authoritative instructions and report its actual findings truthfully.

If an explicitly requested agent cannot be invoked, stop at the point where its review is required and report the unavailable agent or skill.

Never claim a Kowalski review, agent review, design review, or specialist review unless the relevant installed agent or skill was actually invoked. Include an `AGENTS ACTUALLY INVOKED` section only when agents or skills were in fact invoked or when the user explicitly requests that section.

## Installed project specialists and invocation

The installed project skills under `.agents/skills/` are:

- `emil-design-eng` — Kowalski design-engineering and UI review;
- `mobile-native` — mobile-web and touch-behavior review;
- `animate` — motion implementation;
- `review-animations` — review of existing animation and motion code;
- `improve-animations` — read-only codebase motion audit and implementation planning;
- `find-animation-opportunities` — read-only discovery of appropriate motion opportunities;
- `animation-vocabulary` — identification of named motion patterns;
- `pick-ui-library` — explicitly invoked UI-library selection;
- `prototype` — explicitly invoked UI prototyping.

Their authoritative instructions are the corresponding `.agents/skills/<name>/SKILL.md` files. Invoke them through the skill mechanism exposed by the current Codex environment; reading a `SKILL.md` without applying it to the task is not an invocation.

The installed read-only custom agents under `.github/agents/` are:

- `code-review` — regression, scope, CSS, bilingual, responsive, and architecture review;
- `visual-qa` — visual regression and layout QA across ES/RU and desktop/mobile.

Invoke custom agents through the agent/delegation mechanism exposed by the current environment only after an explicit user request. Reading an agent or skill file without applying it is not an invocation.

## RU and ES isolation

The ES desktop version is a protected visual baseline. RU-only work must not modify ES behavior.

For RU desktop-only work:

- treat existing unprefixed/shared desktop selectors as golden-owned;
- do not modify a shared selector merely to solve an RU issue;
- use additive RU-scoped overrides whenever technically possible;
- keep RU desktop overrides inside the existing desktop breakpoint;
- explicitly scope them through `html[lang='ru']`.

Preferred form:

```css
@media (min-width: 62rem) {
  html[lang='ru'] .specific-section .specific-target {
    /* only the explicitly requested RU-only property */
  }
}
```

Protected shared surfaces include, but are not limited to:

- Hero: `.hero`, `.funcional`, `.panama`, `.hero-photo`, `.reserve`, `.hero-meta`;
- Method: `.method-intro`, `.method h2`, `.method-copy`;
- Concepts: `.concepts`, `.concepts li`, `.concept-toggle`, `.concepts strong`;
- Classes: `.classes h2`, `.class-format`, `.class-format h3`, `.format-price`, `.format-copy`, `.format-action`;
- Schedule: `.schedule-intro`, `.schedule h2`, `.schedule h2 span`, `.schedule-list`, `.schedule-slot`, `.schedule-day`, `.schedule-time`, `.schedule-booking`;
- About: `.about`, `.about-header`, `.about-reveal`, `.about-stage`, `.about-visual`, `.about-copy`, `.about-statement`;
- Contact: `.contact`, `.contact-title`, `.contact-closing`, `.contact-action`.

If an RU-only task appears to require a shared selector change, stop and explain why the shared change appears necessary. Do not make a shared ES+RU change without explicit user approval. Invoke a specialist review only if the user explicitly requests it.

## Typography must not silently change geometry

For a typography, font-size, or wrapping task, do not compensate by changing grid, flex, width, max-width, height, min-height, padding, margin, transform, positioning, section geometry, or component markup unless the user explicitly requests a geometry or layout change.

When the requested problem is font size or wrapping, change only the required typography property whenever technically possible.

## ES desktop golden baseline

The documented ES desktop golden baseline is:

- commit: `7129ebbaba3e8f323681954502430e37e330568b`;
- tag: `es-desktop-golden`.

The current execution clone is known to lack this commit object and tag and has no configured Git remote from which they can be recovered. Do not fabricate, recreate, substitute, or repoint this reference.

For future RU desktop production work, perform the exact golden comparison whenever it is required and the reference is available. If the reference is unavailable, report that limitation truthfully and stop at the point where exact comparison becomes required. Never claim that ES is unchanged unless the required comparison was actually performed.

The missing golden object never authorizes modification of shared ES/RU selectors. The opt-in agent policy and RU/ES isolation requirements remain mandatory.

## Stop instead of guessing

If an explicitly requested agent or skill, dependency, reference, repository fact, or validation step is unavailable, do not silently replace it with an approximation. Stop when the missing requirement becomes necessary and report it.
