"use client"

import { useState } from "react"
import { EquipmentCard, type Equipment } from "@/components/equipment-card"
import { ReservationForm, type ReservationData } from "@/components/reservation-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockEquipments: Equipment[] = [
  {
    id: "1",
    nombre: "Microscopio Optico Binocular",
    descripcion: "Microscopio de alta precision para practicas de biologia y quimica con aumentos de 40x a 1000x.",
    categoria: "laboratorio",
    imagen: "/placeholder.svg",
    disponible: true,
    cantidadTotal: 10,
    cantidadDisponible: 7,
    ubicacion: "Laboratorio A-201",
  },
  {
    id: "2",
    nombre: "Proyector Epson PowerLite",
    descripcion: "Proyector Full HD de 4000 lumenes ideal para presentaciones y clases magistrales.",
    categoria: "audiovisual",
    imagen: "/placeholder.svg",
    disponible: true,
    cantidadTotal: 15,
    cantidadDisponible: 12,
    ubicacion: "Almacen Audiovisual B-102",
  },
  {
    id: "3",
    nombre: "Laptop Dell Latitude 5520",
    descripcion: "Laptop empresarial con procesador Intel i7, 16GB RAM y SSD 512GB para trabajo academico.",
    categoria: "tecnologico",
    imagen: "/placeholder.svg",
    disponible: true,
    cantidadTotal: 25,
    cantidadDisponible: 18,
    ubicacion: "Centro de Computo C-305",
  },
  {
    id: "4",
    nombre: "Camara Canon EOS R6",
    descripcion: "Camara mirrorless profesional de 20MP con grabacion 4K para proyectos audiovisuales.",
    categoria: "audiovisual",
    imagen: "/placeholder.svg",
    disponible: true,
    cantidadTotal: 5,
    cantidadDisponible: 3,
    ubicacion: "Estudio de TV D-101",
  },
  {
    id: "5",
    nombre: "Osciloscopio Digital",
    descripcion: "Osciloscopio de 100MHz con 4 canales para practicas de electronica e ingenieria.",
    categoria: "laboratorio",
    imagen: "/placeholder.svg",
    disponible: false,
    cantidadTotal: 8,
    cantidadDisponible: 0,
    ubicacion: "Laboratorio Electronica E-203",
  },
  {
    id: "6",
    nombre: "Kit de Robotica Arduino",
    descripcion: "Kit completo con Arduino Mega, sensores, motores y componentes para proyectos de robotica.",
    categoria: "tecnologico",
    imagen: "/placeholder.svg",
    disponible: true,
    cantidadTotal: 20,
    cantidadDisponible: 15,
    ubicacion: "Laboratorio Robotica F-104",
  },
  {
    id: "7",
    nombre: "Balon de Futbol Profesional",
    descripcion: "Balon oficial FIFA Quality Pro para entrenamientos y competencias universitarias.",
    categoria: "deportivo",
    imagen: "/placeholder.svg",
    disponible: true,
    cantidadTotal: 30,
    cantidadDisponible: 25,
    ubicacion: "Bodega Deportiva G-001",
  },
  {
    id: "8",
    nombre: "Centrifuga de Laboratorio",
    descripcion: "Centrifuga de alta velocidad hasta 15000 RPM para separacion de muestras biologicas.",
    categoria: "laboratorio",
    imagen: "/placeholder.svg",
    disponible: true,
    cantidadTotal: 4,
    cantidadDisponible: 2,
    ubicacion: "Laboratorio Bioquimica A-305",
  },
]

type Categoria = Equipment["categoria"]

const categorias: { value: Categoria; label: string }[] = [
  { value: "laboratorio", label: "Laboratorio" },
  { value: "audiovisual", label: "Audiovisual" },
  { value: "tecnologico", label: "Tecnologico" },
  { value: "deportivo", label: "Deportivo" },
]

export function EquipmentGrid() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<Categoria[]>([])
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const filteredEquipments = mockEquipments.filter((equipment) => {
    const matchesSearch =
      equipment.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(equipment.categoria)
    
    const matchesAvailability = !showOnlyAvailable || equipment.disponible

    return matchesSearch && matchesCategory && matchesAvailability
  })

  const handleReservar = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setIsFormOpen(true)
  }

  const handleSubmitReservation = async (data: ReservationData) => {
    // Aqui se integraria con Firebase
    console.log("Reserva enviada:", data)
    alert(`Reserva confirmada para ${data.equipmentName}`)
  }

  const toggleCategory = (category: Categoria) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategories([])
    setShowOnlyAvailable(false)
  }

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || showOnlyAvailable

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar equipos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
                {(selectedCategories.length > 0 || showOnlyAvailable) && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                    {selectedCategories.length + (showOnlyAvailable ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Categorias</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categorias.map((cat) => (
                <DropdownMenuCheckboxItem
                  key={cat.value}
                  checked={selectedCategories.includes(cat.value)}
                  onCheckedChange={() => toggleCategory(cat.value)}
                >
                  {cat.label}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={showOnlyAvailable}
                onCheckedChange={setShowOnlyAvailable}
              >
                Solo disponibles
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((cat) => (
            <Badge
              key={cat}
              variant="secondary"
              className="cursor-pointer gap-1"
              onClick={() => toggleCategory(cat)}
            >
              {categorias.find((c) => c.value === cat)?.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        {filteredEquipments.length} equipo{filteredEquipments.length !== 1 ? "s" : ""} encontrado{filteredEquipments.length !== 1 ? "s" : ""}
      </div>

      {filteredEquipments.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEquipments.map((equipment) => (
            <EquipmentCard
              key={equipment.id}
              equipment={equipment}
              onReservar={handleReservar}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No se encontraron equipos</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Intenta ajustar los filtros o la busqueda
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      <ReservationForm
        equipment={selectedEquipment}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitReservation}
      />
    </div>
  )
}
