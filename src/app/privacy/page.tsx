import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad | ValuPro',
  description:
    'Cómo ValuPro trata tus datos personales: qué recopilamos, con qué fines, bases legales, conservación, derechos y contactos.',
};

export default function PrivacyPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const contactEmail = process.env.EMAIL_REPLY_TO || 'support@yourdomain.com';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Política de Privacidad</h1>
        <p className="text-sm text-muted-foreground">Última actualización: 6 de octubre de 2025</p>
      </header>

      <section className="space-y-3">
        <p>
          Esta Política de Privacidad explica cómo <strong>ValuPro</strong> (el “Servicio”) recopila y trata tus datos
          personales cuando utilizas nuestro sitio y producto disponible en{' '}
          <a href={appUrl} className="underline" target="_blank" rel="noreferrer">
            {appUrl}
          </a>
          . Si no estás de acuerdo con esta política, por favor no utilices el Servicio.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Datos que recopilamos</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Cuenta</strong>: nombre, apellidos, correo electrónico y datos de perfil básicos que nos proporciona
            para registrarse e iniciar sesión.
          </li>
          <li>
            <strong>Facturación</strong>: identificadores de cliente y datos de suscripción y pago procesados a través
            de proveedores como Paddle (no almacenamos números de tarjeta).
          </li>
          <li>
            <strong>Uso y soporte</strong>: métricas de uso, registros técnicos, información de dispositivo y
            comunicaciones de soporte.
          </li>
          <li>
            <strong>Cookies y tecnologías similares</strong>: cookies esenciales para el funcionamiento y cookies de
            analítica (p. ej., Google Analytics si está habilitado) para mejorar el servicio.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Fuentes de los datos</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Datos que nos proporcionas directamente cuando creas una cuenta o te comunicas con nosotros.</li>
          <li>Datos que se generan automáticamente cuando navegas o utilizas el Servicio.</li>
          <li>
            Datos de terceros cuando corresponda, por ejemplo, autenticación (Clerk), pagos (Paddle), correo electrónico
            transaccional (Resend) y analítica.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Finalidades del tratamiento</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Prestar, mantener y mejorar el Servicio.</li>
          <li>Gestionar cuentas, suscripciones, facturación y cobros.</li>
          <li>Atender solicitudes de soporte y comunicaciones operativas.</li>
          <li>Seguridad, prevención de fraude y cumplimiento de obligaciones legales.</li>
          <li>Analítica para comprender el uso y mejorar la experiencia.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Bases legales (EEA/UK)</h2>
        <p>
          Cuando aplica el GDPR/UK GDPR, tratamos los datos sobre la base de: (i) ejecución de contrato para prestar el
          Servicio; (ii) interés legítimo para seguridad, mejora y analítica; (iii) cumplimiento de obligaciones
          legales; y (iv) consentimiento cuando lo exija la ley (p. ej., cookies no esenciales).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Conservación</h2>
        <p>
          Conservamos los datos personales mientras mantengas una cuenta o según sea necesario para los fines descritos.
          Cuando ya no se necesiten, los eliminaremos o anonimizaremos de forma segura, salvo que la ley exija
          conservarlos por más tiempo.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Compartición y encargados</h2>
        <p>
          Podemos compartir datos con proveedores que actúan como encargados del tratamiento para prestar funciones en
          nuestro nombre, incluidos autenticación (Clerk), pagos (Paddle), correo electrónico (Resend), hosting y
          analítica. Estos proveedores sólo tratan los datos según nuestras instrucciones y con garantías adecuadas.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Transferencias internacionales</h2>
        <p>
          Si transferimos datos fuera de tu jurisdicción, aplicamos salvaguardas adecuadas, como las Cláusulas
          Contractuales Tipo (SCCs) cuando correspondan, y evaluaciones de transferencia.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Cookies</h2>
        <p>
          Utilizamos cookies esenciales para el funcionamiento del sitio. Con tu consentimiento, podemos utilizar
          cookies de analítica para medir el uso y mejorar el Servicio. Puedes gestionar las preferencias desde tu
          navegador o mediante controles que ofrezcamos.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Tus derechos</h2>
        <p>
          Dependiendo de tu jurisdicción, puedes tener derechos de acceso, rectificación, eliminación, portabilidad,
          limitación u oposición, así como a retirar el consentimiento. También puedes presentar una reclamación ante
          una autoridad de control.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Cómo ejercerlos</h2>
        <p>
          Para ejercer tus derechos o realizar consultas de privacidad, contáctanos en{' '}
          <a href={`mailto:${contactEmail}`} className="underline">
            {contactEmail}
          </a>
          . Responderemos conforme a la ley aplicable.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Menores</h2>
        <p>
          El Servicio no está dirigido a menores cuando la ley aplicable requiera el consentimiento parental. No
          recopilamos conscientemente datos de menores sin dicho consentimiento.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Seguridad</h2>
        <p>
          Implementamos medidas técnicas y organizativas razonables para proteger los datos personales. Ningún sistema
          es 100% seguro, pero trabajamos para prevenir accesos no autorizados y pérdidas.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Cambios a esta Política</h2>
        <p>
          Podemos actualizar esta Política para reflejar cambios en el Servicio o en la legislación. Te notificaremos
          los cambios significativos y actualizaremos la fecha indicada arriba. Si sigues usando el Servicio tras la
          actualización, se entenderá que aceptas la versión vigente.
        </p>
      </section>

      <footer className="pt-2 text-sm text-muted-foreground">
        También puedes revisar nuestros{' '}
        <a href={`${appUrl}/terms`} className="underline">
          Términos del Servicio
        </a>
        .
      </footer>
    </div>
  );
}
