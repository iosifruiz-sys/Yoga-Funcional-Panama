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
