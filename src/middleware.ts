import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

type CookieToSet = { name: string; value: string; options: CookieOptions }

// OWASP A01: control de acceso. Toda ruta /admin/* (excepto login) exige sesión válida.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() valida el JWT contra Supabase Auth (no confía solo en la cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isLogin = pathname === '/admin/login'
  const is2fa = pathname === '/admin/2fa'

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone()
    url.pathname = path
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (!user) return isLogin ? response : redirectTo('/admin/login')

  // 2FA obligatorio: sin nivel aal2 (contraseña + código TOTP) solo se puede estar en /admin/2fa.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  const completo = aal?.currentLevel === 'aal2'

  if (completo) return isLogin || is2fa ? redirectTo('/admin/dashboard') : response
  return is2fa ? response : redirectTo('/admin/2fa')
}

export const config = {
  matcher: ['/admin/:path*'],
}
