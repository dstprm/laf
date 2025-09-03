export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Replace this content with your product&apos;s Terms of Service.</p>
      <div className="space-y-3">
        <h2 className="text-lg font-medium">LLM Prompt (copy, replace placeholders, and paste)</h2>
        <pre className="rounded-md border p-4 text-xs whitespace-pre-wrap font-mono">
          {`Act as an experienced SaaS counsel. Draft clear, fair Terms of Service.

Product: {PRODUCT_NAME}
Company: {COMPANY_NAME} ({COMPANY_LEGAL_ENTITY})
Jurisdiction (governing law): {JURISDICTION}
Website/App: {BASE_URL}
Contact Email: {CONTACT_EMAIL}

Scope & acceptance; eligibility; account registration; permitted use & restrictions; pricing & billing; trials; renewals; cancellation; refunds; taxes; fair use; service availability; SLAs (if any); third‑party services; IP ownership; feedback license; confidentiality; data protection references (link to Privacy Policy at {BASE_URL}/privacy); compliance; export controls; beta features; disclaimers; limitation of liability; indemnity; termination; suspension; changes to service & terms; notices; dispute resolution; governing law & venue; severability; assignment; entire agreement; contact.

Instructions:
- Use readable language with clear section headings.
- Include an “Effective date” and “Last updated”.
- Add consumer‑law friendly phrasing (e.g., refunds policy) as applicable.
- Keep liability/disclaimer balanced but protective.
`}
        </pre>
        <p className="text-xs text-muted-foreground">
          Placeholders to replace:{' '}
          {`{PRODUCT_NAME} {COMPANY_NAME} {COMPANY_LEGAL_ENTITY} {JURISDICTION} {BASE_URL} {CONTACT_EMAIL}`}
        </p>
      </div>
    </div>
  );
}
