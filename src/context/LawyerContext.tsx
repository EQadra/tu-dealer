import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import api from "../utils/axios";
import { Lawyer } from "../types/lawyer";
import { CreateLawyerPayload } from "../types/createLawyer";

interface LawyerContextProps {
  lawyers: Lawyer[];
  latestLawyers: Lawyer[];
  lawyer: Lawyer | null;
  loading: boolean;
  error: string | null;

  fetchLawyers: () => Promise<void>;
  fetchLatestLawyers: () => Promise<void>;
  fetchLawyerById: (id: number) => Promise<void>;
  createLawyer: (data: CreateLawyerPayload) => Promise<Lawyer>;
  updateLawyer: (
    id: number,
    data: Partial<CreateLawyerPayload>
  ) => Promise<Lawyer>;
  deleteLawyer: (id: number) => Promise<void>;
  fetchMyLawyer: () => Promise<void>;
}

const LawyerContext = createContext<LawyerContextProps>(
  {} as LawyerContextProps
);

export const LawyerProvider = ({ children }: { children: ReactNode }) => {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [latestLawyers, setLatestLawyers] = useState<Lawyer[]>([]);
  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -----------------------------
   | GET /lawyers
   ----------------------------- */
  const fetchLawyers = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/lawyers");
      setLawyers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar abogados");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | GET /lawyers/latest
   ----------------------------- */
  const fetchLatestLawyers = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/lawyers/latest");
      setLatestLawyers(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al cargar abogados recientes"
      );
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | GET /lawyers/{id}
   ----------------------------- */
  const fetchLawyerById = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/lawyers/${id}`);
      setLawyer(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar abogado");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | POST /lawyers
   ----------------------------- */
  const createLawyer = async (
    data: CreateLawyerPayload
  ): Promise<Lawyer> => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/lawyers", data);
      const newLawyer = res.data.data;

      setLawyers((prev) => [newLawyer, ...prev]);
      return newLawyer;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear abogado");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | PUT /lawyers/{id}
   ----------------------------- */
  const updateLawyer = async (
    id: number,
    data: Partial<CreateLawyerPayload>
  ): Promise<Lawyer> => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.put(`/lawyers/${id}`, data);
      const updatedLawyer = res.data.data;

      setLawyers((prev) =>
        prev.map((l) => (l.id === id ? updatedLawyer : l))
      );

      if (lawyer?.id === id) {
        setLawyer(updatedLawyer);
      }

      return updatedLawyer;
    } catch (err: any) {
      setError(err.response?.data?.message || "No autorizado");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | GET /lawyers/me
   ----------------------------- */
  const fetchMyLawyer = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/lawyers/me");
      setLawyer(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | DELETE /lawyers/{id}
   ----------------------------- */
  const deleteLawyer = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/lawyers/${id}`);
      setLawyers((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || "No autorizado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LawyerContext.Provider
      value={{
        lawyers,
        latestLawyers,
        lawyer,
        loading,
        error,
        fetchLawyers,
        fetchLatestLawyers,
        fetchLawyerById,
        createLawyer,
        updateLawyer,
        fetchMyLawyer,
        deleteLawyer,
      }}
    >
      {children}
    </LawyerContext.Provider>
  );
};

export const useLawyers = () => useContext(LawyerContext);