// context/AssociationContext.tsx
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { Association } from "../types/association";
import api from "../utils/axios";

interface AssociationContextProps {
  associations: Association[];
  latestAssociations: Association[];
  association: Association | null;
  loading: boolean;
  error: string | null;
  searchResults: Association[];
  searching: boolean;

  fetchAssociations: () => Promise<void>;
  fetchLatestAssociations: () => Promise<void>;
  fetchAssociationById: (id: number) => Promise<Association | null>;
  createAssociation: (data: any) => Promise<Association>;
  updateAssociation: (id: number, data: any) => Promise<Association>;
  deleteAssociation: (id: number) => Promise<void>;
  fetchMyAssociation: () => Promise<void>;
  searchAssociations: (query: string) => Promise<Association[]>;
  clearSearch: () => void;
}

const AssociationContext = createContext<AssociationContextProps>(
  {} as AssociationContextProps
);

export const AssociationProvider = ({ children }: { children: ReactNode }) => {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [latestAssociations, setLatestAssociations] = useState<Association[]>([]);
  const [association, setAssociation] = useState<Association | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Association[]>([]);
  const [searching, setSearching] = useState(false);

  /* -----------------------------
   | GET /associations
   ----------------------------- */
  const fetchAssociations = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/associations");
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setAssociations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar asociaciones");
      console.error("Error fetchAssociations:", err);
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | GET /associations/latest
   ----------------------------- */
  const fetchLatestAssociations = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/associations/latest");
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setLatestAssociations(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al cargar asociaciones recientes"
      );
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | GET /associations/{id} - CORREGIDO
   ----------------------------- */
  const fetchAssociationById = async (id: number): Promise<Association | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Buscando asociación ID:", id);
      const res = await api.get(`/associations/${id}`);
      
      console.log("✅ Asociación recibida:", res.data);
      
      const data = res.data;
      setAssociation(data);
      return data;
    } catch (err: any) {
      console.error("❌ Error fetchAssociationById:", err);
      setError(err.response?.data?.message || "Error al cargar asociación");
      setAssociation(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | POST /associations
   ----------------------------- */
  const createAssociation = async (data: any): Promise<Association> => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/associations", data);
      const newAssociation = res.data;

      setAssociations((prev) => [newAssociation, ...prev]);
      return newAssociation;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al crear asociación");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | PUT /associations/{id}
   ----------------------------- */
  const updateAssociation = async (id: number, data: any): Promise<Association> => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.put(`/associations/${id}`, data);
      const updatedAssociation = res.data.data || res.data;

      setAssociations((prev) =>
        prev.map((l) => (l.id === id ? updatedAssociation : l))
      );

      if (association?.id === id) {
        setAssociation(updatedAssociation);
      }

      return updatedAssociation;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al actualizar asociación");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | GET /associations/me
   ----------------------------- */
  const fetchMyAssociation = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/associations/me");
      setAssociation(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | DELETE /associations/{id}
   ----------------------------- */
  const deleteAssociation = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/associations/${id}`);
      setAssociations((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al eliminar asociación");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | SEARCH
   ----------------------------- */
  const searchAssociations = useCallback(async (query: string): Promise<Association[]> => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return [];
    }

    setSearching(true);
    setError(null);

    try {
      const res = await api.get(`/associations/search?q=${encodeURIComponent(query.trim())}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setSearchResults(data);
      return data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        setSearchResults([]);
        return [];
      }
      setError(err.response?.data?.message || "Error al buscar asociaciones");
      setSearchResults([]);
      return [];
    } finally {
      setSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearching(false);
  }, []);

  return (
    <AssociationContext.Provider
      value={{
        associations,
        latestAssociations,
        association,
        loading,
        error,
        searchResults,
        searching,
        fetchAssociations,
        fetchLatestAssociations,
        fetchAssociationById,
        createAssociation,
        updateAssociation,
        deleteAssociation,
        fetchMyAssociation,
        searchAssociations,
        clearSearch,
      }}
    >
      {children}
    </AssociationContext.Provider>
  );
};

export const useAssociations = () => {
  const context = useContext(AssociationContext);
  if (!context) {
    throw new Error("useAssociations must be used within an AssociationProvider");
  }
  return context;
};

export default AssociationContext;