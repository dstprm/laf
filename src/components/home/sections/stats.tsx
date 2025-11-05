import { Section } from './section';
export function Stats() {
  const stats = [
    { value: '5 min', label: 'hasta tu primera valorización' },
    { value: '3+', label: 'métodos de valorización' },
    { value: '100%', label: 'gratis ahora' },
    { value: '1', label: 'informe listo para compartir' },
  ];

  return (
    <Section muted>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 rounded-lg border border-border bg-background/50 p-6 sm:p-8 text-center md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="">
            <div className="text-2xl sm:text-3xl font-semibold md:text-4xl">{s.value}</div>
            <div className="mt-1 text-[11px] sm:text-xs tracking-wide text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
