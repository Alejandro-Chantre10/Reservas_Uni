"use client"

import { useState, useEffect } from "react"
import { LaboratoryCard } from "@/components/laboratory-card"
import { LaboratoryReservationForm } from "@/components/laboratory-reservation-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, Building2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  type Laboratorio, 
  type TipoLaboratorio,
  obtenerLaboratorios,
  laboratoriosIniciales 
} from "@/lib/firestore-services"

const tiposLaboratorio: { value: TipoLaboratorio; label: string }[] = [
  { value: "computacion", label: "Computacion" },
  { value: "quimica", label: "Quimica" },
  { value: "fisica", label: "Fisica" },
  { value: "biologia", label: "Biologia" },
  { value: "electronica", label: "Electronica" },
  { value: "robotica", label: "Robotica" },
  { value: "idiomas", label: "Idiomas" },
  { value: "multimedia", label: "Multimedia" },
]

export function LaboratoryGrid() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<TipoLaboratorio[]>([])
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)
  const [selectedLaboratory, setSelectedLaboratory] = useState<Laboratorio | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [laboratories, setLaboratories] = useState<Laboratorio[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadLaboratories = async () => {
      setIsLoading(true)
      try {
        const data = await obtenerLaboratorios()
        if (data.length > 0) {
          setLaboratories(data)
        } else {
          // Usar datos mock si no hay datos en Firebase
          setLaboratories(laboratoriosIniciales.map((lab, index) => ({
            ...lab,
            id: `mock-${index}`,
          })))
        }
      } catch (error) {
        console.log("[v0] Error loading laboratories, using mock data:", error)
        // Usar datos mock en caso de error
        setLaboratories(laboratoriosIniciales.map((lab, index) => ({
          ...lab,
          id: `mock-${index}`,
        })))
      } finally {
        setIsLoading(false)
      }
    }

    loadLaboratories()
  }, [])

  const filteredLaboratories = laboratories.filter((lab) => {
    const matchesSearch =
      lab.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.edificio.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(lab.tipo)
    
    const matchesAvailability = !showOnlyAvailable || lab.estado === "disponible"

    return matchesSearch && matchesType && matchesAvailability
  })

  const handleReservar = (laboratory: Laboratorio) => {
    setSelectedLaboratory(laboratory)
    setIsFormOpen(true)
  }

  const toggleType = (type: TipoLaboratorio) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTypes([])
    setShowOnlyAvailable(false)
  }

  const hasActiveFilters = searchQuery || selectedTypes.length > 0 || showOnlyAvailable

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Cargando laboratorios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar laboratorios..."
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
                {(selectedTypes.length > 0 || showOnlyAvailable) && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                    {selectedTypes.length + (showOnlyAvailable ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tipo de Laboratorio</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tiposLaboratorio.map((tipo) => (
                <DropdownMenuCheckboxItem
                  key={tipo.value}
                  checked={selectedTypes.includes(tipo.value)}
                  onCheckedChange={() => toggleType(tipo.value)}
                >
                  {tipo.label}
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

      {selectedTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTypes.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="cursor-pointer gap-1"
              onClick={() => toggleType(type)}
            >
              {tiposLaboratorio.find((t) => t.value === type)?.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        {filteredLaboratories.length} laboratorio{filteredLaboratories.length !== 1 ? "s" : ""} encontrado{filteredLaboratories.length !== 1 ? "s" : ""}
      </div>

      {filteredLaboratories.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredLaboratories.map((laboratory) => (
            <LaboratoryCard
              key={laboratory.id}
              laboratory={laboratory}
              onReservar={handleReservar}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Building2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No se encontraron laboratorios</h3>
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

      <LaboratoryReservationForm
        laboratory={selectedLaboratory}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  )
}
