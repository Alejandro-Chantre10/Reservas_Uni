"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Monitor, 
  Microscope, 
  Cpu, 
  Wrench,
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  LayoutDashboard,
  Package,
  Calendar,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  X,
  Upload,
  AlertCircle,
  CheckCircle2,
  Menu,
  Bell,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/lib/auth-context"
import { 
  obtenerEquipos, 
  crearEquipo, 
  actualizarEquipo, 
  eliminarEquipo,
  subirImagenEquipo,
  type Equipo 
} from "@/lib/firestore-services"

interface Equipment {
  id: string
  name: string
  description: string
  category: "audiovisual" | "laboratorio" | "computo" | "herramientas"
  quantity: number
  available: number
  location: string
  image: string
  status: "disponible" | "mantenimiento" | "agotado"
}

const categoryConfig = {
  audiovisual: { label: "Audiovisual", icon: Monitor, color: "bg-blue-100 text-blue-700" },
  laboratorio: { label: "Laboratorio", icon: Microscope, color: "bg-green-100 text-green-700" },
  computo: { label: "Computo", icon: Cpu, color: "bg-purple-100 text-purple-700" },
  herramientas: { label: "Herramientas", icon: Wrench, color: "bg-orange-100 text-orange-700" },
}

const statusConfig = {
  disponible: { label: "Disponible", color: "bg-emerald-100 text-emerald-700" },
  mantenimiento: { label: "En Mantenimiento", color: "bg-amber-100 text-amber-700" },
  agotado: { label: "Agotado", color: "bg-red-100 text-red-700" },
}

function mapEquipoToEquipment(equipo: Equipo): Equipment {
  return {
    id: equipo.id || "",
    name: equipo.nombre,
    description: equipo.descripcion,
    category: equipo.categoria,
    quantity: equipo.cantidad,
    available: equipo.disponibles,
    location: equipo.ubicacion,
    image: equipo.imagen || "/placeholder.svg",
    status: equipo.estado,
  }
}

function mapEquipmentToEquipo(equipment: Partial<Equipment>): Omit<Equipo, "id" | "createdAt" | "updatedAt"> {
  return {
    nombre: equipment.name || "",
    descripcion: equipment.description || "",
    categoria: equipment.category || "audiovisual",
    cantidad: equipment.quantity || 1,
    disponibles: equipment.available || 1,
    ubicacion: equipment.location || "",
    imagen: equipment.image || "/placeholder.svg",
    estado: equipment.status || "disponible",
  }
}

