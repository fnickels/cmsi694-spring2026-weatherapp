# Research: Initial Location from Geolocation

**Branch**: `003-initial-geolocation-source` | **Date**: 2026-03-24
**Purpose**: Resolve planning unknowns and document implementation-ready decisions for first-load location source changes.

## 1. Geolocation Timeout and Fallback Policy

Decision: Use a fixed 5-second geolocation timeout on first load, then transition to manual-search fallback state.

Rationale: The spec clarification explicitly sets 5 seconds. A fixed timeout bounds first-load uncertainty and prevents indefinite blocking while preserving quick recovery to manual flow.

Alternatives considered:
- 8-second timeout: better for slower devices but conflicts with clarified requirement.
- No timeout: risks stalled UI and violates recoverable fallback expectations.

## 2. Late Geolocation Result Race Handling

Decision: If geolocation result arrives after fallback is shown, auto-apply it only when no manual location was selected in the same page visit.

Rationale: This balances automatic convenience with user control. It preserves continuity if the user is waiting, while preventing unexpected overrides once manual intent is established.

Alternatives considered:
- Always ignore late results: simpler but misses valid automatic recovery.
- Always apply late results: violates user-control requirement after manual selection.

## 3. Permission Prompt Timing

Decision: Request geolocation immediately on first page load.

Rationale: This is explicitly clarified in spec and aligns with feature purpose of auto-populated initial weather.

Alternatives considered:
- Delay until first interaction: may improve trust for some users but delays first value and conflicts with clarification.
- Pre-prompt explainer gate: adds UI friction and an extra decision step not required by scope.

## 4. Post-Denial Retry Semantics

Decision: Each user click on Use My Location after denial triggers a new geolocation attempt.

Rationale: Supports user agency when permission decisions change and keeps behavior predictable.

Alternatives considered:
- Block retries for session: simpler state logic but poor UX.
- Direct only to browser settings: useful messaging, but too restrictive as sole path.

## 5. Failure Source and Substitute Location Policy

Decision: Do not auto-load browser-locale or fixed default location when geolocation fails; keep manual-search-only fallback.

Rationale: Preserves data-source integrity for this feature and avoids presenting potentially inaccurate inferred weather as automatic truth.

Alternatives considered:
- Browser locale fallback: convenient but contradicts clarified behavior.
- Fixed default city fallback: deterministic but low relevance for most users.

## 6. Integration and Testing Pattern

Decision: Implement behavior in existing orchestration hooks and validate with layered tests: unit for state transitions, integration for UI behavior/races, and e2e for permission/fallback paths.

Rationale: Existing project already uses Vitest + Playwright and has geolocation-focused tests; extending this pattern minimizes risk and keeps constitutional testing requirements satisfied.

Alternatives considered:
- E2E-only validation: misses deterministic state-machine edge coverage.
- Unit-only validation: cannot sufficiently cover browser permission and full user flow behavior.
