# PR Description (Short)

## Title
feat(student-flow): readiness hardening, resume safety, and results UX polish

## What Changed
- Added systematic readiness checks before exam start (camera, mic, network, token/terms).
- Added dedicated resume gate for IN_PROGRESS attempts.
- Added reusable UI primitives for consistency: flash toast, anti-cheat warning, status banner.
- Added shared attempt status helper for consistent labels/badges.
- Improved results page with latest-attempt summary, quick-jump, filters, chips, URL sync, and reset.
- Added contextual diagnostics handoff (`reason=preflight|network`) across dashboard/results/exam prep/resume.
- Added persisted device readiness snapshot, stale detection (>24h), and dashboard visibility/reset controls.

## Why
- Reduce student friction before exam start.
- Increase continuity and safety for in-progress sessions.
- Make result review faster and shareable via URL-synced filters.
- Improve consistency and maintainability by reusing status/toast/warning patterns.

## Validation
- Lint: passes with 0 errors (warnings only, non-blocking).
- Build: passes when run from client working directory.

```powershell
Set-Location d:\Project\Examinator\client
npm run build.client
npm run lint
```

Note:
- In this environment, running build via `npm --prefix ...` can produce false Qwik generated-module ENOENT.

## Risk
- Main risk is UI regression across student pages due to broad UI touchpoints.
- Mitigation: run manual QA checklist for dashboard -> prep -> exam/resume -> results -> diagnostics.

## Ready To Merge Checklist
- [ ] Rebase with latest `development`
- [ ] Confirm no unresolved conflicts
- [ ] Attach validation output in PR comment
- [ ] Product review + QA signoff
