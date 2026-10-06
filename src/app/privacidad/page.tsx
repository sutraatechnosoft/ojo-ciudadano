import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Cómo se tratan la foto, la ubicación y los datos técnicos que envías al reportar una incidencia.',
}

// BORRADOR para revisión legal. Reemplaza todo lo que esté entre [CORCHETES].
const RESPONSABLE = 'Ojo Ciudadano, un proyecto de Sutra Technosoft'
const CORREO = 'bashboxdev@gmail.com'
const FECHA = '05/10/2026'
const DIAS_NO_PUBLICADOS = '30 días'

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 text-base leading-relaxed text-slate-800">
      <h1 className="text-3xl font-semibold">Política de privacidad</h1>
      <p className="text-slate-600">Última actualización: {FECHA}</p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Quién es el responsable</h2>
        <p>
          Este sitio es operado por {RESPONSABLE} (en adelante, “el responsable”). Para cualquier consulta o solicitud sobre tus datos,
          escribe a <a className="underline" href={`mailto:${CORREO}`}>{CORREO}</a>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. Qué datos recogemos</h2>
        <p>Al enviar un reporte de incidencia, recogemos:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li><strong>La foto</strong> que adjuntas como evidencia.</li>
          <li><strong>La ubicación</strong> del punto (latitud y longitud), que marcas en el mapa o que se obtiene de tu dispositivo si pulsas “Usar mi ubicación” y das permiso.</li>
          <li><strong>El tipo de incidencia</strong> que seleccionas.</li>
          <li>
            <strong>Datos técnicos</strong> que se generan al usar el sitio, como la dirección IP y datos básicos del navegador. Los registran
            los servicios que alojan y protegen el sitio (ver sección 5).
          </li>
        </ul>
        <p>
          No pedimos tu nombre, correo, teléfono ni cuenta de usuario para reportar. Tampoco usamos cookies de publicidad ni de seguimiento.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. La foto puede contener datos personales</h2>
        <p>
          Una foto puede mostrar personas, rostros, matrículas de vehículos o viviendas, aunque no los solicitemos. Por eso te pedimos
          no fotografiar a personas identificables, menores de edad ni el interior de viviendas (ver los Términos de uso). Antes de publicar, un
          verificador revisa el reporte y puede rechazarlo o retirarlo si contiene este tipo de datos.
        </p>
        <p>
          En el uso normal del sitio, la foto se reduce de tamaño en tu dispositivo antes de enviarse, y este proceso suele eliminar los
          metadatos incrustados en el archivo (como la ubicación EXIF). No podemos garantizarlo en todos los casos.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. Para qué usamos los datos</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Verificar que la incidencia existe en el lugar indicado.</li>
          <li><strong>Publicar el punto y la foto en el mapa público</strong> una vez verificados.</li>
          <li>Prevenir el abuso, el spam y los reportes falsos.</li>
          <li>Mantener la seguridad y el funcionamiento del sitio.</li>
        </ul>
        <p>
          <strong>Importante:</strong> lo que se publica en el mapa (la foto, la ubicación y el tipo de incidencia) es visible para cualquier
          persona que visite el sitio. No incluimos tu dirección IP en lo que se publica.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">5. Con quién se comparten o procesan los datos</h2>
        <p>Para operar el sitio usamos proveedores externos que procesan datos en nuestro nombre o por su propio funcionamiento:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li><strong>Vercel</strong>: alojamiento del sitio y registros técnicos (por ejemplo, la IP).</li>
          <li><strong>Supabase</strong>: almacenamiento de las fotos y de la base de datos de reportes.</li>
          <li><strong>Cloudflare Turnstile</strong>: verificación anti-bots al enviar el formulario.</li>
          <li>
            <strong>OpenStreetMap</strong>: proveedor de las teselas del mapa. Al cargar el mapa, tu navegador se conecta a sus servidores y
            estos pueden ver tu IP.
          </li>
        </ul>
        <p>
          Estos servicios pueden tratar datos en servidores fuera de Venezuela. Cada uno tiene sus propias políticas de privacidad. No vendemos
          tus datos ni los usamos para publicidad.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">6. Almacenamiento en tu dispositivo</h2>
        <p>
          Para que no pierdas tu avance si el navegador se recarga, el formulario puede guardar temporalmente en tu navegador (almacenamiento de
          sesión) el tipo de incidencia y las coordenadas. Estos datos permanecen en tu dispositivo, no se envían a nuestros servidores hasta que
          envías el reporte, y se borran al enviarlo o al cerrar la pestaña. Los servicios técnicos (como Turnstile) pueden usar almacenamiento
          propio para funcionar.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">7. Cuánto tiempo conservamos los datos</h2>
        <ul className="list-disc space-y-1 pl-6">
          <li>Los reportes publicados se conservan mientras sigan siendo útiles para el mapa o hasta que se solicite su retiro.</li>
          <li>Los reportes rechazados se eliminan en un plazo máximo de {DIAS_NO_PUBLICADOS}.</li>
          <li>Los registros técnicos los conservan los proveedores según sus propias políticas.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">8. Tus derechos</h2>
        <p>
          Puedes solicitar el acceso, la corrección o la <strong>eliminación</strong> de una foto o un reporte, o la retirada de una imagen en la
          que aparezcas. Escribe a <a className="underline" href={`mailto:${CORREO}`}>{CORREO}</a> indicando la ubicación aproximada y, si es posible, un enlace
          o descripción del reporte. Intentaremos responder y actuar con la mayor rapidez posible.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">9. Seguridad</h2>
        <p>
          Aplicamos medidas razonables para proteger los datos, como conexiones cifradas y revisión previa de los reportes. Ningún sistema es
          totalmente seguro y no podemos garantizar una seguridad absoluta.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">10. Menores de edad</h2>
        <p>
          Este sitio no está dirigido a menores de [EDAD]. Si crees que un menor ha enviado datos o aparece en una foto, escríbenos para
          que la retiremos.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">11. Cambios en esta política</h2>
        <p>
          Podemos actualizar esta política. La fecha de arriba indica la última versión. Si el cambio es importante, lo avisaremos en el sitio.
        </p>
      </section>

      <p className="border-t border-slate-200 pt-4 text-sm text-slate-600">
        Consulta también los <Link href="/terminos" className="underline">Términos de uso</Link>.
      </p>
    </main>
  )
}