# Testing Strategy & Verification Guide

JobPilot uses `pytest` and `pytest-asyncio` for full-stack backend verification.

---

## 1. Running Backend Tests

```bash
# Run the complete test suite
apps/api/.venv/Scripts/python.exe -m pytest apps/api/tests/ -v

# Run the 7-stage closed-loop E2E test
apps/api/.venv/Scripts/python.exe -m pytest apps/api/tests/test_career_operating_loop.py -v

# Run code style & lint checks
apps/api/.venv/Scripts/python.exe -m ruff check apps/api/
```

---

## 2. Test Architecture

- **`test_career_operating_loop.py`**: End-to-end multi-stage lifecycle integration test validating:
  `User → Career Goal → Job → Match → Gap → Learning Plan → Assessment → Skill Update → Match Recalculation → Application → Outcome → New Gap`.
- **`test_engines.py`**: Unit tests for all canonical business logic engines (`SkillScoringEngine`, `MatchEngine`, `GapAnalysisEngine`, `NextActionEngine`, `LearningPlanEngine`, `AssessmentEngine`, `OutcomeAnalysisEngine`).
- **`test_error_handling.py`**: Validates security, unauthorized access, and 404 resource handling.
- **`test_domains.py`**: Validates individual CRUD and domain operations.
