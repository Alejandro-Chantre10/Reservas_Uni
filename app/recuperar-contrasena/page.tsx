"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function RecuperarContrasenaPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await resetPassword(email)
      setSuccess(true)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al enviar email"
      if (errorMessage.includes("user-not-found")) {
        setError("No existe una cuenta con este correo electronico.")
      } else {
        setError("Error al enviar el email. Por favor, intenta de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
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
                {success ? (
                  <CheckCircle2 className="w-8 h-8 text-accent" />
                ) : (
                  <Mail className="w-8 h-8 text-primary" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                {success ? "Correo Enviado" : "Recuperar Contrasena"}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {success
                  ? "Revisa tu bandeja de entrada y sigue las instrucciones"
                  : "Ingresa tu correo institucional para recibir un enlace de recuperacion"}
              </CardDescription>
            </CardHeader>

            {success ? (
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-accent/10 text-center">
                  <p className="text-sm text-foreground">
                    Hemos enviado un enlace de recuperacion a{" "}
                    <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Si no lo ves en tu bandeja de entrada, revisa la carpeta de spam.
                  </p>
                </div>
              </CardContent>
            ) : (
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
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
                        Enviando...
                      </>
                    ) : (
                      "Enviar Enlace de Recuperacion"
                    )}
                  </Button>
                </CardFooter>
              </form>
            )}

            <CardFooter className="pt-0">
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm text-primary hover:underline mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesion
              </Link>
            </CardFooter>
          </Card>
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
