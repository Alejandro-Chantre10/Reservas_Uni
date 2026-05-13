"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Clock, Package, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import type { Equipment } from "@/components/equipment-card"

interface ReservationFormProps {
  equipment: Equipment | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ReservationData) => void
}

export interface ReservationData {
  equipmentId: string
  equipmentName: string
  fecha: Date
  horaInicio: string
  horaFin: string
  cantidad: number
  proposito: string
}

const horasDisponibles = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
]

export function ReservationForm({ equipment, isOpen, onClose, onSubmit }: ReservationFormProps) {
  const [fecha, setFecha] = useState<Date>()
  const [horaInicio, setHoraInicio] = useState<string>("")
  const [horaFin, setHoraFin] = useState<string>("")
  const [cantidad, setCantidad] = useState<number>(1)
  const [proposito, setProposito] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!equipment || !fecha || !horaInicio || !horaFin || !proposito) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        equipmentId: equipment.id,
        equipmentName: equipment.nombre,
        fecha,
        horaInicio,
        horaFin,
        cantidad,
        proposito,
      })
      resetForm()
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFecha(undefined)
    setHoraInicio("")
    setHoraFin("")
    setCantidad(1)
    setProposito("")
  }

  const horasFinDisponibles = horasDisponibles.filter((hora) => hora > horaInicio)

  if (!equipment) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Reservar Equipo
          </DialogTitle>
          <DialogDescription>
            Completa el formulario para reservar: <strong>{equipment.nombre}</strong>
          </DialogDescription>
        </DialogHeader>

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
                      date < new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hora-inicio">Hora de Inicio</Label>
                <Select value={horaInicio} onValueChange={setHoraInicio}>
                  <SelectTrigger id="hora-inicio">
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {horasDisponibles.map((hora) => (
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
                    {horasFinDisponibles.map((hora) => (
                      <SelectItem key={hora} value={hora}>
                        {hora}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">
                Cantidad (Disponibles: {equipment.cantidadDisponible})
              </Label>
              <Input
                id="cantidad"
                type="number"
                min={1}
                max={equipment.cantidadDisponible}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposito">Proposito de la Reserva</Label>
              <Textarea
                id="proposito"
                placeholder="Describe brevemente para que necesitas el equipo..."
                value={proposito}
                onChange={(e) => setProposito(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!fecha || !horaInicio || !horaFin || !proposito || isSubmitting}
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
