"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { user, userData, signIn, signInWithGoogle, loading: authLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (userData?.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/")
      }
    }
  }, [user, userData, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signIn(formData.email, formData.password)
      // Redirect handled by useEffect
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al iniciar sesion"
      if (errorMessage.includes("user-not-found") || errorMessage.includes("wrong-password")) {
        setError("Credenciales invalidas. Por favor, verifica tu email y contrasena.")
      } else if (errorMessage.includes("too-many-requests")) {
        setError("Demasiados intentos fallidos. Intenta de nuevo mas tarde.")
      } else {
        setError("Error al iniciar sesion. Por favor, intenta de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setIsLoading(true)
    try {
      await signInWithGoogle()
      // Redirect handled by useEffect
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al iniciar con Google"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">UniReservas</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Iniciar Sesion</CardTitle>
              <CardDescription className="text-muted-foreground">
                Ingresa tus credenciales universitarias para acceder al sistema
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Correo Institucional
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="usuario@universidad.edu"
                      className="pl-10 bg-background border-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground">
                      Contrasena
                    </Label>
                    <Link 
                      href="/recuperar-contrasena" 
                      className="text-sm text-primary hover:underline"
                    >
                      Olvidaste tu contrasena?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contrasena"
                      className="pl-10 pr-10 bg-background border-input"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground font-normal">
                    Mantener sesion iniciada
                  </Label>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Iniciando sesion...
                    </>
                  ) : (
                    "Iniciar Sesion"
                  )}
                </Button>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">O continua con</span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full border-border text-foreground hover:bg-secondary"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuar con Google
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  No tienes una cuenta?{" "}
                  <Link href="/registro" className="text-primary font-medium hover:underline">
                    Registrate aqui
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          {/* Demo credentials hint */}
          <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-sm text-center text-muted-foreground">
              <strong className="text-foreground">Demo:</strong> Usa{" "}
              <code className="px-1 py-0.5 rounded bg-muted text-xs">admin@universidad.edu</code> /{" "}
              <code className="px-1 py-0.5 rounded bg-muted text-xs">admin123</code> para acceder como administrador
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          2024 UniReservas. Sistema de Reservas Universitario.
        </div>
      </footer>
    </div>
  )
}
