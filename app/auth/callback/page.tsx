"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function CallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.substring(1)
      const hashParams = new URLSearchParams(hash)
      const accessToken = hashParams.get("access_token")

      if (accessToken) {
        const callbackUrl = new URL(
          "/api/auth/supabase/callback",
          window.location.origin
        )

        callbackUrl.searchParams.set("access_token", accessToken)

        const redirect = searchParams.get("redirect")
        const priceId = searchParams.get("priceId")
        const inviteId = searchParams.get("inviteId")

        if (redirect) callbackUrl.searchParams.set("redirect", redirect)
        if (priceId) callbackUrl.searchParams.set("priceId", priceId)
        if (inviteId) callbackUrl.searchParams.set("inviteId", inviteId)

        window.location.href = callbackUrl.toString()
        return
      }
    }

    router.push("/sign-in?error=oauth_failed")
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg">Procesando autenticación…</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Cargando…</p>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  )
}
