import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import api from "../utils/axios";

export interface Association {
  id: number;
  user_id: number;
  name: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  image: string;
  website: string;
  created_at: string;
  updated_at: string;
}

interface AssociationContextProps {
  associations: Association[];
  latestAssociations: Association[];
  selectedAssociation: Association | null;
  loading: boolean;

  fetchAssociations: () => Promise<void>;
  fetchLatestAssociations: () => Promise<void>;
  fetchAssociationById: (id: number) => Promise<void>;

  createAssociation: (data: Partial<Association>) => Promise<void>;
  updateAssociation: (id: number, data: Partial<Association>) => Promise<void>;
  deleteAssociation: (id: number) => Promise<void>;
}

const AssociationContext = createContext<
  AssociationContextProps | undefined
>(undefined);

export const AssociationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [associations, setAssociations] = useState<Association[]>([]);
  const [latestAssociations, setLatestAssociations] = useState<Association[]>(
    []
  );
  const [selectedAssociation, setSelectedAssociation] =
    useState<Association | null>(null);

  const [loading, setLoading] = useState(false);

  /* =========================
     📥 FETCH ALL
  ========================= */
  const fetchAssociations = async () => {
    try {
      setLoading(true);

      const response = await api.get("/associations");

      console.log("📦 ALL ASSOCIATIONS:", response.data);

      setAssociations(response.data);
    } catch (error) {
      console.log("❌ fetchAssociations error", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ⭐ FETCH LATEST
  ========================= */
const fetchLatestAssociations = async () => {
  try {
    setLoading(true);

    const response = await api.get("/associations");

    console.log("DATA BACKEND:", response.data);

    setLatestAssociations(response.data.data); // 👈 AQUÍ

  } catch (error) {
   console.error("Error fetching latest ASSOCIATIONS", error);
  } finally {
    setLoading(false);
  }
};

  /* =========================
     🔍 FETCH ONE
  ========================= */
const fetchAssociationById = async (id: number) => {
  try {
    setLoading(true);

    const response = await api.get(`/associations/${id}`);
    console.log("✅ RESPONSE OK", response.data); // aquí verás tu JSON completo

    const association = response.data; // 👈 usar data directamente

    setSelectedAssociation(association); // guardar correctamente
    return association;
  } catch (error) {
    console.log("❌ fetchAssociationById error", error);
    return null;
  } finally {
    setLoading(false);
  }
};

  /* =========================
     ➕ CREATE
  ========================= */
  const createAssociation = async (data: Partial<Association>) => {
    try {
      setLoading(true);

      const response = await api.post("/associations", data);

      setAssociations((prev) => [response.data, ...prev]);
    } catch (error) {
      console.log("❌ createAssociation error", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ✏️ UPDATE
  ========================= */
const updateAssociation = async (id: number, data: Partial<Association>) => {
  try {
    setLoading(true);

    const response = await api.put(`/associations/${id}`, data);

    setAssociations((prev) =>
      prev.map((item) =>
        item.id === id ? response.data.data : item
      )
    );

    return response.data.data;
  } catch (error) {
    console.log("❌ updateAssociation error", error);
    throw error;
  } finally {
    setLoading(false);
  }
};
  /* =========================
     🗑 DELETE
  ========================= */
  const deleteAssociation = async (id: number) => {
    try {
      setLoading(true);

      await api.delete(`/associations/${id}`);

      setAssociations((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.log("❌ deleteAssociation error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AssociationContext.Provider
      value={{
        associations,
        latestAssociations,
        selectedAssociation,
        loading,
        fetchAssociations,
        fetchLatestAssociations,
        fetchAssociationById,
        createAssociation,
        updateAssociation,
        deleteAssociation,
      }}
    >
      {children}
    </AssociationContext.Provider>
  );
};

export const useAssociations = () => {
  const context = useContext(AssociationContext);

  if (!context) {
    throw new Error(
      "useAssociations must be used inside AssociationProvider"
    );
  }

  return context;
};