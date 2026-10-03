'use client'

import { useActionState, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { CATEGORIAS, CATEGORIA_KEYS } from '@/lib/categorias'
import type { FormState, Punto } from '@/lib/types'

const LocationPicker = dynamic(() => import('./LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100" />,
})

const inputCls =
  'w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-2 focus:outline-blue-600'

export default function PuntoForm({
  action,
  punto,
  submitLabel,
  publico = false,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  punto?: Punto
  submitLabel: string
  publico?: boolean
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {})
  const [lat, setLat] = useState(punto ? String(punto.latitud) : '')
  const [lon, setLon] = useState(punto ? String(punto.longitud) : '')
  const [geoMsg, setGeoMsg] = useState('')

  const latNum = lat !== '' && !Number.isNaN(Number(lat)) ? Number(lat) : null
  const lonNum = lon !== '' && !Number.isNaN(Number(lon)) ? Number(lon) : null

  const usarMiUbicacion = () => {
    setGeoMsg('')
    if (!navigator.geolocation) return setGeoMsg('Tu navegador no permite obtener la ubicación.')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6))
        setLon(pos.coords.longitude.toFixed(6))
      },
      () => setGeoMsg('No se pudo obtener tu ubicación. Haz clic en el mapa para marcarla.'),
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
        <label htmlFor="nombre" className="mb-1 block text-sm font-medium text-slate-700">
          Título
        </label>
        <input
          id="nombre" name="nombre" required maxLength={120} defaultValue={punto?.nombre}
          placeholder="Ej.: Hueco profundo frente a la escuela"
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="descripcion" className="mb-1 block text-sm font-medium text-slate-700">
          Descripción <span className="font-normal text-slate-500">(opcional, máx. 1000 caracteres)</span>
        </label>
        <textarea
          id="descripcion" name="descripcion" rows={3} maxLength={1000}
          defaultValue={punto?.descripcion ?? ''} className={inputCls}
        />
      </div>

      <div>
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <p className="m-0 text-sm font-medium text-slate-700">
            Ubicación <span className="font-normal text-slate-500">(haz clic en el mapa para marcarla)</span>
          </p>
          <button
            type="button" onClick={usarMiUbicacion}
            className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
          >
            Usar mi ubicación
          </button>
        </div>
        {geoMsg && <p role="status" className="my-1 text-sm text-amber-700">{geoMsg}</p>}
        <div className="h-64 overflow-hidden rounded-md border border-slate-300">
          <LocationPicker
            lat={latNum}
            lon={lonNum}
            onPick={(la, lo) => {
              setLat(String(la))
              setLon(String(lo))
            }}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitud" className="mb-1 block text-sm font-medium text-slate-700">Latitud</label>
            <input
              id="latitud" name="latitud" type="number" step="any" min={-90} max={90} required
              value={lat} onChange={(e) => setLat(e.target.value)} className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="longitud" className="mb-1 block text-sm font-medium text-slate-700">Longitud</label>
            <input
              id="longitud" name="longitud" type="number" step="any" min={-180} max={180} required
              value={lon} onChange={(e) => setLon(e.target.value)} className={inputCls}
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="foto" className="mb-1 block text-sm font-medium text-slate-700">
          Foto {publico ? '(obligatoria)' : ''}{' '}
          <span className="font-normal text-slate-500">(JPG, PNG o WebP, máx. 5 MB)</span>
        </label>
        {punto?.imagen_url && (
          <div className="mb-2 flex items-center gap-3 text-sm text-slate-600">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={punto.imagen_url} alt="" className="h-16 w-16 rounded object-cover" />
            <span>Foto actual. Sube otra para reemplazarla.</span>
          </div>
        )}
        <input
          id="foto" name="foto" type="file" required={publico} accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-medium file:text-slate-800 hover:file:bg-slate-200"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit" disabled={pending}
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
