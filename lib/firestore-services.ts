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

export interface Equipo {
  id?: string;
  nombre: string;
  descripcion: string;
  categoria: "audiovisual" | "laboratorio" | "computo" | "herramientas";
  cantidad: number;
  disponibles: number;
  estado: "disponible" | "mantenimiento" | "agotado";
  ubicacion: string;
  imagen: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Reserva {
  id?: string;
  equipoId: string;
  equipoNombre: string;
  equipoImagen: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  cantidad: number;
  fechaReserva: Date;
  horaInicio: string;
  horaFin: string;
  proposito: string;
  estado: "pendiente" | "aprobada" | "rechazada" | "en_uso" | "completada" | "cancelada";
  mensajeRechazo?: string;
  codigo: string;
  ubicacion: string;
  categoria: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ==================== EQUIPOS ====================

const equiposCollection = collection(db, "equipos");

// Crear equipo
export async function crearEquipo(equipo: Omit<Equipo, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const docRef = await addDoc(equiposCollection, {
    ...equipo,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Obtener todos los equipos
export async function obtenerEquipos(): Promise<Equipo[]> {
  const querySnapshot = await getDocs(
    query(equiposCollection, orderBy("createdAt", "desc"))
  );
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Equipo[];
}

// Obtener equipo por ID
export async function obtenerEquipoPorId(id: string): Promise<Equipo | null> {
  const docRef = doc(db, "equipos", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    } as Equipo;
  }
  return null;
}

// Obtener equipos por categoria
export async function obtenerEquiposPorCategoria(
  categoria: Equipo["categoria"]
): Promise<Equipo[]> {
  const q = query(equiposCollection, where("categoria", "==", categoria));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Equipo[];
}

// Actualizar equipo
export async function actualizarEquipo(
  id: string,
  datos: Partial<Omit<Equipo, "id" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, "equipos", id);
  await updateDoc(docRef, {
    ...datos,
    updatedAt: serverTimestamp(),
  });
}

// Eliminar equipo
export async function eliminarEquipo(id: string): Promise<void> {
  const docRef = doc(db, "equipos", id);
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
  return `RES-${year}${month}-${random}`;
}

// Crear reserva
export async function crearReserva(
  reserva: Omit<Reserva, "id" | "codigo" | "estado" | "createdAt" | "updatedAt">
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

  // Actualizar disponibilidad del equipo
  const equipoRef = doc(db, "equipos", reserva.equipoId);
  const equipoSnap = await getDoc(equipoRef);
  if (equipoSnap.exists()) {
    const equipoData = equipoSnap.data();
    await updateDoc(equipoRef, {
      disponibles: Math.max(0, equipoData.disponibles - reserva.cantidad),
      updatedAt: serverTimestamp(),
    });
  }

  return docRef.id;
}

// Obtener todas las reservas (admin)
export async function obtenerTodasLasReservas(): Promise<Reserva[]> {
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
  }) as Reserva[];
}

// Obtener reservas de un usuario
export async function obtenerReservasUsuario(usuarioId: string): Promise<Reserva[]> {
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
  }) as Reserva[];
}

// Actualizar estado de reserva
export async function actualizarEstadoReserva(
  id: string,
  estado: Reserva["estado"],
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

  // Si se cancela o rechaza, devolver disponibilidad
  if (estado === "cancelada" || estado === "rechazada") {
    const reservaSnap = await getDoc(docRef);
    if (reservaSnap.exists()) {
      const reservaData = reservaSnap.data();
      const equipoRef = doc(db, "equipos", reservaData.equipoId);
      const equipoSnap = await getDoc(equipoRef);
      if (equipoSnap.exists()) {
        const equipoData = equipoSnap.data();
        await updateDoc(equipoRef, {
          disponibles: equipoData.disponibles + reservaData.cantidad,
          updatedAt: serverTimestamp(),
        });
      }
    }
  }
}

// Cancelar reserva
export async function cancelarReserva(id: string): Promise<void> {
  await actualizarEstadoReserva(id, "cancelada");
}

// ==================== STORAGE ====================

// Subir imagen de equipo
export async function subirImagenEquipo(
  archivo: File,
  equipoId: string
): Promise<string> {
  const extension = archivo.name.split(".").pop();
  const nombreArchivo = `equipos/${equipoId}_${Date.now()}.${extension}`;
  const storageRef = ref(storage, nombreArchivo);

  await uploadBytes(storageRef, archivo);
  const url = await getDownloadURL(storageRef);
  return url;
}

// ==================== ESTADISTICAS ====================

export async function obtenerEstadisticasEquipos(): Promise<{
  total: number;
  disponibles: number;
  mantenimiento: number;
  agotados: number;
  porCategoria: Record<string, number>;
}> {
  const equipos = await obtenerEquipos();

  return {
    total: equipos.length,
    disponibles: equipos.filter((e) => e.estado === "disponible").length,
    mantenimiento: equipos.filter((e) => e.estado === "mantenimiento").length,
    agotados: equipos.filter((e) => e.estado === "agotado").length,
    porCategoria: {
      audiovisual: equipos.filter((e) => e.categoria === "audiovisual").length,
      laboratorio: equipos.filter((e) => e.categoria === "laboratorio").length,
      computo: equipos.filter((e) => e.categoria === "computo").length,
      herramientas: equipos.filter((e) => e.categoria === "herramientas").length,
    },
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
