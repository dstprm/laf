export function HeroStats() {
  const stats = [
    {
      title: 'Valuación en Minutos',
      description: 'Obtén un rango de valoración profesional en menos de 5 minutos con nuestra herramienta DCF',
    },
    {
      title: 'Múltiples Metodologías',
      description: 'DCF, múltiplos de industria y comparables para mayor precisión en cada valuación',
    },
    {
      title: 'Informes Profesionales',
      description: 'Documentos exportables listos para presentar a inversionistas y potenciales compradores',
    },
    {
      title: 'Comenzar Gratis',
      description: 'Sin costo inicial - prueba nuestra valuación gratuita antes de solicitar análisis detallado',
    },
  ];

  return (
    <div className="relative z-10 mt-8 md:-mt-20 lg:-mt-24 px-4 sm:px-6 md:px-8 pb-8 md:pb-0">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-px bg-border/50 sm:grid-cols-2 lg:grid-cols-4 rounded-lg overflow-hidden border border-border/50 backdrop-blur-sm shadow-xl">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-background/95 backdrop-blur-md px-5 py-6 md:px-6 md:py-8 hover:bg-background transition-colors"
            >
              <h3 className="text-base md:text-lg font-semibold tracking-tight mb-2">{stat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
