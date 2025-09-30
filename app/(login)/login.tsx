"use client"

import Link from "next/link"
import { useActionState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft } from "lucide-react"
import { signIn, signUp } from "./actions"
import type { ActionState } from "@/lib/auth/middleware"
import { RetroGrid } from "@/components/ui/retro-grid"

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")
  const priceId = searchParams.get("priceId")
  const inviteId = searchParams.get("inviteId")
  const [state, formAction, pending] = useActionState<ActionState, FormData>(mode === "signin" ? signIn : signUp, {
    error: "",
  })

  return (
    <>
      <div className="fixed inset-0 ">
        <RetroGrid />
      </div>

      <div className="min-h-screen relative z-10 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="text-center px-8 pt-12 pb-8">
              <div>
                <div className="flex justify-center mb-6">
                  <div className="absolute top-8 left-8">
                    <Link href="/">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#FF00E0] text-[#FF00E0] hover:bg-[#FF00E0] hover:text-white hover:border-[#FFB8F7] rounded-2xl bg-[#FFB8F7]/80 backdrop-blur-sm transition-all duration-300"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="w-32 h-16 bg-[#FF00E0] rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">MUNDI-AI</span>
                  </div>
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </CardTitle>
              <p className="text-gray-600">
                {mode === "signin"
                  ? "Sign in to access your AI booking dashboard"
                  : "Join thousands of businesses using AI for bookings"}
              </p>
                <div className="justify-items-center">
                  <Badge
                    variant="secondary"
                    className="mt-4 text-sm font-medium bg-[#FF2EE7] items-center justify-center text-white border-[#FF00E0]/20"
                  >
                    AI-Powered Platform
                  </Badge>
                </div>
            </CardHeader>

            <CardContent className="px-8 pb-12">
              <form className="space-y-6" action={formAction}>
                <input type="hidden" name="redirect" value={redirect || ""} />
                <input type="hidden" name="priceId" value={priceId || ""} />
                <input type="hidden" name="inviteId" value={inviteId || ""} />

                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue={state.email}
                    required
                    maxLength={50}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-d100b9 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    defaultValue={state.password}
                    required
                    minLength={8}
                    maxLength={100}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-d100b9 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your password"
                  />
                </div>

                {state?.error && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-200">
                    {state.error}
                  </div>
                )}

                <div>
                  <Button
                    type="submit"
                    className="w-full bg-[#FF00E0] hover:bg-[#FFE6FC] hover:text-[#FF00E0]  text-white hover:border hover:border-[#FF00E0] border-0 px-6 py-2 rounded-2xl shadow-lg hover:shadow-pink-d100b9/30 transition-all duration-300 font-medium text-lg"
                    disabled={pending}
                  >
                    {pending ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        Loading...
                      </>
                    ) : mode === "signin" ? (
                      "Sign In"
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">
                      {mode === "signin" ? "New to MUNDI-AI?" : "Already have an account?"}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href={`${mode === "signin" ? "/sign-up" : "/sign-in"}${
                      redirect ? `?redirect=${redirect}` : ""
                    }${priceId ? `&priceId=${priceId}` : ""}`}
                    className="w-full flex justify-center bg-white text-[#FF00E0]  hover:bg-[#FFE6FC]/90 border border-[#FF00E0]/30 hover:border-[#FF00E0] text-lg  shadow-lg hover:shadow-[#FF00E0]/30 transition-all duration-300 font-medium   rounded-2xl"
                  >
                    {mode === "signin" ? "Create an account" : "Sign in to existing account"}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
