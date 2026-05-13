"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase-config";

// Tipos
export interface UserData {
  uid: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  tipoUsuario: "estudiante" | "docente" | "administrativo";
  facultad: string;
  codigo: string;
  rol: "usuario" | "admin";
  createdAt: Date;
  photoURL?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    additionalData: Omit<UserData, "uid" | "email" | "rol" | "createdAt">
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Escuchar cambios de autenticacion
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Obtener datos adicionales del usuario desde Firestore
        const userDocRef = doc(db, "usuarios", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Iniciar sesion con email y contrasena
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error al iniciar sesion:", error);
      throw error;
    }
  };

  // Registrar nuevo usuario
  const signUp = async (
    email: string,
    password: string,
    additionalData: Omit<UserData, "uid" | "email" | "rol" | "createdAt">
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Actualizar perfil con nombre
      await updateProfile(firebaseUser, {
        displayName: `${additionalData.nombre} ${additionalData.apellido}`,
      });

      // Guardar datos adicionales en Firestore
      const userDocRef = doc(db, "usuarios", firebaseUser.uid);
      const newUserData: UserData = {
        uid: firebaseUser.uid,
        email: email,
        nombre: additionalData.nombre,
        apellido: additionalData.apellido,
        telefono: additionalData.telefono,
        tipoUsuario: additionalData.tipoUsuario,
        facultad: additionalData.facultad,
        codigo: additionalData.codigo,
        rol: "usuario", // Por defecto, todos son usuarios normales
        createdAt: new Date(),
      };

      await setDoc(userDocRef, {
        ...newUserData,
        createdAt: serverTimestamp(),
      });

      setUserData(newUserData);
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      throw error;
    }
  };

  // Iniciar sesion con Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Verificar si el usuario ya existe en Firestore
      const userDocRef = doc(db, "usuarios", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Crear perfil basico para usuarios de Google
        const [nombre, ...apellidoArr] = (
          firebaseUser.displayName || "Usuario"
        ).split(" ");
        const apellido = apellidoArr.join(" ") || "";

        const newUserData: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          nombre,
          apellido,
          tipoUsuario: "estudiante",
          facultad: "",
          codigo: "",
          rol: "usuario",
          createdAt: new Date(),
          photoURL: firebaseUser.photoURL || undefined,
        };

        await setDoc(userDocRef, {
          ...newUserData,
          createdAt: serverTimestamp(),
        });

        setUserData(newUserData);
      } else {
        setUserData(userDoc.data() as UserData);
      }
    } catch (error) {
      console.error("Error al iniciar sesion con Google:", error);
      throw error;
    }
  };

  // Cerrar sesion
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error("Error al cerrar sesion:", error);
      throw error;
    }
  };

  // Restablecer contrasena
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error al enviar email de recuperacion:", error);
      throw error;
    }
  };

  const isAdmin = userData?.rol === "admin";

  const value: AuthContextType = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
