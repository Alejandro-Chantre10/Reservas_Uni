"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Package, 
  Search,
  Filter,
  ChevronDown,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowLeft,
  Download,
  Printer,
  MoreHorizontal,
  CalendarDays,
  User,
  Mail,
  Phone,
  Building,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { obtenerReservasUsuario, cancelarReserva, type Reserva } from "@/lib/firestore-services"

type ReservationStatus = "pendiente" | "aprobada" | "en_uso" | "completada" | "cancelada" | "rechazada"

interface Reservation {
  id: string
  firestoreId?: string
  equipmentName: string
  equipmentImage: string
  category: string
  quantity: number
  date: string
  startTime: string
  endTime: string
  location: string
  status: ReservationStatus
  createdAt: string
  notes?: string
  approvedBy?: string
  rejectionReason?: string
}

function mapReservaToReservation(reserva: Reserva): Reservation {
  return {
    id: reserva.codigo,
    equipmentName: reserva.equipoNombre,
    equipmentImage: reserva.equipoImagen || "/placeholder.svg",
    category: reserva.categoria,
    quantity: reserva.cantidad,
    date: reserva.fechaReserva instanceof Date 
      ? reserva.fechaReserva.toISOString().split("T")[0]
      : new Date(reserva.fechaReserva).toISOString().split("T")[0],
    startTime: reserva.horaInicio,
    endTime: reserva.horaFin,
    location: reserva.ubicacion,
    status: reserva.estado,
    createdAt: reserva.createdAt instanceof Date
      ? reserva.createdAt.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    notes: reserva.proposito,
    rejectionReason: reserva.mensajeRechazo,
    firestoreId: reserva.id,
  }
}

const statusConfig: Record<ReservationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2; color: string }> = {
  pendiente: { label: "Pendiente", variant: "secondary", icon: Clock3, color: "text-warning" },
  aprobada: { label: "Aprobada", variant: "default", icon: CheckCircle2, color: "text-success" },
  en_uso: { label: "En Uso", variant: "default", icon: Package, color: "text-primary" },
  completada: { label: "Completada", variant: "outline", icon: CheckCircle2, color: "text-muted-foreground" },
  cancelada: { label: "Cancelada", variant: "destructive", icon: XCircle, color: "text-destructive" },
  rechazada: { label: "Rechazada", variant: "destructive", icon: AlertCircle, color: "text-destructive" }
}

