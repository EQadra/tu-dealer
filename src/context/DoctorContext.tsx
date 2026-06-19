import React, { createContext, ReactNode, useContext, useState } from "react";
import { CreateDoctorPayload } from "../types/createDoctor";
import { Doctor } from "../types/doctor";
import api from "../utils/axios";

interface DoctorContextProps {
  doctors: Doctor[];
  latestDoctors: Doctor[];
  doctor: Doctor | null;
  loading: boolean;
  error: string | null;

  fetchDoctors: () => Promise<void>;
  fetchLatestDoctors: () => Promise<void>;
  fetchDoctorById: (id: number) => Promise<void>;
  fetchMyDoctor: () => Promise<void>;
  createDoctor: (data: CreateDoctorPayload) => Promise<Doctor>;
  updateDoctor: (id: number, data: Partial<CreateDoctorPayload>) => Promise<Doctor>;
  deleteDoctor: (id: number) => Promise<void>;
}

const DoctorContext = createContext<DoctorContextProps>({} as DoctorContextProps);

export const DoctorProvider = ({ children }: { children: ReactNode }) => {
  // ✅ ESTADOS CORRECTOS
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [latestDoctors, setLatestDoctors] = useState<Doctor[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================================
     GET /doctors
  ================================ */
  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar doctores");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     GET /doctors/latest
  ================================ */
  const fetchLatestDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/doctors/latest");
      setLatestDoctors(res.data);
    } catch {
      setError("Error al cargar doctores recientes");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     GET /doctors/{id}
  ================================ */
  const fetchDoctorById = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/doctors/${id}`);
      setDoctor(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar doctor");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     GET /doctors/me
  ================================ */
  const fetchMyDoctor = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/doctors/me");
      setDoctor(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     POST /doctors
  ================================ */
  const createDoctor = async (data: CreateDoctorPayload): Promise<Doctor> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/doctors", data);
      const newDoctor = res.data.data ?? res.data;
      setDoctors((prev) => [newDoctor, ...prev]);
      return newDoctor;
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     PUT /doctors/{id}
  ================================ */
const updateDoctor = async (
    id: number,  // ✅ Este es el ID que debes usar
    data: Partial<CreateDoctorPayload>
): Promise<Doctor> => {
    setLoading(true);
    setError(null);
    
    try {
        // ✅ Usar el ID en la URL
        const res = await axios.put(`/api/doctors/${id}`, data);
        const updatedDoctor = res.data.data ?? res.data;

        setDoctors((prev) =>
            prev.map((d) => (d.id === id ? updatedDoctor : d))
        );

        if (doctor?.id === id) setDoctor(updatedDoctor);

        return updatedDoctor;
    } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message);
        throw error;
    } finally {
        setLoading(false);
    }
};
  /* ================================
     DELETE /doctors/{id}
  ================================ */
  const deleteDoctor = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/doctors/${id}`);
      setDoctors((prev) => prev.filter((d) => d.id !== id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DoctorContext.Provider
      value={{
        doctors,
        latestDoctors,
        doctor,
        loading,
        error,
        fetchDoctors,
        fetchLatestDoctors,
        fetchDoctorById,
        fetchMyDoctor,
        createDoctor,
        updateDoctor,
        deleteDoctor,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctors = () => useContext(DoctorContext);
