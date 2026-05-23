// src/context/ServiceContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';
import api from '../utils/axios';
import { Service } from '../types/service';
import { CreateServicePayload } from '../types/createService';

interface ServiceContextProps {
  services: Service[];
  service: Service | null;
  loading: boolean;
  error: string | null;

  fetchServices: () => Promise<void>;
  fetchServiceById: (id: number) => Promise<void>;
  createService: (data: CreateServicePayload) => Promise<Service>;
  updateService: (
    id: number,
    data: Partial<CreateServicePayload>
  ) => Promise<Service>;
  deleteService: (id: number) => Promise<void>;
}

const ServiceContext = createContext<ServiceContextProps>(
  {} as ServiceContextProps
);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GET /api/services
  const fetchServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/api/services');
      setServices(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  // GET /api/services/{id}
  const fetchServiceById = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/api/services/${id}`);
      setService(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar servicio');
    } finally {
      setLoading(false);
    }
  };

  // POST /api/services
  const createService = async (
    data: CreateServicePayload
  ): Promise<Service> => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/api/services', data);
      const newService = res.data.data;

      setServices((prev) => [newService, ...prev]);
      return newService;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear servicio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // PUT /api/services/{id}
  const updateService = async (
    id: number,
    data: Partial<CreateServicePayload>
  ): Promise<Service> => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.put(`/api/services/${id}`, data);
      const updatedService = res.data.data;

      setServices((prev) =>
        prev.map((s) => (s.id === id ? updatedService : s))
      );

      if (service?.id === id) {
        setService(updatedService);
      }

      return updatedService;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar servicio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // DELETE /api/services/{id}
  const deleteService = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/api/services/${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ServiceContext.Provider
      value={{
        services,
        service,
        loading,
        error,
        fetchServices,
        fetchServiceById,
        createService,
        updateService,
        deleteService,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => useContext(ServiceContext);