function MisReservasContent() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null)
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    async function loadReservations() {
      if (!user) return
      
      try {
        setLoading(true)
        const reservas = await obtenerReservasUsuario(user.uid)
        setReservations(reservas.map(mapReservaToReservation))
      } catch (err) {
        console.error("Error loading reservations:", err)
      } finally {
        setLoading(false)
      }
    }

    loadReservations()
  }, [user])

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "todos" || reservation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: reservations.length,
    pendientes: reservations.filter(r => r.status === "pendiente").length,
    activas: reservations.filter(r => r.status === "aprobada" || r.status === "en_uso").length,
    completadas: reservations.filter(r => r.status === "completada").length
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("es-ES", options)
  }

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setShowDetails(true)
  }

  const handleCancelReservation = (reservation: Reservation) => {
    setReservationToCancel(reservation)
    setShowCancelDialog(true)
  }

  const confirmCancel = async () => {
    if (!reservationToCancel?.firestoreId) return
    
    try {
      setCanceling(true)
      await cancelarReserva(reservationToCancel.firestoreId)
      setReservations(prev => 
        prev.map(r => 
          r.id === reservationToCancel.id 
            ? { ...r, status: "cancelada" as ReservationStatus }
            : r
        )
      )
      setShowCancelDialog(false)
      setReservationToCancel(null)
    } catch (err) {
      console.error("Error canceling reservation:", err)
      alert("Error al cancelar la reserva. Intenta de nuevo.")
    } finally {
      setCanceling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b bg-card">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">Volver</span>
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-foreground md:text-3xl">Mis Reservas</h1>
                  <p className="text-muted-foreground">Gestiona y consulta el historial de tus reservas</p>
                </div>
              </div>
              <Link href="/#catalogo">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Package className="mr-2 h-4 w-4" />
                  Nueva Reserva
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <Clock3 className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.pendientes}</p>
                    <p className="text-sm text-muted-foreground">Pendientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.activas}</p>
                    <p className="text-sm text-muted-foreground">Activas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.completadas}</p>
                    <p className="text-sm text-muted-foreground">Completadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Filters */}
        <section className="container mx-auto px-4 pb-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por equipo, codigo o ubicacion..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto">
                      <Filter className="mr-2 h-4 w-4" />
                      {statusFilter === "todos" ? "Todos los estados" : statusConfig[statusFilter as ReservationStatus]?.label}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setStatusFilter("todos")}>
                      Todos los estados
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("pendiente")}>
                      <Clock3 className="mr-2 h-4 w-4 text-warning" />
                      Pendiente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("aprobada")}>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                      Aprobada
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("en_uso")}>
                      <Package className="mr-2 h-4 w-4 text-primary" />
                      En Uso
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("completada")}>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      Completada
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("cancelada")}>
                      <XCircle className="mr-2 h-4 w-4 text-destructive" />
                      Cancelada
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("rechazada")}>
                      <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
                      Rechazada
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Reservations List */}
        <section className="container mx-auto px-4 pb-12">
          {filteredReservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="h-16 w-16 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">No hay reservas</h3>
                <p className="mt-2 text-center text-muted-foreground">
                  {searchTerm || statusFilter !== "todos" 
                    ? "No se encontraron reservas con los filtros aplicados"
                    : "Aun no has realizado ninguna reserva"}
                </p>
                <Link href="/#catalogo" className="mt-4">
                  <Button>Explorar Equipos</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => {
                const status = statusConfig[reservation.status]
                const StatusIcon = status.icon
                const canCancel = reservation.status === "pendiente" || reservation.status === "aprobada"
                
                return (
                  <Card key={reservation.id} className="overflow-hidden transition-shadow hover:shadow-md">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Equipment Image */}
                        <div className="flex items-center justify-center bg-muted/50 p-4 md:w-32">
                          <img
                            src={reservation.equipmentImage}
                            alt={reservation.equipmentName}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        </div>
                        
                        {/* Content */}
                        <div className="flex flex-1 flex-col p-4">
                          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">{reservation.equipmentName}</h3>
                                <Badge variant={status.variant} className="text-xs">
                                  <StatusIcon className={`mr-1 h-3 w-3 ${status.color}`} />
                                  {status.label}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Codigo: {reservation.id} | Cantidad: {reservation.quantity} unidad(es)
                              </p>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(reservation)}
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                Ver Detalles
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Mas opciones</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewDetails(reservation)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar Comprobante
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Imprimir
                                  </DropdownMenuItem>
                                  {canCancel && (
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => handleCancelReservation(reservation)}
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Cancelar Reserva
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          {/* Details Grid */}
                          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{new Date(reservation.date).toLocaleDateString("es-ES")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{reservation.startTime} - {reservation.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{reservation.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">{reservation.category}</span>
                            </div>
                          </div>

                          {/* Rejection Reason */}
                          {reservation.status === "rechazada" && reservation.rejectionReason && (
                            <div className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 p-3">
                              <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
                              <div>
                                <p className="text-sm font-medium text-destructive">Motivo del rechazo:</p>
                                <p className="text-sm text-destructive/80">{reservation.rejectionReason}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Reserva</DialogTitle>
            <DialogDescription>
              Informacion completa de tu reserva
            </DialogDescription>
          </DialogHeader>
          
          {selectedReservation && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <img
                  src={selectedReservation.equipmentImage}
                  alt={selectedReservation.equipmentName}
                  className="h-24 w-24 rounded-lg bg-muted object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{selectedReservation.equipmentName}</h3>
                    <Badge variant={statusConfig[selectedReservation.status].variant}>
                      {statusConfig[selectedReservation.status].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Categoria: {selectedReservation.category}</p>
                  <p className="text-sm text-muted-foreground">Codigo: {selectedReservation.id}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Fecha y Hora</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm">{formatDate(selectedReservation.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">{selectedReservation.startTime} - {selectedReservation.endTime}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Ubicacion</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">{selectedReservation.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="text-sm">{selectedReservation.quantity} unidad(es)</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Informacion Adicional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fecha de solicitud:</span>
                    <span>{formatDate(selectedReservation.createdAt)}</span>
                  </div>
                  {selectedReservation.approvedBy && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Aprobado por:</span>
                      <span>{selectedReservation.approvedBy}</span>
                    </div>
                  )}
                  {selectedReservation.notes && (
                    <div className="pt-2">
                      <span className="text-sm text-muted-foreground">Notas:</span>
                      <p className="mt-1 text-sm">{selectedReservation.notes}</p>
                    </div>
                  )}
                  {selectedReservation.rejectionReason && (
                    <div className="mt-2 rounded-lg bg-destructive/10 p-3">
                      <span className="text-sm font-medium text-destructive">Motivo del rechazo:</span>
                      <p className="mt-1 text-sm text-destructive/80">{selectedReservation.rejectionReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Descargar Comprobante
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            {selectedReservation && (selectedReservation.status === "pendiente" || selectedReservation.status === "aprobada") && (
              <Button 
                variant="destructive" 
                className="w-full sm:w-auto"
                onClick={() => {
                  setShowDetails(false)
                  handleCancelReservation(selectedReservation)
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar Reserva
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
            <DialogDescription>
              ¿Estas seguro de que deseas cancelar esta reserva? Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          {reservationToCancel && (
            <div className="rounded-lg bg-muted p-4">
              <p className="font-medium">{reservationToCancel.equipmentName}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(reservationToCancel.date).toLocaleDateString("es-ES")} | {reservationToCancel.startTime} - {reservationToCancel.endTime}
              </p>
              <p className="text-sm text-muted-foreground">{reservationToCancel.location}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={canceling}>
              No, Mantener
            </Button>
            <Button variant="destructive" onClick={confirmCancel} disabled={canceling}>
              {canceling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Si, Cancelar Reserva"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function MisReservasPage() {
  return (
    <AuthGuard>
      <MisReservasContent />
    </AuthGuard>
  )
}
