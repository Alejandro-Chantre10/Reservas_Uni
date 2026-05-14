import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StatsSection } from "@/components/stats-section"
import { LaboratoryGrid } from "@/components/laboratory-grid"
import { Button } from "@/components/ui/button"
import { ArrowRight, CalendarCheck, Clock, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Sistema de Reservas de{" "}
                <span className="text-primary">Laboratorios Universitarios</span>
              </h1>
              <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
                Reserva facilmente laboratorios de computacion, quimica, fisica, biologia y mas
                para tus practicas y proyectos academicos. Disponible las 24 horas, los 7 dias de la semana.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="#catalogo">
                    Ver Laboratorios
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/login">Iniciar Sesion</Link>
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-3">
              <div className="flex flex-col items-center rounded-lg bg-card p-6 text-center shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CalendarCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Reserva Facil</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Proceso simple y rapido para reservar cualquier laboratorio disponible
                </p>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-card p-6 text-center shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 font-semibold">Disponibilidad 24/7</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Consulta disponibilidad y reserva en cualquier momento
                </p>
              </div>
              <div className="flex flex-col items-center rounded-lg bg-card p-6 text-center shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/10">
                  <Shield className="h-6 w-6 text-chart-2" />
                </div>
                <h3 className="mt-4 font-semibold">Sistema Seguro</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tus datos y reservas protegidos con la mejor seguridad
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <StatsSection />
          </div>
        </section>

        {/* Catalog Section */}
        <section id="catalogo" className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold">Catalogo de Laboratorios</h2>
              <p className="mt-2 text-muted-foreground">
                Explora nuestra amplia seleccion de laboratorios disponibles para reserva
              </p>
            </div>
            <LaboratoryGrid />
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">Comienza a Reservar Hoy</h2>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80">
              Registrate con tu correo institucional y accede a todos los laboratorios 
              disponibles para tu carrera y facultad.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/registro">
                  Crear Cuenta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/login">Ya tengo cuenta</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
