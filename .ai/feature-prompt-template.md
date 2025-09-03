Feature Prompt Template

Goal

- Describe the feature in one sentence.

User story

- As a <role>, I want <capability> so that <benefit>.

Acceptance criteria

- List concrete behaviors, validations, and error states.

Data

- New/updated models (Prisma): fields, relations, indexes.

API surface

- Endpoint path(s) under `src/app/api/...`, HTTP methods, request/response shapes.

UI

- Pages/components to add under `src/app/(dashboard)/...` or `src/components/...`.

Emails/Notifications

- Triggers, templates in `src/components/emails/`, sender logic.

Notes

- Reuse helpers from `src/utils/paddle/**`, `src/utils/database/**`, `src/lib/**`.
