export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Replace this content with your product&apos;s Privacy Policy.</p>
      <div className="space-y-3">
        <h2 className="text-lg font-medium">LLM Prompt (copy, replace placeholders, and paste)</h2>
        <pre className="rounded-md border p-4 text-xs whitespace-pre-wrap font-mono">
          {`Act as an experienced privacy lawyer. Draft a GDPR- and CCPA-compliant Privacy Policy for a SaaS.

Product: {PRODUCT_NAME}
Company: {COMPANY_NAME} ({COMPANY_LEGAL_ENTITY})
Jurisdiction (governing law / HQ): {JURISDICTION}
Website/App: {BASE_URL}
Contact Email: {CONTACT_EMAIL}

Data we collect: {DATA_CATEGORIES} (e.g., account info, billing, usage analytics, device info, logs)
Purposes of processing: {PURPOSES}
Legal bases (GDPR): {LEGAL_BASES} (e.g., contract, legitimate interests, consent, legal obligation)
Processors / sub-processors: {DATA_PROCESSORS} (e.g., hosting, email, analytics, payments)
Retention periods: {RETENTION}
International transfers & safeguards: {TRANSFERS} (e.g., SCCs)
Cookies & tracking: {COOKIES} (e.g., analytics, essential, marketing)
User rights: access, rectification, erasure, portability, restriction, objection, withdraw consent
Children’s data: {CHILDREN_POLICY}
Security measures: {SECURITY_MEASURES}
DPO or contact for privacy requests: {PRIVACY_CONTACT}

Instructions:
- Use clear, plain language with helpful headings and a table of contents.
- Include an “Effective date” and “Last updated”.
- Reference California, EU/EEA, UK specifics where relevant.
- Add a section on how users can exercise rights and how to contact us.
- Link to Terms of Service at {BASE_URL}/terms.
`}
        </pre>
        <p className="text-xs text-muted-foreground">
          Placeholders to replace:{' '}
          {`{PRODUCT_NAME} {COMPANY_NAME} {COMPANY_LEGAL_ENTITY} {JURISDICTION} {BASE_URL} {CONTACT_EMAIL} {DATA_CATEGORIES} {PURPOSES} {LEGAL_BASES} {DATA_PROCESSORS} {RETENTION} {TRANSFERS} {COOKIES} {CHILDREN_POLICY} {SECURITY_MEASURES} {PRIVACY_CONTACT}`}
        </p>
      </div>
    </div>
  );
}
