"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Phone, 
  Building2,
  AlertCircle, 
  Loader2,
  CheckCircle2
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const facultades = [
  "Facultad de Ingenieria",
  "Facultad de Ciencias",
  "Facultad de Medicina",
  "Facultad de Derecho",
  "Facultad de Economia",
  "Facultad de Humanidades",
  "Facultad de Arquitectura",
  "Facultad de Comunicaciones",
]

const tiposUsuario = [
  { value: "estudiante", label: "Estudiante" },
  { value: "docente", label: "Docente" },
  { value: "investigador", label: "Investigador" },
  { value: "administrativo", label: "Personal Administrativo" },
]

export default function RegistroPage() {
  const router = useRouter()
  const { user, signUp, loading: authLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    tipoUsuario: "",
    facultad: "",
    codigoEstudiante: "",
    password: "",
    confirmPassword: "",
  })

  const passwordRequirements = [
    { text: "Minimo 8 caracteres", met: formData.password.length >= 8 },
    { text: "Al menos una mayuscula", met: /[A-Z]/.test(formData.password) },
    { text: "Al menos un numero", met: /[0-9]/.test(formData.password) },
    { text: "Las contrasenas coinciden", met: formData.password === formData.confirmPassword && formData.confirmPassword !== "" },
  ]

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!passwordRequirements.every(req => req.met)) {
      setError("Por favor, cumple con todos los requisitos de la contrasena.")
      return
    }

    setIsLoading(true)

    try {
      await signUp(formData.email, formData.password, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        tipoUsuario: formData.tipoUsuario as "estudiante" | "docente" | "investigador" | "administrativo",
        facultad: formData.facultad,
        codigo: formData.codigoEstudiante,
      })
      router.push("/login?registered=true")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al registrar"
      if (errorMessage.includes("email-already-in-use")) {
        setError("Este correo electronico ya esta registrado.")
      } else if (errorMessage.includes("weak-password")) {
        setError("La contrasena es muy debil. Usa al menos 6 caracteres.")
      } else {
        setError("Error al crear la cuenta. Por favor, intenta de nuevo.")
      }
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

  const nextStep = () => {
    if (step === 1) {
      if (!formData.nombre || !formData.apellido || !formData.email) {
        setError("Por favor, completa todos los campos obligatorios.")
        return
      }
      if (!formData.email.endsWith("@universidad.edu") && !formData.email.includes("@")) {
        setError("Por favor, usa un correo electronico valido.")
        return
      }
    }
    setError("")
    setStep(step + 1)
  }

  const prevStep = () => {
    setError("")
    setStep(step - 1)
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
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-lg">
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <User className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Crear Cuenta</CardTitle>
              <CardDescription className="text-muted-foreground">
                Registrate para acceder al sistema de reservas
              </CardDescription>

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        s === step
                          ? "bg-primary text-primary-foreground"
                          : s < step
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`w-8 h-0.5 mx-1 ${
                          s < step ? "bg-accent" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
                <span>Datos Personales</span>
                <span>Informacion Academica</span>
                <span>Contrasena</span>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Step 1: Personal Data */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-foreground">
                          Nombre *
                        </Label>
                        <Input
                          id="nombre"
                          placeholder="Juan"
                          className="bg-background border-input"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apellido" className="text-foreground">
                          Apellido *
                        </Label>
                        <Input
                          id="apellido"
                          placeholder="Perez"
                          className="bg-background border-input"
                          value={formData.apellido}
                          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">
                        Correo Institucional *
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
                      <Label htmlFor="telefono" className="text-foreground">
                        Telefono (Opcional)
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="telefono"
                          type="tel"
                          placeholder="+51 999 999 999"
                          className="pl-10 bg-background border-input"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Academic Information */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipoUsuario" className="text-foreground">
                        Tipo de Usuario *
                      </Label>
                      <select
                        id="tipoUsuario"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                        value={formData.tipoUsuario}
                        onChange={(e) => setFormData({ ...formData, tipoUsuario: e.target.value })}
                        required
                      >
                        <option value="">Selecciona tu tipo de usuario</option>
                        {tiposUsuario.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facultad" className="text-foreground">
                        Facultad *
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <select
                          id="facultad"
                          className="w-full h-10 pl-10 pr-3 rounded-md border border-input bg-background text-foreground"
                          value={formData.facultad}
                          onChange={(e) => setFormData({ ...formData, facultad: e.target.value })}
                          required
                        >
                          <option value="">Selecciona tu facultad</option>
                          {facultades.map((fac) => (
                            <option key={fac} value={fac}>
                              {fac}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="codigoEstudiante" className="text-foreground">
                        Codigo de Estudiante / ID Empleado *
                      </Label>
                      <Input
                        id="codigoEstudiante"
                        placeholder="20201234"
                        className="bg-background border-input"
                        value={formData.codigoEstudiante}
                        onChange={(e) => setFormData({ ...formData, codigoEstudiante: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Password */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground">
                        Contrasena *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Crea una contrasena segura"
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

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-foreground">
                        Confirmar Contrasena *
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirma tu contrasena"
                          className="pl-10 pr-10 bg-background border-input"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showConfirmPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-sm font-medium text-foreground">Requisitos de contrasena:</p>
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              req.met ? "text-accent" : "text-muted-foreground"
                            }`}
                          />
                          <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="terms"
                        className="w-4 h-4 mt-0.5 rounded border-input text-primary focus:ring-primary"
                        required
                      />
                      <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal">
                        Acepto los{" "}
                        <Link href="/terminos" className="text-primary hover:underline">
                          Terminos y Condiciones
                        </Link>{" "}
                        y la{" "}
                        <Link href="/privacidad" className="text-primary hover:underline">
                          Politica de Privacidad
                        </Link>
                      </Label>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <div className="flex gap-3 w-full">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-border text-foreground"
                      onClick={prevStep}
                    >
                      Anterior
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button
                      type="button"
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={nextStep}
                    >
                      Siguiente
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creando cuenta...
                        </>
                      ) : (
                        "Crear Cuenta"
                      )}
                    </Button>
                  )}
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Ya tienes una cuenta?{" "}
                  <Link href="/login" className="text-primary font-medium hover:underline">
                    Inicia sesion
                  </Link>
                </p>
              </CardFooter>
            </form>
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
