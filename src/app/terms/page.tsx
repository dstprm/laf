import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos del Servicio | LAF',
  description:
    'Condiciones de uso de LAF: cuentas, uso permitido, planes, pagos, cancelación, propiedad intelectual, garantías, limitación de responsabilidad y contacto.',
};

export default function TermsPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const contactEmail = process.env.EMAIL_REPLY_TO || 'support@yourdomain.com';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Términos del Servicio</h1>
        <p className="text-sm text-muted-foreground">Última actualización: 6 de octubre de 2025</p>
      </header>

      <section className="space-y-3">
        <p>
          Estos Términos del Servicio (los “Términos”) rigen el uso de <strong>LAF</strong> y del sitio disponible en{' '}
          <a href={appUrl} className="underline" target="_blank" rel="noreferrer">
            {appUrl}
          </a>
          . Al utilizar el Servicio aceptas estos Términos. Si no estás de acuerdo, no uses el Servicio.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Elegibilidad y cuentas</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Debes tener capacidad legal para contratar y cumplir la ley aplicable.</li>
          <li>Eres responsable de la exactitud de tus datos y de mantener seguras tus credenciales.</li>
          <li>Podemos suspender o cerrar cuentas por incumplimiento o riesgos de seguridad/fraude.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Uso permitido</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>No debes vulnerar la ley, los derechos de terceros o la seguridad del Servicio.</li>
          <li>Está prohibido el acceso no autorizado, scraping no permitido, ingeniería inversa o abuso.</li>
          <li>Podemos aplicar límites razonables de uso para proteger la estabilidad del Servicio.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Planes, pagos y cancelación</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Los precios, ciclos y características se muestran en el Servicio y pueden cambiar.</li>
          <li>Los pagos y suscripciones se gestionan a través de proveedores como Paddle.</li>
          <li>Puedes cancelar en cualquier momento; el acceso continúa hasta el final del período pagado.</li>
          <li>Los impuestos aplicables pueden añadirse según la jurisdicción.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Servicios de terceros</h2>
        <p>
          El Servicio puede integrar o depender de servicios de terceros (p. ej., autenticación, pagos, correo
          electrónico, analítica). No somos responsables de sus términos o prácticas.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Propiedad intelectual</h2>
        <p>
          LAF y sus componentes están protegidos por derechos de propiedad intelectual. Conservamos todos los derechos
          no otorgados expresamente. Puedes enviarnos comentarios; nos concedes una licencia para usarlos a fin de
          mejorar el Servicio.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Confidencialidad y datos</h2>
        <p>
          Trataremos la información confidencial de manera adecuada. El tratamiento de datos personales se rige por
          nuestra{' '}
          <a href={`${appUrl}/privacy`} className="underline">
            Política de Privacidad
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Garantías y descargos</h2>
        <p>
          El Servicio se proporciona “tal cual” y “según disponibilidad”. En la medida permitida por la ley, rechazamos
          garantías implícitas de comerciabilidad, idoneidad para un fin particular y no‑infracción.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Limitación de responsabilidad</h2>
        <p>
          En la medida permitida por la ley, nuestra responsabilidad total por reclamaciones derivadas de o relacionadas
          con el Servicio se limita al importe pagado por ti en los 12 meses anteriores al evento que dio lugar a la
          responsabilidad, o 100 USD si no hubiera pagos. No seremos responsables de daños indirectos, incidentales,
          especiales, ejemplares o consecuentes.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Suspensión y terminación</h2>
        <p>
          Podemos suspender o dar por terminado el acceso si incumples estos Términos, por riesgos de seguridad/fraude,
          o cuando lo exija la ley. Puedes dejar de usar el Servicio en cualquier momento.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Cambios en el Servicio y en los Términos</h2>
        <p>
          Podemos modificar el Servicio y actualizar estos Términos. Publicaremos la versión revisada con la fecha de
          actualización. El uso continuado constituye aceptación de los Términos vigentes.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Ley aplicable y jurisdicción</h2>
        <p>
          Salvo que la ley local de consumidor disponga otra cosa, estos Términos se rigen por la ley de tu jurisdicción
          principal de operación del Servicio. Cualquier disputa se someterá a los tribunales competentes de dicha
          jurisdicción.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Cesión y divisibilidad</h2>
        <p>
          Puedes ceder estos Términos sólo con nuestro consentimiento previo por escrito. Si alguna disposición es
          inválida, el resto permanecerá en vigor.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Contacto</h2>
        <p>
          Para consultas sobre estos Términos, escríbenos a{' '}
          <a href={`mailto:${contactEmail}`} className="underline">
            {contactEmail}
          </a>
          .
        </p>
      </section>

      <footer className="pt-2 text-sm text-muted-foreground">
        Consulta también nuestra{' '}
        <a href={`${appUrl}/privacy`} className="underline">
          Política de Privacidad
        </a>
        .
      </footer>
    </div>
  );
}
