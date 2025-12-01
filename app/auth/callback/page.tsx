"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Si hay hash con tokens, extraerlos y redirigir al callback del servidor
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1) // Quitar el #
      const hashParams = new URLSearchParams(hash)
      const accessToken = hashParams.get('access_token')
      
      console.log('Hash detectado:', hash.substring(0, 100))
      
      if (accessToken) {
        // Redirigir al callback del servidor con el token
        const callbackUrl = new URL('/api/auth/supabase/callback', window.location.origin)
        callbackUrl.searchParams.set('access_token', accessToken)
        
        // Pasar otros parámetros si existen
        const redirect = searchParams.get('redirect')
        const priceId = searchParams.get('priceId')
        const inviteId = searchParams.get('inviteId')
        
        if (redirect) callbackUrl.searchParams.set('redirect', redirect)
        if (priceId) callbackUrl.searchParams.set('priceId', priceId)
        if (inviteId) callbackUrl.searchParams.set('inviteId', inviteId)
        
        console.log('Redirigiendo a:', callbackUrl.toString())
        window.location.href = callbackUrl.toString()
        return
      }
    }

    // Si no hay hash, puede que ya haya procesado o hay un error
    console.log('No se encontró hash, redirigiendo a sign-in')
    router.push('/sign-in?error=oauth_failed')
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Procesando autenticación...</p>
      </div>
    </div>
  )
}
