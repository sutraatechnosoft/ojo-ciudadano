'use client'

import { deletePunto } from '@/app/admin/dashboard/actions'

export default function DeleteButton({ id, nombre }: { id: string; nombre: string }) {
  return (
    <form
      action={deletePunto}
      onSubmit={(e) => {
        if (!confirm(`¿Eliminar el punto "${nombre}"?`)) e.preventDefault()
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-red-700 hover:underline">
        Eliminar
      </button>
    </form>
  )
}
