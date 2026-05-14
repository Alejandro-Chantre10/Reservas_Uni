import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase-config";

// ==================== TIPOS ====================

export type TipoLaboratorio = 
  | "computacion"
  | "quimica"
  | "fisica"
  | "biologia"
  | "electronica"
  | "robotica"
  | "idiomas"
  | "multimedia";

export type Amenidad =
  | "proyector"
  | "aire_acondicionado"
  | "wifi"
  | "computadoras"
  | "pizarra_digital"
  | "equipo_especializado"
  | "ventilacion"
  | "microscopios"
  | "impresora_3d";

export interface HorarioDisponible {
  dia: "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado";
  horaInicio: string;
  horaFin: string;
}

export interface Laboratorio {
  id?: string;
  nombre: string;
  descripcion: string;
  tipo: TipoLaboratorio;
  capacidad: number;
  edificio: string;
  piso: string;
  numeroSala: string;
  imagen: string;
  amenidades: Amenidad[];
  horariosDisponibles: HorarioDisponible[];
  estado: "disponible" | "mantenimiento" | "ocupado";
  responsable: string;
  contacto: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReservaLaboratorio {
  id?: string;
  laboratorioId: string;
  laboratorioNombre: string;
  laboratorioImagen: string;
  ubicacion: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  fechaReserva: Date;
  horaInicio: string;
  horaFin: string;
  proposito: string;
  numeroParticipantes: number;
  estado: "pendiente" | "aprobada" | "rechazada" | "en_uso" | "completada" | "cancelada";
  mensajeRechazo?: string;
  codigo: string;
  tipoLaboratorio: TipoLaboratorio;
  createdAt?: Date;
  updatedAt?: Date;
}

// ==================== LABORATORIOS ====================

const laboratoriosCollection = collection(db, "laboratorios");

// Crear laboratorio
export async function crearLaboratorio(
  laboratorio: Omit<Laboratorio, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(laboratoriosCollection, {
    ...laboratorio,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Obtener todos los laboratorios
export async function obtenerLaboratorios(): Promise<Laboratorio[]> {
  const querySnapshot = await getDocs(
    query(laboratoriosCollection, orderBy("createdAt", "desc"))
  );
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Laboratorio[];
}

// Obtener laboratorio por ID
export async function obtenerLaboratorioPorId(id: string): Promise<Laboratorio | null> {
  const docRef = doc(db, "laboratorios", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as Laboratorio;
  }
  return null;
}

// Obtener laboratorios por tipo
export async function obtenerLaboratoriosPorTipo(
  tipo: TipoLaboratorio
): Promise<Laboratorio[]> {
  const q = query(laboratoriosCollection, where("tipo", "==", tipo));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Laboratorio[];
}

// Obtener laboratorios disponibles
export async function obtenerLaboratoriosDisponibles(): Promise<Laboratorio[]> {
  const q = query(laboratoriosCollection, where("estado", "==", "disponible"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Laboratorio[];
}

// Actualizar laboratorio
export async function actualizarLaboratorio(
  id: string,
  datos: Partial<Omit<Laboratorio, "id" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, "laboratorios", id);
  await updateDoc(docRef, {
    ...datos,
    updatedAt: serverTimestamp(),
  });
}

// Eliminar laboratorio
export async function eliminarLaboratorio(id: string): Promise<void> {
  const docRef = doc(db, "laboratorios", id);
  await deleteDoc(docRef);
}

// ==================== RESERVAS ====================

const reservasCollection = collection(db, "reservas");

// Generar codigo de reserva
function generarCodigoReserva(): string {
  const fecha = new Date();
  const year = fecha.getFullYear().toString().slice(-2);
  const month = (fecha.getMonth() + 1).toString().padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LAB-${year}${month}-${random}`;
}

// Crear reserva de laboratorio
export async function crearReservaLaboratorio(
  reserva: Omit<ReservaLaboratorio, "id" | "codigo" | "estado" | "createdAt" | "updatedAt">
): Promise<string> {
  const codigo = generarCodigoReserva();

  const docRef = await addDoc(reservasCollection, {
    ...reserva,
    codigo,
    estado: "pendiente",
    fechaReserva: Timestamp.fromDate(reserva.fechaReserva),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

// Verificar disponibilidad de laboratorio
export async function verificarDisponibilidad(
  laboratorioId: string,
  fecha: Date,
  horaInicio: string,
  horaFin: string
): Promise<boolean> {
  const fechaInicio = new Date(fecha);
  fechaInicio.setHours(0, 0, 0, 0);
  const fechaFin = new Date(fecha);
  fechaFin.setHours(23, 59, 59, 999);

  const q = query(
    reservasCollection,
    where("laboratorioId", "==", laboratorioId),
    where("fechaReserva", ">=", Timestamp.fromDate(fechaInicio)),
    where("fechaReserva", "<=", Timestamp.fromDate(fechaFin)),
    where("estado", "in", ["pendiente", "aprobada", "en_uso"])
  );

  const querySnapshot = await getDocs(q);
  
  // Verificar si hay conflicto de horarios
  for (const doc of querySnapshot.docs) {
    const reserva = doc.data();
    const reservaInicio = reserva.horaInicio;
    const reservaFin = reserva.horaFin;

    // Verificar si hay superposicion de horarios
    if (
      (horaInicio >= reservaInicio && horaInicio < reservaFin) ||
      (horaFin > reservaInicio && horaFin <= reservaFin) ||
      (horaInicio <= reservaInicio && horaFin >= reservaFin)
    ) {
      return false;
    }
  }

  return true;
}

// Obtener reservas de un laboratorio para una fecha
export async function obtenerReservasLaboratorioPorFecha(
  laboratorioId: string,
  fecha: Date
): Promise<ReservaLaboratorio[]> {
  const fechaInicio = new Date(fecha);
  fechaInicio.setHours(0, 0, 0, 0);
  const fechaFin = new Date(fecha);
  fechaFin.setHours(23, 59, 59, 999);

  const q = query(
    reservasCollection,
    where("laboratorioId", "==", laboratorioId),
    where("fechaReserva", ">=", Timestamp.fromDate(fechaInicio)),
    where("fechaReserva", "<=", Timestamp.fromDate(fechaFin)),
    where("estado", "in", ["pendiente", "aprobada", "en_uso"])
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      fechaReserva: data.fechaReserva?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  }) as ReservaLaboratorio[];
}

// Obtener todas las reservas (admin)
export async function obtenerTodasLasReservas(): Promise<ReservaLaboratorio[]> {
  const querySnapshot = await getDocs(
    query(reservasCollection, orderBy("createdAt", "desc"))
  );
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      fechaReserva: data.fechaReserva?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  }) as ReservaLaboratorio[];
}

// Obtener reservas de un usuario
export async function obtenerReservasUsuario(usuarioId: string): Promise<ReservaLaboratorio[]> {
  const q = query(
    reservasCollection,
    where("usuarioId", "==", usuarioId),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      fechaReserva: data.fechaReserva?.toDate(),
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    };
  }) as ReservaLaboratorio[];
}

// Actualizar estado de reserva
export async function actualizarEstadoReserva(
  id: string,
  estado: ReservaLaboratorio["estado"],
  mensajeRechazo?: string
): Promise<void> {
  const docRef = doc(db, "reservas", id);
  const updateData: Record<string, unknown> = {
    estado,
    updatedAt: serverTimestamp(),
  };

  if (mensajeRechazo) {
    updateData.mensajeRechazo = mensajeRechazo;
  }

  await updateDoc(docRef, updateData);
}

// Cancelar reserva
export async function cancelarReserva(id: string): Promise<void> {
  await actualizarEstadoReserva(id, "cancelada");
}

// ==================== STORAGE ====================

// Subir imagen de laboratorio
export async function subirImagenLaboratorio(
  archivo: File,
  laboratorioId: string
): Promise<string> {
  const extension = archivo.name.split(".").pop();
  const nombreArchivo = `laboratorios/${laboratorioId}_${Date.now()}.${extension}`;
  const storageRef = ref(storage, nombreArchivo);

  await uploadBytes(storageRef, archivo);
  const url = await getDownloadURL(storageRef);
  return url;
}

// ==================== ESTADISTICAS ====================

export async function obtenerEstadisticasLaboratorios(): Promise<{
  total: number;
  disponibles: number;
  mantenimiento: number;
  ocupados: number;
  porTipo: Record<string, number>;
}> {
  const laboratorios = await obtenerLaboratorios();

  const porTipo: Record<string, number> = {
    computacion: 0,
    quimica: 0,
    fisica: 0,
    biologia: 0,
    electronica: 0,
    robotica: 0,
    idiomas: 0,
    multimedia: 0,
  };

  laboratorios.forEach((lab) => {
    if (porTipo[lab.tipo] !== undefined) {
      porTipo[lab.tipo]++;
    }
  });

  return {
    total: laboratorios.length,
    disponibles: laboratorios.filter((l) => l.estado === "disponible").length,
    mantenimiento: laboratorios.filter((l) => l.estado === "mantenimiento").length,
    ocupados: laboratorios.filter((l) => l.estado === "ocupado").length,
    porTipo,
  };
}

export async function obtenerEstadisticasReservas(usuarioId?: string): Promise<{
  total: number;
  pendientes: number;
  aprobadas: number;
  enUso: number;
  completadas: number;
  canceladas: number;
  rechazadas: number;
}> {
  const reservas = usuarioId
    ? await obtenerReservasUsuario(usuarioId)
    : await obtenerTodasLasReservas();

  return {
    total: reservas.length,
    pendientes: reservas.filter((r) => r.estado === "pendiente").length,
    aprobadas: reservas.filter((r) => r.estado === "aprobada").length,
    enUso: reservas.filter((r) => r.estado === "en_uso").length,
    completadas: reservas.filter((r) => r.estado === "completada").length,
    canceladas: reservas.filter((r) => r.estado === "cancelada").length,
    rechazadas: reservas.filter((r) => r.estado === "rechazada").length,
  };
}

// ==================== DATOS INICIALES ====================

export const laboratoriosIniciales: Omit<Laboratorio, "id" | "createdAt" | "updatedAt">[] = [
  {
    nombre: "Laboratorio de Computacion A",
    descripcion: "Laboratorio equipado con 30 computadoras de ultima generacion para practicas de programacion y desarrollo de software.",
    tipo: "computacion",
    capacidad: 30,
    edificio: "Edificio de Ingenieria",
    piso: "2",
    numeroSala: "A-201",
    imagen: "/placeholder.svg",
    amenidades: ["proyector", "aire_acondicionado", "wifi", "computadoras", "pizarra_digital"],
    horariosDisponibles: [
      { dia: "lunes", horaInicio: "07:00", horaFin: "21:00" },
      { dia: "martes", horaInicio: "07:00", horaFin: "21:00" },
      { dia: "miercoles", horaInicio: "07:00", horaFin: "21:00" },
      { dia: "jueves", horaInicio: "07:00", horaFin: "21:00" },
      { dia: "viernes", horaInicio: "07:00", horaFin: "21:00" },
      { dia: "sabado", horaInicio: "08:00", horaFin: "14:00" },
    ],
    estado: "disponible",
    responsable: "Ing. Carlos Rodriguez",
    contacto: "carlos.rodriguez@universidad.edu",
  },
  {
    nombre: "Laboratorio de Quimica General",
    descripcion: "Laboratorio para practicas de quimica general con mesas de trabajo, campanas de extraccion y equipos de seguridad.",
    tipo: "quimica",
    capacidad: 24,
    edificio: "Edificio de Ciencias",
    piso: "1",
    numeroSala: "B-105",
    imagen: "/placeholder.svg",
    amenidades: ["ventilacion", "equipo_especializado", "wifi"],
    horariosDisponibles: [
      { dia: "lunes", horaInicio: "08:00", horaFin: "18:00" },
      { dia: "martes", horaInicio: "08:00", horaFin: "18:00" },
      { dia: "miercoles", horaInicio: "08:00", horaFin: "18:00" },
      { dia: "jueves", horaInicio: "08:00", horaFin: "18:00" },
      { dia: "viernes", horaInicio: "08:00", horaFin: "18:00" },
    ],
    estado: "disponible",
    responsable: "Dra. Maria Lopez",
    contacto: "maria.lopez@universidad.edu",
  },
  {
    nombre: "Laboratorio de Fisica Experimental",
    descripcion: "Laboratorio equipado para experimentos de mecanica, termodinamica, optica y electromagnetismo.",
    tipo: "fisica",
    capacidad: 20,
    edificio: "Edificio de Ciencias",
    piso: "2",
    numeroSala: "B-203",
    imagen: "/placeholder.svg",
    amenidades: ["proyector", "equipo_especializado", "wifi", "aire_acondicionado"],
    horariosDisponibles: [
      { dia: "lunes", horaInicio: "07:00", horaFin: "20:00" },
      { dia: "martes", horaInicio: "07:00", horaFin: "20:00" },
      { dia: "miercoles", horaInicio: "07:00", horaFin: "20:00" },
      { dia: "jueves", horaInicio: "07:00", horaFin: "20:00" },
      { dia: "viernes", horaInicio: "07:00", horaFin: "20:00" },
    ],
    estado: "disponible",
    responsable: "Dr. Pedro Sanchez",
    contacto: "pedro.sanchez@universidad.edu",
  },
  {
    nombre: "Laboratorio de Biologia Molecular",
    descripcion: "Laboratorio con microscopios de alta resolucion, centrifugas y equipos para analisis de ADN y cultivos celulares.",
    tipo: "biologia",
    capacidad: 16,
    edificio: "Edificio de Ciencias de la Vida",
    piso: "3",
    numeroSala: "C-301",
    imagen: "/placeholder.svg",
    amenidades: ["microscopios", "equipo_especializado", "aire_acondicionado", "wifi"],
    horariosDisponibles: [
      { dia: "lunes", horaInicio: "08:00", horaFin: "17:00" },
      { dia: "martes", horaInicio: "08:00", horaFin: "17:00" },
      { dia: "miercoles", horaInicio: "08:00", horaFin: "17:00" },
      { dia: "jueves", horaInicio: "08:00", horaFin: "17:00" },
      { dia: "viernes", horaInicio: "08:00", horaFin: "17:00" },
    ],
    estado: "disponible",
    responsable: "Dra. Ana Martinez",
    contacto: "ana.martinez@universidad.edu",
  },
  {
    nombre: "Laboratorio de Electronica",
    descripcion: "Laboratorio con osciloscopios, generadores de funciones, fuentes de poder y componentes electronicos para practicas.",
    tipo: "electronica",
    capacidad: 25,
    edificio: "Edificio de Ingenieria",
    piso: "3",
    numeroSala: "A-302",
    imagen: "/placeholder.svg",
    amenidades: ["equipo_especializado", "aire_acondicionado", "wifi", "proyector"],
    horariosDisponibles: [
      { dia: "lunes", horaInicio: "07:00", horaFin: "21:00" },
      { dia: "martes", horaInicio: "07:00", horaFin: "21:00" },
      { dia: "miercoles", horaInicio: "07:00", horaFin: "21:00" },
      { dia: "jueves", horaInicio: "07:00", horaFin: "21:00" },
      { dia: "viernes", horaInicio: "07:00", horaFin: "21:00" },
      { dia: "sabado", horaInicio: "08:00", horaFin: "14:00" },
    ],
    estado: "disponible",
    responsable: "Ing. Roberto Gomez",
    contacto: "roberto.gomez@universidad.edu",
  },
  {
    nombre: "Laboratorio de Robotica e IA",
    descripcion: "Laboratorio con kits de robotica, impresoras 3D, brazos roboticos y estaciones de trabajo para inteligencia artificial.",
    tipo: "robotica",
    capacidad: 20,
    edificio: "Edificio de Ingenieria",
    piso: "4",
    numeroSala: "A-401",
    imagen: "/placeholder.svg",
    amenidades: ["impresora_3d", "computadoras", "wifi", "aire_acondicionado", "proyector"],
    horariosDisponibles: [
      { dia: "lunes", horaInicio: "08:00", horaFin: "20:00" },
      { dia: "martes", horaInicio: "08:00", horaFin: "20:00" },
      { dia: "miercoles", horaInicio: "08:00", horaFin: "20:00" },
      { dia: "jueves", horaInicio: "08:00", horaFin: "20:00" },
      { dia: "viernes", horaInicio: "08:00", horaFin: "20:00" },
    ],
    estado: "mantenimiento",
    responsable: "Ing. Laura Fernandez",
    contacto: "laura.fernandez@universidad.edu",
  },
  {
    nombre: "Laboratorio de Idiomas",
    descripcion: "Laboratorio multimedia con cabinas individuales, audio profesional y software para aprendizaje de idiomas.",
    tipo: "idiomas",
    capacidad: 35,
    edificio: "Edificio de Humanidades",
    piso: "1",
    numeroSala: "D-102",
    imagen: "/placeholder.svg",
    amenidades: ["computadoras", "aire_acondicionado", "wifi"],
    horariosDisponibles: [
      { dia: "lunes", horaInicio: "07:00", horaFin: "21:00" },
      { dia: "martes", horaInicio: "07:00", horaFin: "21:00" },
      { dia: "miercoles", horaInicio: "07:00", horaFin: "21:00" },
      { dia: "jueves", horaInicio: "07:00", horaFin: "21:00" },
      { dia: "viernes", horaInicio: "07:00", horaFin: "21:00" },
      { dia: "sabado", horaInicio: "08:00", horaFin: "13:00" },
    ],
    estado: "disponible",
    responsable: "Lic. Carmen Ruiz",
    contacto: "carmen.ruiz@universidad.edu",
  },
  {
    nombre: "Laboratorio Multimedia",
    descripcion: "Estudio de produccion audiovisual con camaras profesionales, iluminacion, pantalla verde y edicion de video.",
    tipo: "multimedia",
    capacidad: 15,
    edificio: "Edificio de Comunicaciones",
    piso: "2",
    numeroSala: "E-201",
    imagen: "/placeholder.svg",
    amenidades: ["equipo_especializado", "computadoras", "aire_acondicionado", "wifi"],
    horariosDisponibles: [
      { dia: "lunes", horaInicio: "09:00", horaFin: "19:00" },
      { dia: "martes", horaInicio: "09:00", horaFin: "19:00" },
      { dia: "miercoles", horaInicio: "09:00", horaFin: "19:00" },
      { dia: "jueves", horaInicio: "09:00", horaFin: "19:00" },
      { dia: "viernes", horaInicio: "09:00", horaFin: "19:00" },
    ],
    estado: "disponible",
    responsable: "Lic. Miguel Torres",
    contacto: "miguel.torres@universidad.edu",
  },
];
