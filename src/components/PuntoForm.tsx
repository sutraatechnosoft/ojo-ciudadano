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
  'w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-2 focus:outline-blue-600'

export default function PuntoForm({
  action,
  subir,
  punto,
  submitLabel,
  publico = false,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  // Solo en el formulario público: pide la URL firmada para subir la foto directo a Storage.
  subir?: (formData: FormData) => Promise<SubidaState>
  punto?: Punto
  submitLabel: string
  publico?: boolean
}) {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fotoMsg, setFotoMsg] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [tactil, setTactil] = useState(false)
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

      // 2) La foto va directo del navegador a Supabase (no pasa por Vercel, sin límite de 4,5 MB).
      const { error } = await createBrowserClient()
        .storage.from(BUCKET)
        .uploadToSignedUrl(r.path, r.token, archivo, { contentType: archivo.type })
      if (error) return { error: 'No se pudo subir la foto. Revisa tu conexión e inténtalo de nuevo.' }

      // 3) El servidor guarda el reporte con el ticket (la foto ya no viaja en la petición).
      formData.set('ticket', r.ticket)
    } else if (archivo) {
      formData.set('foto', archivo) // panel admin: ya comprimida, pesa menos de 1 MB
    }
    return action(prev, formData)
  }

  const [state, formAction, pending] = useActionState<FormState, FormData>(enviar, {})

  useEffect(() => {
    setTactil(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  useEffect(() => {
    if (!archivo) return setPreview(null)
    const url = URL.createObjectURL(archivo)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [archivo])

  const onElegir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const f = input.files?.[0]
    input.value = '' // permite volver a elegir el mismo archivo
    if (!f) return
    setFotoMsg('')
    setProcesando(true)
    try {
      const c = await comprimirImagen(f)
      if (c.size > MAX_BYTES_CLIENTE) throw new Error('muy pesada')
      setArchivo(c)
    } catch {
      setFotoMsg('No se pudo procesar la imagen. Usa una foto JPG, PNG o WebP.')
    } finally {
      setProcesando(false)
    }
  }
  const [lat, setLat] = useState(punto ? Number(punto.latitud).toFixed(6) : '')
  const [lon, setLon] = useState(punto ? Number(punto.longitud).toFixed(6) : '')
  const [geoMsg, setGeoMsg] = useState('')
  const [ubicando, setUbicando] = useState(false)

  const latNum = lat !== '' && !Number.isNaN(Number(lat)) ? Number(lat) : null
  const lonNum = lon !== '' && !Number.isNaN(Number(lon)) ? Number(lon) : null

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
        <h2 className="m-0 text-lg font-semibold">Reporte recibido</h2>
        <p className="mt-2 text-sm">
          Quedó pendiente de verificación. Aparecerá en el mapa cuando un verificador visite el sitio y confirme que existe.
        </p>
        <div className="mt-4 flex gap-4 text-sm">
          <Link href="/" className="font-medium underline">Volver al mapa</Link>
          {/* Navegación completa para reiniciar el formulario */}
          <a href="/reportar" className="underline">Enviar otro reporte</a>
        </div>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
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
        <label htmlFor="categoria" className="mb-1 block text-sm font-medium text-slate-700">
          Tipo de problema
        </label>
        <select
          id="categoria" name="categoria" required defaultValue={punto?.categoria ?? ''}
          className={inputCls}
        >
          <option value="" disabled>Selecciona una opción</option>
          {CATEGORIA_KEYS.map((k) => (
            <option key={k} value={k}>{CATEGORIAS[k].label}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="mb-2 mt-0 text-sm font-medium text-slate-700">
          Ubicación <span className="font-normal text-slate-500">(usa tu ubicación o toca el mapa para marcarla)</span>
        </p>
        <button
          type="button" onClick={usarMiUbicacion} disabled={ubicando}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-70 sm:w-auto"
        >
          <span aria-hidden="true">📍</span>
          {ubicando ? 'Buscando tu ubicación…' : 'Usar mi ubicación'}
        </button>
        {geoMsg && <p role="status" className="my-1 text-sm text-amber-700">{geoMsg}</p>}
        <div className="h-64 overflow-hidden rounded-md border border-slate-300">
          <LocationPicker
            lat={latNum}
            lon={lonNum}
            onPick={(la, lo) => {
              if (!dentroDeVenezuela(la, lo)) return setGeoMsg(MSG_FUERA_DE_VENEZUELA)
              setGeoMsg('')
              setLat(String(la))
              setLon(String(lo))
            }}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitud" className="mb-1 block text-sm font-medium text-slate-700">Latitud</label>
            <input
              id="latitud" name="latitud" type="text" readOnly aria-readonly="true" required
              autoComplete="off" value={lat} placeholder="—" className={`${inputCls} ${readonlyCls}`}
            />
          </div>
          <div>
            <label htmlFor="longitud" className="mb-1 block text-sm font-medium text-slate-700">Longitud</label>
            <input
              id="longitud" name="longitud" type="text" readOnly aria-readonly="true" required
              autoComplete="off" value={lon} placeholder="—" className={`${inputCls} ${readonlyCls}`}
            />
          </div>
        </div>
        <p className="mb-0 mt-2 text-xs text-slate-500">
          Las coordenadas se completan solas al marcar el punto en el mapa o con “Usar mi ubicación”.
        </p>
      </div>

      <div>
        <p className="mb-1 mt-0 text-sm font-medium text-slate-700">
          Foto {publico ? '(obligatoria)' : ''}{' '}
          <span className="font-normal text-slate-500">(se reduce automáticamente antes de enviarla)</span>
        </p>
        {(preview || punto?.imagen_url) && (
          <div className="mb-2 flex items-center gap-3 text-sm text-slate-600">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview ?? punto?.imagen_url ?? ''} alt="Vista previa de la foto" className="h-20 w-20 rounded object-cover" />
            <span>{preview ? 'Foto lista para enviar.' : 'Foto actual. Sube otra para reemplazarla.'}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {tactil && (
            <button
              type="button" onClick={() => camaraRef.current?.click()} disabled={procesando || pending}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 disabled:opacity-60"
            >
              📷 Tomar foto
            </button>
          )}
          <button
            type="button" onClick={() => archivoRef.current?.click()} disabled={procesando || pending}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 disabled:opacity-60"
          >
            {tactil ? '🖼️ Elegir de la galería' : 'Elegir archivo'}
          </button>
        </div>
        {/* Sin atributo name: la foto se envía desde el estado, ya comprimida.
            `capture` abre la cámara directamente en móvil; en PC se ignora. */}
        <input ref={camaraRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" hidden onChange={onElegir} />
        <input ref={archivoRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onElegir} />
        {procesando && <p role="status" className="mb-0 mt-2 text-sm text-slate-600">Procesando la foto…</p>}
        {fotoMsg && <p role="alert" className="mb-0 mt-2 text-sm text-red-700">{fotoMsg}</p>}
      </div>

      {publico && <Captcha resetKey={state} />}

      <div className="flex items-center gap-3">
        <button
          type="submit" disabled={pending || procesando || latNum === null || lonNum === null || (publico && !archivo)}
          className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {pending ? 'Enviando…' : submitLabel}
        </button>
        <Link href={publico ? '/' : '/admin/dashboard'} className="text-sm text-slate-600 hover:underline">
          Cancelar
        </Link>
      </div>
    </form>
  )
}
