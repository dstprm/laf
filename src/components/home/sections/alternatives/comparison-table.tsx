import { Section } from './section';
import { CheckCircle2, XCircle, Minus } from 'lucide-react';

type Row = { feature: string; yours: 'yes' | 'partial' | 'no'; generic: 'yes' | 'partial' | 'no'; note?: string };

export function ComparisonTable() {
  const rows: Row[] = [
    {
      feature: 'Global payments, tax & invoicing (Paddle)',
      yours: 'yes',
      generic: 'no',
      note: 'Tax/VAT/GST, invoicing, receipts, compliance',
    },
    { feature: 'AI‑ready docs & context', yours: 'yes', generic: 'no' },
    { feature: 'Webhook management patterns', yours: 'yes', generic: 'partial' },
    { feature: 'Transactional emails (Resend)', yours: 'yes', generic: 'partial' },
    { feature: 'Dashboard + themes + typed utils', yours: 'yes', generic: 'partial' },
    { feature: 'Authentication (Clerk)', yours: 'yes', generic: 'partial' },
    { feature: 'ORM (Prisma', yours: 'yes', generic: 'partial' },
    { feature: 'Admin panel', yours: 'yes', generic: 'partial' },
    { feature: 'Tiered features by subscription', yours: 'yes', generic: 'partial' },
    { feature: 'Basic security (rate limiting, roles)', yours: 'yes', generic: 'partial' },
    { feature: 'Headaches', yours: 'no', generic: 'yes' },
  ];

  const Badge = ({ value }: { value: Row['yours'] }) => {
    if (value === 'yes')
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-500">
          <CheckCircle2 className="h-3.5 w-3.5" /> Yes
        </span>
      );
    if (value === 'partial')
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-500">
          <Minus className="h-3.5 w-3.5" /> Partial
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-rose-500">
        <XCircle className="h-3.5 w-3.5" /> No
      </span>
    );
  };

  return (
    <Section>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">How this compares</h2>
        <p className="mt-4 text-muted-foreground">The essentials you need—and the differentiators others miss.</p>
      </div>
      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-background/60 backdrop-blur">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Feature</th>
              <th className="px-4 py-3 text-left font-medium">This starter</th>
              <th className="px-4 py-3 text-left font-medium">Generic boilerplates</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.feature} className="border-t border-border/60">
                <td className="px-4 py-3 align-top">
                  <div className="font-medium">{r.feature}</div>
                  {r.note && <div className="text-[11px] text-muted-foreground">{r.note}</div>}
                </td>
                <td className="px-4 py-3 align-top">
                  <Badge value={r.yours} />
                </td>
                <td className="px-4 py-3 align-top">
                  <Badge value={r.generic} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
