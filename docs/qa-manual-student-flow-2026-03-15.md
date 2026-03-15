# Manual QA Checklist: Student Flow

## Scope
- Dashboard
- Exam Prep
- Resume Gate
- Active Exam
- Results
- Test Device / Diagnostics

## Preconditions
- Student account exists and can login.
- At least one exam in each relevant state when possible:
  - NOT_STARTED
  - IN_PROGRESS
  - SUBMITTED / TIMED_OUT / FORCE_SUBMITTED
- Browser has camera/microphone permissions available for testing.

## A. Dashboard
1. Open student dashboard.
2. Verify status board appears and CTA changes by attempt state.
3. Verify readiness summary card appears if snapshot exists.
4. Verify stale warning appears when snapshot age > 24h.
5. Verify header readiness badge appears and tooltip has score/progress/update time.
6. Click Reset Status and confirm readiness summary clears.

Expected:
- CTA routing and labels are correct.
- Readiness state reflects snapshot condition.

## B. Exam Prep
1. Open exam prep page for NOT_STARTED exam.
2. Verify checklist blocks start when requirements are incomplete.
3. Verify diagnostics CTA text is contextual:
  - Jalankan Diagnostik Perangkat (no snapshot)
  - Perbarui Diagnostik Perangkat (stale)
  - Buka Diagnostik Perangkat (fresh)
4. Verify remediation tips and action buttons work.

Expected:
- Start button enabled only when all precheck items pass.

## C. Resume Gate
1. Open resume URL for exam with IN_PROGRESS attempt.
2. Verify gate page appears with active attempt info.
3. Verify readiness snapshot context and diagnostics CTA appear.
4. Verify continue returns to active exam interface.

Expected:
- No resume page for exams without IN_PROGRESS attempt.

## D. Active Exam
1. Start or continue active exam.
2. Answer multiple questions.
3. Use navigation controls for unanswered/doubtful items.
4. Trigger one anti-cheat event (tab switch/fullscreen exit) in safe test.

Expected:
- Progress, timer, and anti-cheat warning update correctly.

## E. Results
1. Open results page.
2. Verify latest-attempt summary appears and quick-jump works.
3. Use status and period filters (select + chips).
4. Refresh page and verify URL-synced filters persist.
5. Click reset filter and verify query is cleaned.
6. Use diagnostics CTA from latest attempt.

Expected:
- Filtered timeline reflects selected status/period.
- URL query mirrors filter state.

## F. Test Device / Diagnostics
1. Open diagnostics with `reason=preflight`.
2. Open diagnostics with `reason=network`.
3. Verify contextual banner changes by reason.
4. Run one-click diagnostics and verify logs/checklist updates.
5. Verify quick-fix actions for failed checks work.
6. Confirm readiness snapshot is persisted and reflected back in dashboard/prep/resume.

Expected:
- Diagnostics flow is actionable and consistent across entry points.

## Exit Criteria
- No functional regressions found in A-F.
- No blocker severity issues.
- All routing and readiness transitions behave as expected.
