# Committee Portal — End-to-End Test Plan

Coverage for `/committee/*` workflows and selection finalization. Designed to be runnable manually first, then automated with Playwright once a stable test committee account exists.

## Prerequisites

1. **Test admin account** — already exists.
2. **Test committee account** — created via `/admin/committee` → "Invite Member". Save credentials in `.env.local` as `TEST_COMMITTEE_EMAIL` / `TEST_COMMITTEE_PASSWORD`.
3. **Test chair account** — committee member with `isChairman: true`. Save as `TEST_CHAIR_EMAIL` / `TEST_CHAIR_PASSWORD`.
4. **Sample applications** — at least 3 in `submitted` status with mixed evaluation states (some unevaluated, some partially evaluated, some fully evaluated).

## 1. Authentication & Access

| # | Scenario | Expected |
|---|----------|----------|
| 1.1 | Visit `/committee` unauthenticated | Redirect to `/login?redirect=/committee` |
| 1.2 | Sign in as applicant role, navigate to `/committee` | Redirect to `/unauthorized` |
| 1.3 | Sign in as committee role | Lands on `/committee` dashboard |
| 1.4 | Sign in as admin role, navigate to `/committee` | Allowed (admin has full access) |
| 1.5 | Direct-access deep route `/committee/candidates/[invalidId]` unauthenticated | Redirect to `/login` |

## 2. Dashboard (`/committee`)

| # | Scenario | Expected |
|---|----------|----------|
| 2.1 | Welcome banner shows user's name | Greeting includes user's first name |
| 2.2 | Three stats cards render | Total Applications / My Evaluations / Remaining to Evaluate populate correctly |
| 2.3 | Progress bar reflects evaluations completed | Percentage matches `myEvaluationsCompleted / totalApplications` |
| 2.4 | "Candidates to Review" shows up to 4 unevaluated | Excludes any candidate where `myEvaluation` exists |
| 2.5 | "Top Candidates" sorts by **average rating** (not count) | Highest avg rating first; recently fixed bug #4 |
| 2.6 | "View All" link → `/committee/candidates` | Navigates correctly |
| 2.7 | "Start Evaluating" CTA → `/committee/candidates` | Navigates correctly |

## 3. Candidate List (`/committee/candidates`)

| # | Scenario | Expected |
|---|----------|----------|
| 3.1 | Pending and Evaluated tab counts match | Sum equals total candidates |
| 3.2 | Search by first name | List filters in real time |
| 3.3 | Search by city | Same |
| 3.4 | Search by college | Same |
| 3.5 | Search by major | Same |
| 3.6 | Profile photos render for applicants who uploaded one | Image visible (not the initials fallback). Recently fixed bug #1 |
| 3.7 | Initials fallback shows for applicants without a photo | First-letter avatar displays |
| 3.8 | Click "Evaluate" on a card | Navigate to `/committee/candidates/[id]` |
| 3.9 | Empty pending state ("All Caught Up") | Renders when `pendingCandidates.length === 0` |

## 4. Candidate Detail (`/committee/candidates/[id]`)

