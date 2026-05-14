"use client"

import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Calendar, 
  MapPin, 
  Users, 
  Monitor, 
  Thermometer, 
  Wifi, 
  Computer, 
  PresentationIcon,
  Wrench,
  Wind,
  Microscope,
  Printer
} from "lucide-react"
import type { Laboratorio, TipoLaboratorio, Amenidad } from "@/lib/firestore-services"

interface LaboratoryCardProps {
  laboratory: Laboratorio
  onReservar: (laboratory: Laboratorio) => void
}

const tipoColors: Record<TipoLaboratorio, string> = {
  computacion: "bg-blue-600 text-white",
  quimica: "bg-emerald-600 text-white",
  fisica: "bg-amber-600 text-white",
  biologia: "bg-green-600 text-white",
  electronica: "bg-purple-600 text-white",
  robotica: "bg-rose-600 text-white",
  idiomas: "bg-cyan-600 text-white",
  multimedia: "bg-orange-600 text-white",
}

const tipoLabels: Record<TipoLaboratorio, string> = {
  computacion: "Computacion",
  quimica: "Quimica",
  fisica: "Fisica",
  biologia: "Biologia",
  electronica: "Electronica",
  robotica: "Robotica",
  idiomas: "Idiomas",
  multimedia: "Multimedia",
}

const amenidadIcons: Record<Amenidad, { icon: React.ElementType; label: string }> = {
  proyector: { icon: PresentationIcon, label: "Proyector" },
  aire_acondicionado: { icon: Thermometer, label: "Aire Acondicionado" },
  wifi: { icon: Wifi, label: "WiFi" },
  computadoras: { icon: Computer, label: "Computadoras" },
  pizarra_digital: { icon: Monitor, label: "Pizarra Digital" },
  equipo_especializado: { icon: Wrench, label: "Equipo Especializado" },
  ventilacion: { icon: Wind, label: "Ventilacion" },
  microscopios: { icon: Microscope, label: "Microscopios" },
  impresora_3d: { icon: Printer, label: "Impresora 3D" },
}

const estadoStyles: Record<Laboratorio["estado"], { label: string; className: string }> = {
  disponible: { label: "Disponible", className: "bg-green-500 text-white" },
  mantenimiento: { label: "En Mantenimiento", className: "bg-amber-500 text-white" },
  ocupado: { label: "Ocupado", className: "bg-red-500 text-white" },
}

export function LaboratoryCard({ laboratory, onReservar }: LaboratoryCardProps) {
  const isAvailable = laboratory.estado === "disponible"
  const ubicacion = `${laboratory.edificio}, Piso ${laboratory.piso}, Sala ${laboratory.numeroSala}`

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={laboratory.imagen}
          alt={laboratory.nombre}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge className={tipoColors[laboratory.tipo]}>
            {tipoLabels[laboratory.tipo]}
          </Badge>
        </div>
        <div className="absolute right-3 top-3">
          <Badge className={estadoStyles[laboratory.estado].className}>
            {estadoStyles[laboratory.estado].label}
          </Badge>
        </div>
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="rounded-full bg-destructive px-4 py-2 text-sm font-medium text-white">
              {estadoStyles[laboratory.estado].label}
            </span>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 text-lg">{laboratory.nombre}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">{laboratory.descripcion}</p>
        
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0" />
            <span>Capacidad: {laboratory.capacidad} personas</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{ubicacion}</span>
          </div>
        </div>

        {/* Amenidades */}
        <div className="flex flex-wrap gap-1">
          <TooltipProvider>
            {laboratory.amenidades.slice(0, 5).map((amenidad) => {
              const { icon: Icon, label } = amenidadIcons[amenidad]
              return (
                <Tooltip key={amenidad}>
                  <TooltipTrigger asChild>
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{label}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
            {laboratory.amenidades.length > 5 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                    +{laboratory.amenidades.length - 5}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{laboratory.amenidades.slice(5).map(a => amenidadIcons[a].label).join(", ")}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full gap-2"
          disabled={!isAvailable}
          onClick={() => onReservar(laboratory)}
        >
          <Calendar className="h-4 w-4" />
          Reservar Laboratorio
        </Button>
      </CardFooter>
    </Card>
  )
}

export type { Laboratorio }
