import Link from "next/link"
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">UniReservas</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Sistema universitario para la gestion y reserva de equipos academicos, 
              de laboratorio y deportivos.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Enlaces Rapidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Catalogo de Equipos
                </Link>
              </li>
              <li>
                <Link href="/mis-reservas" className="text-muted-foreground hover:text-foreground transition-colors">
                  Mis Reservas
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Iniciar Sesion
                </Link>
              </li>
              <li>
                <Link href="/registro" className="text-muted-foreground hover:text-foreground transition-colors">
                  Registrarse
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Categorias</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground">Equipos de Laboratorio</span>
              </li>
              <li>
                <span className="text-muted-foreground">Equipos Audiovisuales</span>
              </li>
              <li>
                <span className="text-muted-foreground">Equipos Tecnologicos</span>
              </li>
              <li>
                <span className="text-muted-foreground">Equipos Deportivos</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>reservas@universidad.edu</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+52 (55) 1234-5678</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Av. Universidad 123, Ciudad Universitaria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
            <p>&copy; {new Date().getFullYear()} UniReservas. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-foreground transition-colors">
                Terminos de Uso
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
