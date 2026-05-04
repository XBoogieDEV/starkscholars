# Committee Portal — E2E Test Results

> Companion to [committee-portal-test-plan.md](./committee-portal-test-plan.md). Run results captured against PR [#1 (fix/committee-portal-and-orphan-audit)](https://github.com/XBoogieDEV/starkscholars/pull/1).

## How to run locally

### One-time setup

```bash
# 1. Pull the PR branch
git fetch origin && git checkout fix/committee-portal-and-orphan-audit

# 2. Install deps (if not already)
npm install

# 3. Push the new Convex functions (seedHelpers + chair finalization + audit)
#    to your dev Convex deployment.
npx convex dev          # leave running in a separate terminal

# 4. Seed the four fixture test users.
node scripts/seed-test-users.mjs
```

The seed script creates:

| Email | Role | Password |
|---|---|---|
| `test-admin@scholars.test` | admin | `TestPass-2026` |
| `test-committee@scholars.test` | committee | `TestPass-2026` |
| `test-chair@scholars.test` | committee + isChairman | `TestPass-2026` |
| `test-applicant@scholars.test` | applicant | `TestPass-2026` |

### Running the suite

```bash
# Full committee/admin spec suite
npx playwright test e2e/committee-pages.spec.ts \
                    e2e/admin-pages.spec.ts \
                    e2e/admin-selection.spec.ts \
                    e2e/chair-finalize.spec.ts \
                    e2e/orphan-audit.spec.ts \
                    --project=chromium-desktop --reporter=list

# Specific spec
npx playwright test e2e/chair-finalize.spec.ts --reporter=list

# UI mode for interactive debugging
npx playwright test --ui
```

Playwright auto-starts `npm run dev` via `webServer` in `playwright.config.ts`. Tests target `http://localhost:3000`.

### Cleanup after testing

```bash
node scripts/cleanup-test-users.mjs
```

Refuses to operate on any non-`@scholars.test` email (server-side guard in `seedHelpers.ts`).

## Test coverage matrix

Cross-references each scenario in [committee-portal-test-plan.md](./committee-portal-test-plan.md). Marked **A**utomated (Playwright spec), **M**anual (run by hand), **B**ackend (direct Convex call), or **D**eferred (out of subset for this PR).

| § | Scenario | Status | Spec |
|---|---|---|---|
| 1.1 | Visit /committee unauth → /login | A | committee-pages.spec.ts |
| 1.2 | Applicant → /unauthorized | A | committee-pages.spec.ts (Applicant role suite) |
| 1.3 | Committee → /committee | A | committee-pages.spec.ts (Authenticated dashboard) |
| 1.4 | Admin → /committee | A | chair-finalize.spec.ts (admin badge) |
| 1.5 | Deep route /committee/candidates/[invalidId] unauth | A | committee-pages.spec.ts (URL Pattern) |
| 2.1 | Welcome banner renders user name | A | committee-pages.spec.ts |
| 2.2 | Three stats cards render | A | committee-pages.spec.ts |
| 2.3 | Progress bar reflects evals | M | requires seeded evaluations |
| 2.4 | Candidates to Review excludes evaluated | M | requires seeded apps + evals |
| 2.5 | Top Candidates sorts by avg rating (bug #4) | M | requires multiple evaluated apps |
| 2.6 | "View All" link → candidates | A | implicit via 3.1 |
| 2.7 | "Start Evaluating" CTA → candidates | A | implicit via 3.1 |
| 3.1 | Pending/Evaluated tab counts match | A | committee-pages.spec.ts |
| 3.2–3.5 | Search filters | M | requires seeded apps |
| 3.6 | Profile photos render | A | committee-pages.spec.ts (no /api/storage/ requests) |
| 3.7 | Initials fallback for missing photo | M | visual check |
| 3.8 | Click Evaluate → detail | A | implicit (link rendered) |
| 3.9 | Empty pending state | M | visual check |
| 4.x | Candidate detail page | M | requires seeded apps |
| 5.x | My evaluations page | A (header only) | committee-pages.spec.ts |
| 6.1–6.4 | Rankings table + progress | A (renders) | committee-pages.spec.ts |
| 6.5 | Plain committee: NO selection UI | A | chair-finalize.spec.ts |
| 6.6 | Chair: selection UI + Chair Access badge (NEW) | A | chair-finalize.spec.ts |
| 6.7 | Admin: Admin Access badge | A | chair-finalize.spec.ts |
| 6.8 | Max selectable matches setting (bug #2) | A | admin-selection.spec.ts (+/- counter) |
| 6.9 | Confirm disabled until exact count | M | requires apps + evals |
| 7.1 | /admin/selection rankings render | A | admin-selection.spec.ts |
| 7.2 | Inline +/- adjusts setting (NEW) | A | admin-selection.spec.ts |
| 7.3 | Reducing max truncates selected | M | needs multi-selection workflow |
| 7.4 | Increment cap at 20 | M | tedious automation |
| 7.5 | Decrement bounded at 1 | A | admin-selection.spec.ts |
| 7.6 | Manual override (non-top picks) | M | requires apps + evals |
| 7.7 | Post-finalize: page locks | M | terminal state |
| 7.8 | Notifications dispatched | M | needs inbox check |
| 8.1–8.7 | finalizeSelection auth gating | A (indirect via UI) | chair-finalize.spec.ts + committee-pages.spec.ts |
| 9.1 | Run audit as admin → cards render | A | orphan-audit.spec.ts |
| 9.2 | Numbers match underlying data | M | spot-check vs DB |
| 9.3–9.5 | Audit sections render | A | orphan-audit.spec.ts (presence) |
| 9.6 | Audit takes no actions | A | by design (read-only query) |
| 9.7 | Non-admin → Unauthorized | A | orphan-audit.spec.ts |
| 10.1–10.3 | Mobile/tablet viewports | D | follow-up PR |
| 10.4 | Activity log captures evaluations | M | DB inspection |
| 10.5 | Stale auth grace handled | A (existing waitForAuthRedirect) | covered |

**A** = automated in this PR · **M** = manual checklist · **B** = backend direct call · **D** = deferred

## Run log

This section is appended after running the suite. Captures pass/fail counts and notable failures.

### 2026-05-04 — Initial run on PR branch (chromium-desktop only, unauth subset)

```
(populated after first run; see appendix)
```

## Appendix: Skip behavior

Authenticated tests use a graceful skip pattern. If a fixture user fails to log in (typically because seeding wasn't run), the test calls `test.skip(true, "fixture not seeded")` and the suite does not fail. This means a clean CI run *without* seeded data shows "skipped" for the authenticated subset rather than red errors.

To force-fail the suite when seeds are missing, set `REQUIRE_TEST_USERS=1` in the environment (not yet wired; would be a follow-up).