| # | Scenario | Expected |
|---|----------|----------|
| 4.1 | Profile photo loads if uploaded | Image renders, not 404 |
| 4.2 | Header shows name, city, college, GPA, recommendation count | All present |
| 4.3 | Tabs: Overview / Essay / Transcript / Recommendations | All render without crashing |
| 4.4 | AI Summary card shows when `aiSummary` is set | Card visible with summary + highlights |
| 4.5 | Essay tab shows text inline if `essayText`, file link if `essayFileId` | Correct branch displayed |
| 4.6 | Transcript tab "View Transcript" button | Opens transcript in new tab |
| 4.7 | Recommendations tab shows submitted letters | Each letter shows recommender + view-letter button |
| 4.8 | Evaluation form: rating + optional notes | Both inputs work |
| 4.9 | Submit evaluation as new evaluator | Returns to `/committee`, evaluation persists |
| 4.10 | Navigate back to same candidate | Rating + notes pre-fill from existing evaluation (bug #3 fix verified) |
| 4.11 | Update evaluation: change rating, submit | Single row updated, no duplicate |
| 4.12 | "Other Committee Ratings" panel hidden before submit | Not visible |
| 4.13 | "Other Committee Ratings" panel visible after submit | Shows other evaluators' ratings + abbreviated notes |
| 4.14 | Rate-limit submitting >threshold/sec | Returns rate-limit error from `evaluations.submit` |

## 5. My Evaluations (`/committee/my-evaluations`)

| # | Scenario | Expected |
|---|----------|----------|
| 5.1 | Lists all submitted evaluations | Count matches `myEvaluationsCompleted` |
| 5.2 | Sort: most recent first | `updatedAt` descending |
| 5.3 | Stats cards: Total / Strong Yes / Yes / Maybe-No | Counts match |
| 5.4 | "View / Update" link | Navigates back to candidate detail |

## 6. Results (`/committee/results`)

| # | Scenario | Expected |
|---|----------|----------|
| 6.1 | Rankings table shows all submitted applicants | One row per app |
| 6.2 | Sorted by average rating descending | Highest avg first |
| 6.3 | Per-evaluator emoji column shows each member's rating | Correct emoji or `—` |
| 6.4 | Progress bar reflects total evaluations / possible | `totalEvaluations / (totalApps × committeeMembers.length)` |
| 6.5 | **As regular committee member**: NO selection checkboxes | Read-only access |
| 6.6 | **As committee chair**: selection checkboxes visible | "Chair Access" badge in header (NEW) |
| 6.7 | **As admin**: selection checkboxes visible | "Admin Access" badge in header |
| 6.8 | Max selectable matches `max_scholarship_recipients` setting | Reads from setting, not hard-coded 2 (bug #2 fix verified) |
| 6.9 | Confirm Selection button disabled until exact count selected | Validation matches setting |

## 7. Admin Selection (`/admin/selection`)

| # | Scenario | Expected |
|---|----------|----------|
| 7.1 | Rankings render with all submitted apps | Same data as committee/results |
| 7.2 | Inline +/- buttons next to "Selected" stat | Increments/decrements `max_scholarship_recipients` setting (NEW) |
| 7.3 | Decreasing below current selection size truncates selected list | Excess deselected automatically |
| 7.4 | Increment past 20 disabled | Cap at 20 |
| 7.5 | Decrement below 1 disabled | Floor at 1 |
| 7.6 | Manual selection (override): pick non-top-ranked candidates | Allowed; finalize succeeds |
| 7.7 | After finalize: page locks, "Selection Finalized" card appears | Cannot re-finalize |
| 7.8 | Notification emails dispatched | Selected receive "Congratulations" email; others "Not selected" |

## 8. Selection Finalization (Convex `admin.finalizeSelection`)

| # | Scenario | Expected |
|---|----------|----------|
| 8.1 | Call as admin with exact count | Success: marks selected + not_selected |
| 8.2 | Call as admin with wrong count | `Must select exactly N recipients` error |
| 8.3 | Call as committee chair (`isChairman: true`) | Success — NEW |
| 8.4 | Call as committee non-chair | `Unauthorized` error |
| 8.5 | Call as applicant | `Unauthorized` error |
| 8.6 | Call unauthenticated | `Not authenticated` error |
| 8.7 | Activity log entries created for each transition | One per applicationId in `activityLog` |

## 9. Orphan Letter Audit (`/admin/settings` → "Recommendation Letter Audit")

| # | Scenario | Expected |
|---|----------|----------|
| 9.1 | Click "Run audit" as admin | Card expands, query runs, summary stats render |
| 9.2 | Summary numbers match underlying data | Manual spot-check against `recommendations` table |
| 9.3 | Orphaned uploads section shows rows where `letterFileId` set but `status != "submitted"` | Each row: applicant, recommender, status |
| 9.4 | Submitted-no-file section shows rows where status = "submitted" but no `letterFileId` | Each row: applicant, recommender, submitted timestamp |
| 9.5 | Stuck applications section shows pending_recommendations apps | Includes uploaded-not-submitted count per app |
| 9.6 | No mutations are called by opening the audit | Verified: query is read-only |
| 9.7 | Run audit as non-admin (committee role) | Throws "Unauthorized" |

## 10. Cross-cutting

| # | Scenario | Expected |
|---|----------|----------|
| 10.1 | All committee pages render on mobile (375×667) | No layout breakage |
| 10.2 | All committee pages render on tablet (1024×768) | No layout breakage |
| 10.3 | Tab/return navigation maintains state | URL preserved across browser back |
| 10.4 | Activity log captures evaluation submissions | Entry per submit/update |
| 10.5 | Stale Convex auth handled gracefully | Sync grace period (5s) before redirect |

## Suggested Playwright Implementation

For the authenticated flows (sections 2–9), build on the existing `e2e/utils.ts` helpers and add a `signInAs(role)` helper that uses better-auth credential login. Group tests by section. Run with `playwright.config.prod.ts` against the live site.

Sections 1, 3.1–3.8, 6 (read-only as committee), and 9.7 (negative auth) can be automated immediately.

Sections 8.1, 8.2, 8.7 should be tested directly via Convex dashboard or `npx convex run` since they exercise backend behavior independently of UI.
