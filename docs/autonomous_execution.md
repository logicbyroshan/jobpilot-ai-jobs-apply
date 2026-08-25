# JobPilot — Autonomous Execution Policy & Safety Guardrails

## 1. Operating Philosophy

Automating job applications presents distinct safety, reputation, and ethical risks. JobPilot solves this through **Strict Policy-Governed Autonomous Execution**, allowing candidates to set fine-grained boundaries on when and how applications are prepared, tailored, and submitted.

---

## 2. Policy Execution Modes

| Mode | Automation Level | Behavior & Guardrails |
| :--- | :--- | :--- |
| **`MANUAL`** | 0% Autonomous | System generates tailored resumes, cover letters, and match scores upon explicit user request. Submissions must be performed manually by the candidate. |
| **`ASSISTED`** *(Default)* | 60% Autonomous | System continuously monitors new matching jobs ($\ge \text{min\_match\_score}$), drafts tailored application artifacts in background, and notifies candidate for 1-click review and submission approval. |
| **`AUTONOMOUS`** | 100% Autonomous | System automatically screens opportunities, generates tailored artifacts, validates policy limits, and submits applications within scheduled daily windows. |

---

## 3. Governance Guardrails & Safeguards

### A. Rate Limiting & Daily Caps
- `daily_application_limit`: Hard ceiling on automated submissions (default: 5/day, maximum: 25/day).
- Enforced at the domain layer in `ApplicationService.create_application()` before any outbound network request or DB record creation.

### B. Match Quality Thresholds
- `min_match_score`: Minimum AI match fit required to qualify for automated drafting (default: 80.0%).
- Submissions below the threshold are blocked from automated execution and surfaced as "Low Match Review" items.

### C. Provenance & Hallucination Prevention
- Every AI-generated tailored resume bullet and cover letter line must cite at least one verified `EvidenceItem` (e.g. GitHub repo link, passing assessment ID, or verified employment tenure).
- Artifacts failing provenance verification are flagged with `PROVENANCE_WARNING` and require explicit candidate confirmation.

### D. Company & Industry Blacklists
- Candidates can configure restricted company domains or industries (e.g. current employer, stealth competitors) to prevent inadvertent applications.

---

## 4. Policy Configuration Schema

```json
{
  "user_id": "00000000-0000-0000-0000-000000000001",
  "mode": "ASSISTED",
  "is_auto_apply_enabled": true,
  "min_match_score": 85.0,
  "daily_application_limit": 5,
  "requires_user_approval": true,
  "blacklisted_companies": ["CurrentCompany Inc", "Stealth Corp"],
  "preferred_locations": ["San Francisco, CA", "Remote"],
  "minimum_salary_expectation": 180000
}
```
