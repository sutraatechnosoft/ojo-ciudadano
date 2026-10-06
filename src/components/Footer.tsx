import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 px-4 py-6 text-sm text-slate-600">
      <nav aria-label="Información legal" className="mx-auto flex max-w-3xl flex-wrap gap-x-5 gap-y-2">
        <Link href="/terminos" className="underline">Términos de uso</Link>
        <Link href="/privacidad" className="underline">Política de privacidad</Link>
      </nav>
    </footer>
  )
}