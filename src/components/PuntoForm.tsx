'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { CATEGORIAS, CATEGORIA_KEYS } from '@/lib/categorias'
import Captcha from './Captcha'
import { dentroDeVenezuela, MSG_FUERA_DE_VENEZUELA } from '@/lib/venezuela'
import { BUCKET } from '@/lib/imagenes'
import { comprimirImagen, MAX_BYTES_CLIENTE } from '@/lib/comprimirImagen'
import { createBrowserClient } from '@/lib/supabase/browser'
import type { FormState, Punto, SubidaState } from '@/lib/types'

const LocationPicker = dynamic(() => import('./LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100" />,
})

const readonlyCls = 'cursor-not-allowed bg-slate-100 text-slate-700'

const inputCls =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-base focus:outline-2 focus:outline-blue-600'

// Clave donde se guarda el borrador del reporte por si Chrome recarga la pestaña
// (pasa en móviles con poca RAM cuando se abre la cámara).
const CLAVE_BORRADOR = 'ojo-ciudadano:borrador-reporte'

// Pon en true solo mientras depuras con chrome://inspect.
const DEBUG = false
const log = (...args: unknown[]) => {
  if (DEBUG) console.log('[PuntoForm]', ...args)
}

export default function PuntoForm({
  action,
  subir,
  punto,
  submitLabel,
  publico = false,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  subir?: (formData: FormData) => Promise<SubidaState>
  punto?: Punto
  submitLabel: string
  publico?: boolean
}) {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fotoMsg, setFotoMsg] = useState('')
  const [avisoFoto, setAvisoFoto] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [tactil, setTactil] = useState(false)
  const [movil, setMovil] = useState(false)
  const [moverMapa, setMoverMapa] = useState(false)
  const [categoria, setCategoria] = useState<string>(punto?.categoria ?? '')
  const [lat, setLat] = useState(punto ? Number(punto.latitud).toFixed(6) : '')
  const [lon, setLon] = useState(punto ? Number(punto.longitud).toFixed(6) : '')
  const [geoMsg, setGeoMsg] = useState('')
  const [ubicando, setUbicando] = useState(false)
  const [borradorListo, setBorradorListo] = useState(false)
  const camaraRef = useRef<HTMLInputElement>(null)
  const archivoRef = useRef<HTMLInputElement>(null)

  // La foto vive en el estado (ya comprimida), no en el FormData nativo del <input>.
  const enviar = async (prev: FormState, formData: FormData): Promise<FormState> => {
    if (publico) {
      if (!archivo) return { error: 'Adjunta una foto como evidencia.' }
      if (!subir) return { error: 'No se pudo preparar la subida de la foto.' }

      // 1) Solo texto al servidor: valida captcha y límites, y devuelve una URL firmada.
      const meta = new FormData()
      for (const k of ['categoria', 'latitud', 'longitud', 'sitio_web', 'cf-turnstile-response']) {
        const v = formData.get(k)
        if (typeof v === 'string') meta.set(k, v)
      }
      meta.set('mime', archivo.type)
      meta.set('tamano', String(archivo.size))
      const r = await subir(meta)
      if (r.error || !r.path || !r.token || !r.ticket) return { error: r.error ?? 'No se pudo preparar la subida.' }

      const { error } = await createBrowserClient()
        .storage.from(BUCKET)
        .uploadToSignedUrl(r.path, r.token, archivo, { contentType: archivo.type })
      if (error) return { error: 'No se pudo subir la foto. Revisa tu conexión e inténtalo de nuevo.' }

      formData.set('ticket', r.ticket)
    } else if (archivo) {
      formData.set('foto', archivo)
    }
    return action(prev, formData)
  }

  const [state, formAction, pending] = useActionState<FormState, FormData>(enviar, {})

  useEffect(() => {
    log('montado', Math.round(performance.now()))
    // `tactil`: pantalla táctil (texto del botón de foto).
    // `movil`: táctil o pantalla angosta (bloqueo del mapa). Se actualiza si cambia el modo del dispositivo.
    const mqTactil = window.matchMedia('(pointer: coarse)')
    const mqMovil = window.matchMedia('(pointer: coarse), (max-width: 767px)')
    const actualizar = () => {
      setTactil(mqTactil.matches)
      setMovil(mqMovil.matches)
    }
    actualizar()
    mqTactil.addEventListener('change', actualizar)
    mqMovil.addEventListener('change', actualizar)
    return () => {
      mqTactil.removeEventListener('change', actualizar)
      mqMovil.removeEventListener('change', actualizar)
    }
  }, [])

  // Restaura el borrador (categoría y ubicación) si la pestaña se recargó. Solo en el formulario de alta.
  useEffect(() => {
    if (!punto) {
      try {
        const raw = sessionStorage.getItem(CLAVE_BORRADOR)
        if (raw) {
          const b = JSON.parse(raw) as { categoria?: string; lat?: string; lon?: string }
          if (b.categoria && b.categoria in CATEGORIAS) setCategoria(b.categoria)
          if (b.lat && b.lon && !Number.isNaN(Number(b.lat)) && !Number.isNaN(Number(b.lon))) {
            setLat(b.lat)
            setLon(b.lon)
          }
          log('borrador restaurado', b)
        }
      } catch {
        // sessionStorage no disponible o JSON dañado: se ignora.
      }
    }
    setBorradorListo(true)
  }, [punto])

  // Guarda el borrador solo después de restaurarlo, para no pisarlo con valores vacíos.
  useEffect(() => {
    if (punto || !borradorListo) return
    try {
      sessionStorage.setItem(CLAVE_BORRADOR, JSON.stringify({ categoria, lat, lon }))
    } catch {
      // Sin almacenamiento: no pasa nada.
    }
  }, [punto, borradorListo, categoria, lat, lon])

  // Al enviar con éxito, el borrador ya no hace falta.
  useEffect(() => {
    if (!state.ok) return
    try {
      sessionStorage.removeItem(CLAVE_BORRADOR)
    } catch {}
  }, [state.ok])

  useEffect(() => {
    if (!archivo) return setPreview(null)
    const url = URL.createObjectURL(archivo)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [archivo])

  // Chrome dispara `cancel` cuando se cierra el selector/cámara sin devolver ninguna foto
  // (incluye el caso en que la cámara falla por falta de memoria).
  useEffect(() => {
    const inputs = [camaraRef.current, archivoRef.current].filter((i): i is HTMLInputElement => i !== null)
    const alCancelar = () => {
      log('cancel: no llegó ninguna foto')
      setAvisoFoto(
        'No se recibió ninguna foto. Si la cámara falló, cierra otras apps y vuelve a intentarlo, o toma la foto con tu cámara normal y elígela desde la galería.'
      )
    }
    inputs.forEach((i) => i.addEventListener('cancel', alCancelar))
    return () => inputs.forEach((i) => i.removeEventListener('cancel', alCancelar))
  }, [])

  const onElegir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const f = input.files?.[0]
    input.value = ''
    log('onElegir', f?.size, f?.type)
    if (!f) return
    setFotoMsg('')
    setAvisoFoto('')
    setProcesando(true)
    try {
      const c = await comprimirImagen(f)
      if (c.size > MAX_BYTES_CLIENTE) throw new Error('muy pesada')
      setArchivo(c)
    } catch {
      setFotoMsg(
        'No se pudo procesar la foto. Cierra otras apps (o la grabación de pantalla) e inténtalo de nuevo, o elige otra foto de la galería. Se aceptan JPG, PNG y WebP.'
      )
    } finally {
      setProcesando(false)
    }
  }

  const latNum = lat !== '' && !Number.isNaN(Number(lat)) ? Number(lat) : null
  const lonNum = lon !== '' && !Number.isNaN(Number(lon)) ? Number(lon) : null

  // Reporte completo: categoría, ubicación y (en el formulario público) foto adjunta.
  const listo = categoria !== '' && latNum !== null && lonNum !== null && (!publico || archivo !== null)

  const usarMiUbicacion = () => {
    setGeoMsg('')
    if (!navigator.geolocation) return setGeoMsg('Tu navegador no permite obtener la ubicación.')
    setUbicando(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUbicando(false)
        if (!dentroDeVenezuela(pos.coords.latitude, pos.coords.longitude))
          return setGeoMsg('Tu ubicación actual está fuera de Venezuela. Marca el punto en el mapa.')
        setLat(pos.coords.latitude.toFixed(6))
        setLon(pos.coords.longitude.toFixed(6))
      },
      () => {
        setUbicando(false)
        setGeoMsg('No se pudo obtener tu ubicación. Revisa el permiso de ubicación o toca el mapa para marcarla.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  if (state.ok) {
    return (
      <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
        <h2 className="m-0 text-xl font-semibold">Reporte recibido</h2>
        <p className="mt-2 text-base">
          Quedó pendiente de verificación. Aparecerá en el mapa cuando un verificador visite el sitio y confirme que existe.
        </p>
        <div className="mt-4 flex gap-4 text-base">
          <Link href="/" className="font-medium underline">Volver al mapa</Link>
          <a href="/reportar" className="underline">Enviar otro reporte</a>
        </div>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-base text-red-800">
          {state.error}
        </div>
      )}

      {publico && (
        // Honeypot anti-bots: un usuario real nunca ve ni llena este campo.
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Sitio web
            <input name="sitio_web" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      )}

      <div>
        <label htmlFor="categoria" className="mb-1 block text-base font-medium text-slate-700">
          Tipo de incidencia
        </label>
        <select
          id="categoria" name="categoria" required value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className={inputCls}
        >
          <option value="" disabled>Selecciona una opción</option>
          {CATEGORIA_KEYS.map((k) => (
            <option key={k} value={k}>{CATEGORIAS[k].label}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-2 mt-0 text-base font-medium text-slate-700">
          Ubicación <span className="font-normal text-slate-500">(usa tu ubicación o toca el mapa para marcarla)</span>
        </p>
        <button
          type="button" onClick={usarMiUbicacion} disabled={ubicando}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-70 sm:w-auto"
        >
          <span aria-hidden="true" className="text-2xl leading-none">📍</span>
          {ubicando ? 'Buscando tu ubicación…' : 'Usar mi ubicación'}
        </button>
        {geoMsg && <p role="status" className="my-1 text-base text-amber-700">{geoMsg}</p>}
        <div className="relative h-64 overflow-hidden rounded-md border border-slate-300">
          <LocationPicker
            lat={latNum}
            lon={lonNum}
            // En pantallas táctiles el mapa arranca bloqueado para no atrapar el scroll de la página.
            arrastrar={!movil || moverMapa}
            onPick={(la, lo) => {
              if (!dentroDeVenezuela(la, lo)) return setGeoMsg(MSG_FUERA_DE_VENEZUELA)
              setGeoMsg('')
              // Máximo 6 decimales: es lo que acepta la validación del servidor.
              setLat(la.toFixed(6))
              setLon(lo.toFixed(6))
            }}
          />
          {movil && (
            <button
              type="button"
              onClick={() => setMoverMapa((v) => !v)}
              aria-pressed={moverMapa}
              className={`absolute right-2 top-2 z-[1000] inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-base font-semibold shadow-md ${
                moverMapa ? 'bg-blue-600 text-white' : 'bg-white/95 text-slate-800'
              }`}
            >
              <span aria-hidden="true" className="text-xl leading-none">{moverMapa ? '✔' : '✋'}</span>
              {moverMapa ? 'Listo' : 'Mover mapa'}
            </button>
          )}
        </div>
        {movil && (
          <p className="mb-0 mt-2 text-sm text-slate-500">
            {moverMapa
              ? 'Arrastra el mapa con un dedo. Toca “Listo” para volver a deslizar la página.'
              : 'Desliza para bajar por la página, toca el mapa para marcar el punto y usa “Mover mapa” para desplazarlo.'}
          </p>
        )}

        {/* IMPORTANTE: sin estos campos el servidor no recibe las coordenadas y responde "Latitud inválida". */}
        <input type="hidden" name="latitud" value={lat} />
        <input type="hidden" name="longitud" value={lon} />
        <p className="mb-0 mt-2 text-base text-slate-600" aria-live="polite">
          {latNum !== null && lonNum !== null
            ? `Ubicación marcada: ${lat}, ${lon}`
            : 'Aún no has marcado la ubicación.'}
        </p>
      </div>

      <div>
        <p className="mb-1 mt-0 text-base font-medium text-slate-700">
          Foto {publico ? '(obligatoria)' : ''}{' '}
          <span className="font-normal text-slate-500"></span>
        </p>
        {(preview || punto?.imagen_url) && (
          <div className="mb-2 flex items-center gap-3 text-base text-slate-600">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview ?? punto?.imagen_url ?? ''} alt="Vista previa de la foto" className="h-20 w-20 rounded object-cover" />
            <span>{preview ? 'Foto lista para enviar.' : 'Foto actual. Sube otra para reemplazarla.'}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {tactil && (
            <button
              type="button" onClick={() => camaraRef.current?.click()} disabled={procesando || pending}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-3 text-base font-medium text-slate-800 hover:bg-slate-100 disabled:opacity-60"
            >
              <span aria-hidden="true" className="text-2xl leading-none">📷</span>
              Tomar foto
            </button>
          )}
          <button
            type="button" onClick={() => archivoRef.current?.click()} disabled={procesando || pending}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-3 text-base font-medium text-slate-800 hover:bg-slate-100 disabled:opacity-60"
          >
            <span aria-hidden="true" className="text-2xl leading-none">🖼️</span>
            {tactil ? 'Elegir de la galería' : 'Elegir archivo'}
          </button>
        </div>
        {/* Sin atributo name: la foto se envía desde el estado, ya comprimida.
            `capture` abre la cámara directamente en móvil; en PC se ignora. */}
        <input ref={camaraRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden onChange={onElegir} />
        <input ref={archivoRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onElegir} />
        {tactil && (
          <p className="mb-0 mt-2 text-sm text-slate-500">
            Si la cámara falla, cierra otras apps e inténtalo de nuevo, o elige una foto de la galería.
          </p>
        )}
        {procesando && <p role="status" className="mb-0 mt-2 text-base text-slate-600">Procesando la foto…</p>}
        {avisoFoto && !fotoMsg && <p role="status" className="mb-0 mt-2 text-base text-amber-700">{avisoFoto}</p>}
        {fotoMsg && <p role="alert" className="mb-0 mt-2 text-base text-red-700">{fotoMsg}</p>}
      </div>

      {publico && latNum !== null && lonNum !== null && archivo && <Captcha resetKey={state} />}

      {publico && (
        <p className="m-0 text-sm text-slate-600">
          Al enviar aceptas los <Link href="/terminos" className="underline">Términos de uso</Link> y la{' '}
          <Link href="/privacidad" className="underline">Política de privacidad</Link>. La foto y el punto se publicarán en el mapa
          tras la verificación.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit" disabled={pending || procesando || !listo}
          className={`rounded-md px-5 py-3 text-base font-semibold transition-colors disabled:cursor-not-allowed ${
            listo
              ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800'
              : 'bg-slate-300 text-slate-600'
          } ${pending ? 'opacity-70' : ''}`}
        >
          {pending ? 'Enviando…' : submitLabel}
        </button>
        <Link href={publico ? '/' : '/admin/dashboard'} className="text-base text-slate-600 hover:underline">
          Cancelar
        </Link>
      </div>
    </form>
  )
}