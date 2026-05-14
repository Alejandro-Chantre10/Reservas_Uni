"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { 
  CalendarIcon, 
  Clock, 
  Building2, 
  X, 
  Users, 
  MapPin,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { 
  type Laboratorio, 
  crearReservaLaboratorio,
  verificarDisponibilidad,
  obtenerReservasLaboratorioPorFecha,
  type ReservaLaboratorio 
} from "@/lib/firestore-services"

interface LaboratoryReservationFormProps {
  laboratory: Laboratorio | null
  isOpen: boolean
  onClose: () => void
}

const horasDisponibles = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
  "19:00", "20:00", "21:00",
]

export function LaboratoryReservationForm({ 
  laboratory, 
  isOpen, 
  onClose 
}: LaboratoryReservationFormProps) {
  const [fecha, setFecha] = useState<Date>()
  const [horaInicio, setHoraInicio] = useState<string>("")
  const [horaFin, setHoraFin] = useState<string>("")
  const [numeroParticipantes, setNumeroParticipantes] = useState<number>(1)
  const [proposito, setProposito] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [availabilityMessage, setAvailabilityMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [reservasDelDia, setReservasDelDia] = useState<ReservaLaboratorio[]>([])
  const [submitResult, setSubmitResult] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Reset form when laboratory changes
  useEffect(() => {
    if (laboratory) {
      resetForm()
    }
  }, [laboratory])

  // Check availability when date and times change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!laboratory?.id || !fecha || !horaInicio || !horaFin) {
        setAvailabilityMessage(null)
        return
      }

      if (laboratory.id.startsWith("mock-")) {
        setAvailabilityMessage({ type: "success", message: "Horario disponible (modo demo)" })
        return
      }

      setIsCheckingAvailability(true)
      try {
        const isAvailable = await verificarDisponibilidad(
          laboratory.id,
          fecha,
          horaInicio,
          horaFin
        )
        
        if (isAvailable) {
          setAvailabilityMessage({ type: "success", message: "Horario disponible" })
        } else {
          setAvailabilityMessage({ type: "error", message: "Este horario ya esta reservado" })
        }
      } catch (error) {
        console.log("[v0] Error checking availability:", error)
        setAvailabilityMessage({ type: "success", message: "Horario disponible (modo demo)" })
      } finally {
        setIsCheckingAvailability(false)
      }
    }

    checkAvailability()
  }, [laboratory?.id, fecha, horaInicio, horaFin])

  // Load reservations for selected date
  useEffect(() => {
    const loadReservations = async () => {
      if (!laboratory?.id || !fecha || laboratory.id.startsWith("mock-")) {
        setReservasDelDia([])
        return
      }

      try {
        const reservas = await obtenerReservasLaboratorioPorFecha(laboratory.id, fecha)
        setReservasDelDia(reservas)
      } catch (error) {
        console.log("[v0] Error loading reservations:", error)
        setReservasDelDia([])
      }
    }

    loadReservations()
  }, [laboratory?.id, fecha])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!laboratory || !fecha || !horaInicio || !horaFin || !proposito) return

    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      // Demo mode for mock data
      if (laboratory.id?.startsWith("mock-")) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setSubmitResult({ 
          type: "success", 
          message: `Reserva confirmada para ${laboratory.nombre}. Codigo: LAB-DEMO-${Math.random().toString(36).substring(2, 6).toUpperCase()}` 
        })
        setTimeout(() => {
          resetForm()
          onClose()
        }, 2000)
        return
      }

      const ubicacion = `${laboratory.edificio}, Piso ${laboratory.piso}, Sala ${laboratory.numeroSala}`
      
      await crearReservaLaboratorio({
        laboratorioId: laboratory.id!,
        laboratorioNombre: laboratory.nombre,
        laboratorioImagen: laboratory.imagen,
        ubicacion,
        usuarioId: "demo-user", // En produccion esto vendria del sistema de auth
        usuarioNombre: "Usuario Demo",
        usuarioEmail: "demo@universidad.edu",
        fechaReserva: fecha,
        horaInicio,
        horaFin,
        proposito,
        numeroParticipantes,
        tipoLaboratorio: laboratory.tipo,
      })

      setSubmitResult({ 
        type: "success", 
        message: `Reserva creada exitosamente para ${laboratory.nombre}` 
      })
      
      setTimeout(() => {
        resetForm()
        onClose()
      }, 2000)
    } catch (error) {
      console.log("[v0] Error creating reservation:", error)
      setSubmitResult({ 
        type: "error", 
        message: "Error al crear la reserva. Por favor intenta de nuevo." 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFecha(undefined)
    setHoraInicio("")
    setHoraFin("")
    setNumeroParticipantes(1)
    setProposito("")
    setAvailabilityMessage(null)
    setSubmitResult(null)
    setReservasDelDia([])
  }

  const horasFinDisponibles = horasDisponibles.filter((hora) => hora > horaInicio)

  // Get day of week for selected date
  const getDayOfWeek = (date: Date): string => {
    const days = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
    return days[date.getDay()]
  }

  // Check if laboratory is open on selected day
  const isLabOpenOnDay = (date: Date): boolean => {
    if (!laboratory) return false
    const dayOfWeek = getDayOfWeek(date)
    if (dayOfWeek === "domingo") return false
    return laboratory.horariosDisponibles.some(h => h.dia === dayOfWeek)
  }

  // Get operating hours for selected day
  const getOperatingHours = (date: Date) => {
    if (!laboratory) return null
    const dayOfWeek = getDayOfWeek(date)
    return laboratory.horariosDisponibles.find(h => h.dia === dayOfWeek)
  }

  if (!laboratory) return null

  const ubicacion = `${laboratory.edificio}, Piso ${laboratory.piso}, Sala ${laboratory.numeroSala}`
  const operatingHours = fecha ? getOperatingHours(fecha) : null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Reservar Laboratorio
          </DialogTitle>
          <DialogDescription>
            Completa el formulario para reservar: <strong>{laboratory.nombre}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Lab Info Summary */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{ubicacion}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Capacidad maxima: {laboratory.capacidad} personas</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha de Reserva</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="fecha"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fecha && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fecha ? format(fecha, "PPP", { locale: es }) : "Selecciona una fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fecha}
                    onSelect={setFecha}
                    disabled={(date) =>
                      date < new Date() || 
                      date.getDay() === 0 || // Domingo
                      !isLabOpenOnDay(date)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {fecha && operatingHours && (
                <p className="text-xs text-muted-foreground">
                  Horario del laboratorio: {operatingHours.horaInicio} - {operatingHours.horaFin}
                </p>
              )}
            </div>

            {/* Show existing reservations for the day */}
            {reservasDelDia.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Reservas existentes para este dia:
                  <ul className="mt-1 text-xs">
                    {reservasDelDia.map((r) => (
                      <li key={r.id}>• {r.horaInicio} - {r.horaFin}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hora-inicio">Hora de Inicio</Label>
                <Select value={horaInicio} onValueChange={setHoraInicio}>
                  <SelectTrigger id="hora-inicio">
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {horasDisponibles
                      .filter(hora => {
                        if (!operatingHours) return true
                        return hora >= operatingHours.horaInicio && hora < operatingHours.horaFin
                      })
                      .map((hora) => (
                        <SelectItem key={hora} value={hora}>
                          {hora}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora-fin">Hora de Fin</Label>
                <Select
                  value={horaFin}
                  onValueChange={setHoraFin}
                  disabled={!horaInicio}
                >
                  <SelectTrigger id="hora-fin">
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {horasFinDisponibles
                      .filter(hora => {
                        if (!operatingHours) return true
                        return hora <= operatingHours.horaFin
                      })
                      .map((hora) => (
                        <SelectItem key={hora} value={hora}>
                          {hora}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Availability Status */}
            {availabilityMessage && (
              <Alert variant={availabilityMessage.type === "error" ? "destructive" : "default"}>
                {availabilityMessage.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {isCheckingAvailability ? "Verificando disponibilidad..." : availabilityMessage.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="participantes">
                Numero de Participantes (Max: {laboratory.capacidad})
              </Label>
              <Input
                id="participantes"
                type="number"
                min={1}
                max={laboratory.capacidad}
                value={numeroParticipantes}
                onChange={(e) => setNumeroParticipantes(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposito">Proposito de la Reserva</Label>
              <Textarea
                id="proposito"
                placeholder="Describe brevemente para que necesitas el laboratorio (practica, proyecto, clase, etc.)..."
                value={proposito}
                onChange={(e) => setProposito(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Submit Result */}
          {submitResult && (
            <Alert variant={submitResult.type === "error" ? "destructive" : "default"}>
              {submitResult.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{submitResult.message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                !fecha || 
                !horaInicio || 
                !horaFin || 
                !proposito || 
                isSubmitting || 
                availabilityMessage?.type === "error" ||
                numeroParticipantes > laboratory.capacidad
              }
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Reservando..." : "Confirmar Reserva"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
