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
  // Estados existentes
  associations: Association[];
  latestAssociations: Association[];
  association: Association | null;
  loading: boolean;
  error: string | null;
  
  // Estados de búsqueda
  searchResults: Association[]; // SIEMPRE array
  searching: boolean;

  // Métodos existentes
  fetchAssociations: () => Promise<void>;
  fetchLatestAssociations: () => Promise<void>;
  fetchAssociationById: (id: number) => Promise<void>;
  createAssociation: (data: any) => Promise<Association>;
  updateAssociation: (id: number, data: any) => Promise<Association>;
  deleteAssociation: (id: number) => Promise<void>;
  fetchMyAssociation: () => Promise<void>;
  
  // Métodos de búsqueda
  searchAssociations: (query: string) => Promise<Association[]>;
  clearSearch: () => void;
}

const AssociationContext = createContext<AssociationContextProps>(
  {} as AssociationContextProps
);

export const AssociationProvider = ({ children }: { children: ReactNode }) => {
  // Estados existentes
  const [associations, setAssociations] = useState<Association[]>([]);
  const [latestAssociations, setLatestAssociations] = useState<Association[]>([]);
  const [association, setAssociation] = useState<Association | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de búsqueda - SIEMPRE INICIALIZADOS
  const [searchResults, setSearchResults] = useState<Association[]>([]); // Array vacío por defecto
  const [searching, setSearching] = useState(false);

  /* -----------------------------
   | GET /associations
   ----------------------------- */
  const fetchAssociations = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/associations");
      setAssociations(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar asociaciones");
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
      setLatestAssociations(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al cargar asociaciones recientes"
      );
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | GET /associations/{id}
   ----------------------------- */
  const fetchAssociationById = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/associations/${id}`);
      setAssociation(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar asociación");
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

  /* ================================
     MÉTODOS DE BÚSQUEDA
  ================================ */

  const searchAssociations = useCallback(async (query: string): Promise<Association[]> => {
    // Si la consulta está vacía, limpiar resultados
    if (!query || !query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return [];
    }

    setSearching(true);
    setError(null);

    try {
      const res = await api.get(`/associations/search?q=${encodeURIComponent(query.trim())}`);
      // Asegurarse de que data sea siempre un array
      const data = Array.isArray(res.data) ? res.data : [];
      setSearchResults(data);
      return data;
    } catch (err: any) {
      // Manejo específico para 404 (sin resultados)
      if (err.response?.status === 404) {
        console.log(`🔍 No se encontraron asociaciones para: "${query}"`);
        setSearchResults([]);
        return [];
      }
      
      setError(err.response?.data?.message || "Error al buscar asociaciones");
      setSearchResults([]);
      return []; // Retornar array vacío en lugar de lanzar error
    } finally {
      setSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearching(false);
  }, []);

  /* ================================
     PROVIDER CON TODOS LOS VALORES
  ================================ */

  return (
    <AssociationContext.Provider
      value={{
        // Estados existentes
        associations,
        latestAssociations,
        association,
        loading,
        error,
        
        // Estados de búsqueda - SIEMPRE DEFINIDOS
        searchResults, // Siempre es un array
        searching, // Siempre es boolean
        
        // Métodos existentes
        fetchAssociations,
        fetchLatestAssociations,
        fetchAssociationById,
        createAssociation,
        updateAssociation,
        deleteAssociation,
        fetchMyAssociation,
        
        // Métodos de búsqueda
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