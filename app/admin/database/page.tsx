"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FlaskConical,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  crearLaboratorio,
  laboratoriosIniciales,
  obtenerLaboratorios,
  eliminarLaboratorio,
  type Laboratorio,
} from "@/lib/firestore-services";
import Link from "next/link";

export default function DatabaseAdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [loadingLabs, setLoadingLabs] = useState(false);

  const inicializarBaseDeDatos = async () => {
    setLoading(true);
    setMessage(null);

    try {
      let creados = 0;
      for (const lab of laboratoriosIniciales) {
        await crearLaboratorio(lab);
        creados++;
      }

      setMessage({
        type: "success",
        text: `Base de datos inicializada correctamente. Se crearon ${creados} laboratorios.`,
      });

      // Recargar laboratorios
      await cargarLaboratorios();
    } catch (error) {
      console.error("Error al inicializar:", error);
      setMessage({
        type: "error",
        text: `Error al inicializar la base de datos: ${error instanceof Error ? error.message : "Error desconocido"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarLaboratorios = async () => {
    setLoadingLabs(true);
    try {
      const labs = await obtenerLaboratorios();
      setLaboratorios(labs);
    } catch (error) {
      console.error("Error al cargar laboratorios:", error);
      setMessage({
        type: "error",
        text: `Error al cargar laboratorios: ${error instanceof Error ? error.message : "Error desconocido"}`,
      });
    } finally {
      setLoadingLabs(false);
    }
  };

  const eliminarTodosLosLaboratorios = async () => {
    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar TODOS los laboratorios? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      for (const lab of laboratorios) {
        if (lab.id) {
          await eliminarLaboratorio(lab.id);
        }
      }

      setMessage({
        type: "success",
        text: `Se eliminaron ${laboratorios.length} laboratorios correctamente.`,
      });

      setLaboratorios([]);
    } catch (error) {
      console.error("Error al eliminar:", error);
      setMessage({
        type: "error",
        text: `Error al eliminar laboratorios: ${error instanceof Error ? error.message : "Error desconocido"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Volver al inicio
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Database className="h-8 w-8" />
            Administración de Base de Datos
          </h1>
          <p className="text-muted-foreground mt-2">
            Inicializa y gestiona la base de datos de laboratorios en Firebase
            Firestore
          </p>
        </div>

        {message && (
          <Alert
            className={`mb-6 ${message.type === "success" ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950"}`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertTitle>
              {message.type === "success" ? "Éxito" : "Error"}
            </AlertTitle>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Inicializar Laboratorios
              </CardTitle>
              <CardDescription>
                Crea los {laboratoriosIniciales.length} laboratorios de ejemplo
                en la base de datos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Se crearán los siguientes laboratorios:</p>
                <ul className="list-disc list-inside space-y-1">
                  {laboratoriosIniciales.map((lab, index) => (
                    <li key={index}>
                      {lab.nombre} ({lab.tipo})
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={inicializarBaseDeDatos}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inicializando...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Inicializar Base de Datos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Laboratorios Actuales
              </CardTitle>
              <CardDescription>
                Verifica los laboratorios existentes en la base de datos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={cargarLaboratorios}
                disabled={loadingLabs}
                variant="outline"
                className="w-full"
              >
                {loadingLabs ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Cargar Laboratorios
                  </>
                )}
              </Button>

              {laboratorios.length > 0 && (
                <>
                  <div className="max-h-48 overflow-y-auto rounded-md border p-3">
                    <p className="text-sm font-medium mb-2">
                      {laboratorios.length} laboratorio(s) encontrado(s):
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {laboratorios.map((lab) => (
                        <li
                          key={lab.id}
                          className="flex items-center justify-between"
                        >
                          <span>{lab.nombre}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              lab.estado === "disponible"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : lab.estado === "mantenimiento"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {lab.estado}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={eliminarTodosLosLaboratorios}
                    disabled={loading}
                    variant="destructive"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar Todos los Laboratorios
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Estructura de la Base de Datos</CardTitle>
            <CardDescription>
              Colecciones y documentos en Firebase Firestore
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  Colección: laboratorios
                </h3>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {`{
  id: string,
  nombre: string,
  descripcion: string,
  tipo: "computacion" | "quimica" | ...,
  capacidad: number,
  edificio: string,
  piso: string,
  numeroSala: string,
  imagen: string,
  amenidades: string[],
  horariosDisponibles: [{
    dia: string,
    horaInicio: string,
    horaFin: string
  }],
  estado: "disponible" | "mantenimiento" | "ocupado",
  responsable: string,
  contacto: string,
  createdAt: timestamp,
  updatedAt: timestamp
}`}
                </pre>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Colección: reservas
                </h3>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {`{
  id: string,
  laboratorioId: string,
  laboratorioNombre: string,
  ubicacion: string,
  usuarioId: string,
  usuarioNombre: string,
  usuarioEmail: string,
  fechaReserva: timestamp,
  horaInicio: string,
  horaFin: string,
  proposito: string,
  numeroParticipantes: number,
  estado: "pendiente" | "aprobada" | ...,
  codigo: string,
  tipoLaboratorio: string,
  createdAt: timestamp,
  updatedAt: timestamp
}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
