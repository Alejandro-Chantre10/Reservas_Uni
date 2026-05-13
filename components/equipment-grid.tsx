"use client"

import { useState, useEffect } from "react"
import { EquipmentCard, type Equipment } from "@/components/equipment-card"
import { ReservationForm, type ReservationData } from "@/components/reservation-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { obtenerEquipos, crearReserva, type Equipo } from "@/lib/firestore-services"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

type Categoria = Equipment["categoria"]

const categorias: { value: Categoria; label: string }[] = [
  { value: "audiovisual", label: "Audiovisual" },
  { value: "laboratorio", label: "Laboratorio" },
  { value: "computo", label: "Computo" },
  { value: "herramientas", label: "Herramientas" },
]

function mapEquipoToEquipment(equipo: Equipo): Equipment {
  return {
    id: equipo.id || "",
    nombre: equipo.nombre,
    descripcion: equipo.descripcion,
    categoria: equipo.categoria,
    imagen: equipo.imagen || "/placeholder.svg",
    disponible: equipo.estado === "disponible" && equipo.disponibles > 0,
    cantidadTotal: equipo.cantidad,
    cantidadDisponible: equipo.disponibles,
    ubicacion: equipo.ubicacion,
  }
}

export function EquipmentGrid() {
  const router = useRouter()
  const { user, userData } = useAuth()
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<Categoria[]>([])
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    async function loadEquipments() {
      try {
        setLoading(true)
        const equipos = await obtenerEquipos()
        setEquipments(equipos.map(mapEquipoToEquipment))
        setError(null)
      } catch (err) {
        console.error("Error loading equipments:", err)
        setError("Error al cargar los equipos. Intenta de nuevo mas tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadEquipments()
  }, [])

  const filteredEquipments = equipments.filter((equipment) => {
    const matchesSearch =
      equipment.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(equipment.categoria)
    
    const matchesAvailability = !showOnlyAvailable || equipment.disponible

    return matchesSearch && matchesCategory && matchesAvailability
  })

  const handleReservar = (equipment: Equipment) => {
    if (!user) {
      router.push("/login")
      return
    }
    setSelectedEquipment(equipment)
    setIsFormOpen(true)
  }

  const handleSubmitReservation = async (data: ReservationData) => {
    if (!user || !userData) {
      throw new Error("Usuario no autenticado")
    }

    try {
      await crearReserva({
        equipoId: data.equipmentId,
        equipoNombre: data.equipmentName,
        equipoImagen: selectedEquipment?.imagen || "/placeholder.svg",
        usuarioId: user.uid,
        usuarioNombre: `${userData.nombre} ${userData.apellido}`,
        usuarioEmail: userData.email,
        cantidad: data.cantidad,
        fechaReserva: data.fecha,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        proposito: data.proposito,
        ubicacion: selectedEquipment?.ubicacion || "",
        categoria: selectedEquipment?.categoria || "",
      })

      // Refresh equipments to show updated availability
      const equipos = await obtenerEquipos()
      setEquipments(equipos.map(mapEquipoToEquipment))
      
      alert("Reserva creada exitosamente. Puedes ver el estado en Mis Reservas.")
    } catch (err) {
      console.error("Error creating reservation:", err)
      throw err
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    )
  }

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
            {equipments.length === 0 
              ? "No hay equipos registrados en el sistema aun."
              : "Intenta ajustar los filtros o la busqueda"
            }
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
