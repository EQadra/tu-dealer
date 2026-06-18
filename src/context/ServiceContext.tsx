// src/context/ServiceContext.tsx

import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";

import api from "../utils/axios";

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  duration?: number | string;

  serviceable_type?: string;
  serviceable_id?: number;

  created_at?: string;
  updated_at?: string;
}

export interface CreateServicePayload {
  name: string;
  description?: string;
  price: number;
  duration?: number | string;

  serviceable_type: string;
  serviceable_id: number;
}

interface ServiceContextProps {
  services: Service[];

  loading: boolean;

  error: string | null;

  fetchServices: () => Promise<void>;

  createService: (
    data: CreateServicePayload
  ) => Promise<Service>;

  updateService: (
    id: number,
    data: Partial<CreateServicePayload>
  ) => Promise<Service>;

  deleteService: (
    id: number
  ) => Promise<void>;
}

const ServiceContext =
  createContext<ServiceContextProps>(
    {} as ServiceContextProps
  );

export const ServiceProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [services, setServices] = useState<
    Service[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  /* =========================================
     GET ALL SERVICES
  ========================================= */

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/services");

      // 🔥 soporta array directo o paginado
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      setServices(data);
    } catch (err: any) {
      console.log(
        "FETCH SERVICES ERROR:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
          "Error loading services"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     CREATE SERVICE
  ========================================= */

// context/ServiceContext.tsx - En createService()

const createService = async (data: CreateServicePayload): Promise<Service> => {
  try {
    setLoading(true);
    setError(null);

    const payload = {
      ...data,
      price: Number(data.price),
      duration: data.duration ? String(data.duration) : null, // 👈 CONVERTIR A STRING
    };

    const res = await api.post("/services", payload);
    const newService: Service = res.data.data;

    setServices((prev) => [newService, ...prev]);
    return newService;
  } catch (err: any) {
    console.log("CREATE SERVICE ERROR:", err?.response?.data || err);
    setError(err?.response?.data?.message || "Error creating service");
    throw err;
  } finally {
    setLoading(false);
  }
};

// En updateService()
const updateService = async (
  id: number,
  data: Partial<CreateServicePayload>
): Promise<Service> => {
  try {
    setLoading(true);
    setError(null);

    const payload = {
      ...data,
      price: data.price ? Number(data.price) : undefined,
      duration: data.duration ? String(data.duration) : undefined, // 👈 CONVERTIR A STRING
    };

    const res = await api.put(`/services/${id}`, payload);
    const updated: Service = res.data.data;

    setServices((prev) =>
      prev.map((item) => (item.id === id ? updated : item))
    );

    return updated;
  } catch (err: any) {
    console.log("UPDATE SERVICE ERROR:", err?.response?.data || err);
    setError(err?.response?.data?.message || "Error updating service");
    throw err;
  } finally {
    setLoading(false);
  }
};
  /* =========================================
     DELETE SERVICE
  ========================================= */

  const deleteService = async (
    id: number
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await api.delete(
        `/services/${id}`
      );

      setServices((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );
    } catch (err: any) {
      console.log(
        "DELETE SERVICE ERROR:",
        err?.response?.data || err
      );

      setError(
        err?.response?.data?.message ||
          "Error deleting service"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceContext.Provider
      value={{
        services,

        loading,

        error,

        fetchServices,

        createService,

        updateService,

        deleteService,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const context =
    useContext(ServiceContext);

  if (!context) {
    throw new Error(
      "useServices must be used inside ServiceProvider"
    );
  }

  return context;
};