'use client'

import { useEffect, useState } from 'react'
import { CATEGORIAS } from '@/lib/categorias'
import CategoriaIcon from './CategoriaIcon'

// Leyenda plegable: en móvil arranca cerrada para no tapar el mapa; en PC arranca abierta.
export default function Leyenda() {
  const [abierta, setAbierta] = useState(false)

  useEffect(() => {
    setAbierta(window.matchMedia('(min-width: 640px)').matches)
  }, [])

  return (
    <div className="absolute bottom-6 left-3 z-[1000] rounded-md bg-white/95 text-slate-700 shadow">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        aria-controls="leyenda-lista"
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
      >
        Leyenda
        <svg
          xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true" className={`transition-transform ${abierta ? '' : 'rotate-180'}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {abierta && (
        <ul id="leyenda-lista" className="m-0 list-none space-y-1 px-3 pb-3 text-sm">
          {Object.entries(CATEGORIAS).map(([k, c]) => (
            <li key={k} className="flex items-center gap-2">
              <span
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: c.color }}
              >
                <CategoriaIcon categoria={k as keyof typeof CATEGORIAS} size={14} />
              </span>
              {c.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}