function AdminDashboardContent() {
  const { userData, signOut } = useAuth()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [formData, setFormData] = useState<Partial<Equipment>>({
    name: "",
    description: "",
    category: "audiovisual",
    quantity: 1,
    available: 1,
    location: "",
    image: "/placeholder.svg",
    status: "disponible",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadEquipment() {
      try {
        setLoading(true)
        const equipos = await obtenerEquipos()
        setEquipment(equipos.map(mapEquipoToEquipment))
      } catch (err) {
        console.error("Error loading equipment:", err)
      } finally {
        setLoading(false)
      }
    }

    loadEquipment()
  }, [])

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = {
    total: equipment.length,
    disponible: equipment.filter(e => e.status === "disponible").length,
    mantenimiento: equipment.filter(e => e.status === "mantenimiento").length,
    agotado: equipment.filter(e => e.status === "agotado").length,
  }

  const handleCreate = async () => {
    try {
      setSubmitting(true)
      const equipoData = mapEquipmentToEquipo(formData)
      const newId = await crearEquipo(equipoData)
      setEquipment([...equipment, { ...formData, id: newId } as Equipment])
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error("Error creating equipment:", err)
      alert("Error al crear el equipo. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedEquipment) return
    try {
      setSubmitting(true)
      const equipoData = mapEquipmentToEquipo(formData)
      await actualizarEquipo(selectedEquipment.id, equipoData)
      setEquipment(equipment.map(item => 
        item.id === selectedEquipment.id 
          ? { ...item, ...formData } as Equipment
          : item
      ))
      setIsEditDialogOpen(false)
      setSelectedEquipment(null)
      resetForm()
    } catch (err) {
      console.error("Error updating equipment:", err)
      alert("Error al actualizar el equipo. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedEquipment) return
    try {
      setSubmitting(true)
      await eliminarEquipo(selectedEquipment.id)
      setEquipment(equipment.filter(item => item.id !== selectedEquipment.id))
      setIsDeleteDialogOpen(false)
      setSelectedEquipment(null)
    } catch (err) {
      console.error("Error deleting equipment:", err)
      alert("Error al eliminar el equipo. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (item: Equipment) => {
    setSelectedEquipment(item)
    setFormData(item)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (item: Equipment) => {
    setSelectedEquipment(item)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "audiovisual",
      quantity: 1,
      available: 1,
      location: "",
      image: "/placeholder.svg",
      status: "disponible",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col fixed h-full z-40`}>
        <div className="p-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Package className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">UniReservas</h1>
                <p className="text-xs text-sidebar-foreground/70">Panel Admin</p>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <LayoutDashboard className="w-5 h-5" />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link 
            href="/admin" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
          >
            <Package className="w-5 h-5" />
            {sidebarOpen && <span>Equipos</span>}
          </Link>
          <Link 
            href="/admin/reservas" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            {sidebarOpen && <span>Reservas</span>}
          </Link>
          <Link 
            href="/admin/usuarios" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
          >
            <Users className="w-5 h-5" />
            {sidebarOpen && <span>Usuarios</span>}
          </Link>
          <Link 
            href="/admin/configuracion" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors"
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span>Configuracion</span>}
          </Link>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Link 
            href="/login" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors text-red-400"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Cerrar Sesion</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-20"} transition-all duration-300`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Gestion de Equipos</h1>
                <p className="text-sm text-muted-foreground">Administra el inventario de equipos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                      A
                    </div>
                    <span className="hidden md:block">Admin</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Mi Perfil</DropdownMenuItem>
                  <DropdownMenuItem>Configuracion</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Cerrar Sesion</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Equipos</p>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Disponibles</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.disponible}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Mantenimiento</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.mantenimiento}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Agotados</p>
                    <p className="text-2xl font-bold text-red-600">{stats.agotado}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Inventario de Equipos</CardTitle>
                  <CardDescription>Gestiona todos los equipos disponibles para reserva</CardDescription>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Agregar Equipo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar equipos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="audiovisual">Audiovisual</SelectItem>
                      <SelectItem value="laboratorio">Laboratorio</SelectItem>
                      <SelectItem value="computo">Computo</SelectItem>
                      <SelectItem value="herramientas">Herramientas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="agotado">Agotado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Equipment Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[300px]">Equipo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-center">Disponibles</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Ubicacion</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEquipment.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No se encontraron equipos
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEquipment.map((item) => {
                        const CategoryIcon = categoryConfig[item.category].icon
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                  <CategoryIcon className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{item.name}</p>
                                  <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={categoryConfig[item.category].color}>
                                {categoryConfig[item.category].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                            <TableCell className="text-center">
                              <span className={item.available === 0 ? "text-red-600 font-medium" : "text-foreground"}>
                                {item.available}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={statusConfig[item.status].color}>
                                {statusConfig[item.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{item.location}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(item)}
                                  className="h-8 w-8"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteDialog(item)}
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
          setSelectedEquipment(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Editar Equipo" : "Agregar Nuevo Equipo"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen 
                ? "Modifica la informacion del equipo seleccionado" 
                : "Completa el formulario para agregar un nuevo equipo al inventario"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Equipo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Proyector Epson"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value as Equipment["category"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="audiovisual">Audiovisual</SelectItem>
                    <SelectItem value="laboratorio">Laboratorio</SelectItem>
                    <SelectItem value="computo">Computo</SelectItem>
                    <SelectItem value="herramientas">Herramientas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe las caracteristicas del equipo..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad Total</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="available">Disponibles</Label>
                <Input
                  id="available"
                  type="number"
                  min={0}
                  max={formData.quantity}
                  value={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value as Equipment["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="mantenimiento">En Mantenimiento</SelectItem>
                    <SelectItem value="agotado">Agotado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicacion</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ej: Almacen A - Estante 1"
              />
            </div>

            <div className="space-y-2">
              <Label>Imagen del Equipo</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Arrastra una imagen o haz clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG hasta 5MB
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false)
              setIsEditDialogOpen(false)
              resetForm()
            }}>
              Cancelar
            </Button>
            <Button onClick={isEditDialogOpen ? handleEdit : handleCreate}>
              {isEditDialogOpen ? "Guardar Cambios" : "Agregar Equipo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Confirmar Eliminacion
            </DialogTitle>
            <DialogDescription>
              ¿Estas seguro de que deseas eliminar <span className="font-medium text-foreground">{selectedEquipment?.name}</span>? 
              Esta accion no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AuthGuard requireAdmin>
      <AdminDashboardContent />
    </AuthGuard>
  )
}
