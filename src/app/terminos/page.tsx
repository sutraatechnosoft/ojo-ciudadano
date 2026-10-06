import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos de uso',
  description: 'Condiciones para enviar reportes de incidencias y usar el mapa.',
}

// BORRADOR para revisión legal. Reemplaza todo lo que esté entre [CORCHETES].
const RESPONSABLE = 'Ojo Ciudadano, un proyecto de Sutra Technosoft'
const SITIO = 'Ojo Ciudadano'
const CORREO = 'bashboxdev@gmail.com'
const FECHA = '05/10/2026'
const LEY = 'Republica Bolivariana de Venezuela'

export default function TerminosPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 text-base leading-relaxed text-slate-800">
      <h1 className="text-3xl font-semibold">Términos de uso</h1>
      <p className="text-slate-600">Última actualización: {FECHA}</p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Qué es este servicio</h2>
        <p>
          {SITIO} es un sitio web operado por {RESPONSABLE} que permite a cualquier persona reportar incidencias en un lugar mediante una foto y su
          ubicación. Tras una verificación, los reportes aprobados se muestran en un mapa público. Al usar el sitio o enviar un reporte, aceptas
          estos términos y la <Link href="/privacidad" className="underline">Política de privacidad</Link>. Si no estás de acuerdo, no uses el sitio.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. No es un servicio de emergencias ni oficial</h2>
        <p>
          Este sitio <strong>no es un servicio de emergencias</strong> y no está vinculado a ninguna autoridad ni institución pública, salvo que se indique
          expresamente. No lo uses para situaciones de peligro inmediato: contacta a los servicios de emergencia correspondientes. Un reporte
          enviado aquí no garantiza que alguien lo atienda ni que se tome acción.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Tus responsabilidades al enviar un reporte</h2>
        <p>Al enviar un reporte declaras y te comprometes a que:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>La información es veraz y la foto corresponde al lugar y momento reportados.</li>
          <li>La foto la tomaste tú o tienes derecho a usarla y compartirla.</li>
          <li>Tienes más de [EDAD] años.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. Qué está prohibido</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Reportes falsos, engañosos, de broma o enviados de forma masiva (spam).</li>
          <li>Fotos que muestren a personas identificables, especialmente <strong>menores de edad</strong>.</li>
          <li>Fotos del interior de viviendas o de lugares privados sin autorización.</li>
          <li>Matrículas de vehículos legibles u otros datos personales visibles.</li>
          <li>Contenido ilegal, violento, sexual, discriminatorio, difamatorio o que incite al odio.</li>
          <li>Intentar eludir el captcha, la verificación o las medidas de seguridad, o usar herramientas automatizadas.</li>
          <li>Usar el sitio para acosar, señalar o exponer a una persona concreta.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">5. Verificación, publicación y retirada</h2>
        <p>
          Los reportes no se publican de inmediato. Un verificador puede aprobarlos, rechazarlos o pedir información adicional, sin obligación de
          justificar su decisión. Nos reservamos el derecho de <strong>retirar, editar la ubicación o eliminar cualquier reporte</strong> en cualquier
          momento y sin aviso previo, por ejemplo si incumple estos términos o si una persona solicita que se retire una imagen suya.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">6. Licencia sobre lo que envías</h2>
        <p>
          Sigues siendo titular de tu foto. Al enviarla nos concedes una licencia gratuita, no exclusiva y de alcance mundial para almacenarla,
          reproducirla, redimensionarla y mostrarla públicamente en el mapa y en el funcionamiento del sitio, durante el tiempo que el reporte
          esté publicado. Puedes pedir su retirada escribiendo a <a className="underline" href={`mailto:${CORREO}`}>{CORREO}</a>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">7. Exactitud de la información</h2>
        <p>
          Los reportes son enviados por terceros. Aunque hacemos una verificación, no garantizamos que la información del mapa sea exacta,
          completa o actual, ni que una incidencia siga existiendo. Úsala bajo tu propio criterio.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">8. Disponibilidad del servicio</h2>
        <p>
          El sitio se ofrece “tal cual” y “según disponibilidad”. Puede interrumpirse, modificarse o cerrarse en cualquier momento, y no
          garantizamos que funcione sin errores en todos los dispositivos o conexiones.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">9. Limitación de responsabilidad</h2>
        <p>
          En la medida que lo permita la ley, {RESPONSABLE} no será responsable de daños directos o indirectos derivados del uso del sitio, de
          reportes de terceros, de su exactitud, de la falta de atención a un reporte o de decisiones que tomes con base en el mapa. Cada usuario es
          responsable del contenido que envía.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">10. Cambios en los términos</h2>
        <p>
          Podemos modificar estos términos. La fecha de arriba indica la última versión. Seguir usando el sitio después de un cambio implica aceptarlo.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">11. Ley aplicable y contacto</h2>
        <p>
          Estos términos se rigen por las leyes de {LEY}. Para cualquier consulta, reclamo o solicitud de retirada de contenido, escribe a{' '}
          <a className="underline" href={`mailto:${CORREO}`}>{CORREO}</a>.
        </p>
      </section>
    </main>
  )
}