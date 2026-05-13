"use client"

import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Package } from "lucide-react"

export interface Equipment {
  id: string
  nombre: string
  descripcion: string
  categoria: "audiovisual" | "laboratorio" | "computo" | "herramientas"
  imagen: string
  disponible: boolean
  cantidadTotal: number
  cantidadDisponible: number
  ubicacion: string
}

interface EquipmentCardProps {
  equipment: Equipment
  onReservar: (equipment: Equipment) => void
}

const categoriaColors: Record<Equipment["categoria"], string> = {
  audiovisual: "bg-blue-600 text-white",
  laboratorio: "bg-green-600 text-white",
  computo: "bg-purple-600 text-white",
  herramientas: "bg-orange-600 text-white",
}

const categoriaLabels: Record<Equipment["categoria"], string> = {
  audiovisual: "Audiovisual",
  laboratorio: "Laboratorio",
  computo: "Computo",
  herramientas: "Herramientas",
}

export function EquipmentCard({ equipment, onReservar }: EquipmentCardProps) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={equipment.imagen}
          alt={equipment.nombre}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <Badge className={categoriaColors[equipment.categoria]}>
            {categoriaLabels[equipment.categoria]}
          </Badge>
        </div>
        {!equipment.disponible && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="rounded-full bg-destructive px-4 py-2 text-sm font-medium text-white">
              No Disponible
            </span>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 text-lg">{equipment.nombre}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">{equipment.descripcion}</p>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>
              {equipment.cantidadDisponible} de {equipment.cantidadTotal} disponibles
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{equipment.ubicacion}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full gap-2"
          disabled={!equipment.disponible}
          onClick={() => onReservar(equipment)}
        >
          <Calendar className="h-4 w-4" />
          Reservar
        </Button>
      </CardFooter>
    </Card>
  )
}
