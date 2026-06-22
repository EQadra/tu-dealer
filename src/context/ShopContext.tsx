// context/ShopContext.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CreateShopPayload } from "../types/createShop";
import { Shop } from "../types/shop";
import api from "../utils/axios";

type ShopContextType = {
  // Estados existentes
  shops: Shop[];
  latestShops: Shop[];
  shop: Shop | null;
  loading: boolean;
  error: string | null;
  
  // Estados de búsqueda
  searchResults: Shop[];
  searching: boolean;
  
  // Métodos existentes
  fetchShops: () => Promise<void>;
  fetchLatestShops: () => Promise<void>;
  fetchMyShop: () => Promise<void>;
  createShop: (payload: CreateShopPayload) => Promise<Shop | null>;
  deleteShop: (id: number) => Promise<boolean>;
  
  // Métodos de búsqueda
  searchShops: (query: string) => Promise<Shop[]>;
  clearSearch: () => void;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: React.ReactNode }) => {
  // Estados existentes
  const [shops, setShops] = useState<Shop[]>([]);
  const [latestShops, setLatestShops] = useState<Shop[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de búsqueda
  const [searchResults, setSearchResults] = useState<Shop[]>([]);
  const [searching, setSearching] = useState(false);

  /* -----------------------------
   | Fetch all shops
   ----------------------------- */
// context/ShopContext.tsx - fetchShops corregido

const fetchShops = async () => {
  try {
    setLoading(true);
    setError(null);

    const { data } = await api.get("/shops");
    
    console.log("📦 [ShopContext] Respuesta de /shops:", data);
    console.log("📊 [ShopContext] Tipo:", typeof data);
    console.log("📊 [ShopContext] Es array?", Array.isArray(data));
    
    // 🔥 CORREGIDO: Extraer el array correctamente
    let shopsData = [];
    
    if (Array.isArray(data)) {
      shopsData = data;
    } else if (data?.data) {
      shopsData = Array.isArray(data.data) ? data.data : [];
    } else {
      shopsData = [];
    }
    
    console.log("📊 [ShopContext] Tiendas procesadas:", shopsData.length);
    setShops(shopsData);
  } catch (err) {
    console.error("Error fetching shops", err);
    setError("Error cargando tiendas");
  } finally {
    setLoading(false);
  }
};
  /* -----------------------------
   | Fetch latest shops
   ----------------------------- */
  const fetchLatestShops = async () => {
    console.log("calling latest shops API");

    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get("/shops/latest");

      console.log("latest shops response", data);

      setLatestShops(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching latest shops", err);
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | Fetch authenticated shop
   ----------------------------- */
  const fetchMyShop = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get<Shop>("/shops/me");

      setShop(data);
    } catch (err: any) {
      console.error("Error fetching my shop", err);
      setError(err?.response?.data?.message || "Error cargando tu tienda");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | Create shop
   ----------------------------- */
  const createShop = async (payload: CreateShopPayload): Promise<Shop | null> => {
    try {
      const { data } = await api.post<{ message: string; data: Shop }>(
        "/shops",
        payload
      );

      const newShop = data.data;

      setShops((prev) => [newShop, ...prev]);

      return newShop;
    } catch (err) {
      console.error("Error creating shop", err);
      return null;
    }
  };

  /* -----------------------------
   | Delete shop
   ----------------------------- */
  const deleteShop = async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/shops/${id}`);

      setShops((prev) => prev.filter((shop) => shop.id !== id));

      return true;
    } catch (err) {
      console.error("Error deleting shop", err);
      return false;
    }
  };

  /* ================================
     MÉTODOS DE BÚSQUEDA
  ================================ */

  const searchShops = useCallback(async (query: string): Promise<Shop[]> => {
    console.log("🔍 Buscando tiendas:", query);
    
    // Si la consulta está vacía, limpiar resultados
    if (!query || !query.trim()) {
      setSearchResults([]);
      setSearching(false);
      return [];
    }

    setSearching(true);
    setError(null);

    try {
      const url = `/shops/search?q=${encodeURIComponent(query.trim())}`;
      console.log("🌐 Haciendo petición a:", url);
      
      const { data } = await api.get(url);
      console.log("📡 Respuesta:", data);
      
      // Asegurarse de que data sea siempre un array
      const results = Array.isArray(data) ? data : [];
      setSearchResults(results);
      return results;
    } catch (err: any) {
      console.error("❌ Error en búsqueda:", err);
      
      // Manejo específico para 404 (sin resultados)
      if (err.response?.status === 404) {
        console.log(`🔍 No se encontraron tiendas para: "${query}"`);
        setSearchResults([]);
        return [];
      }
      
      setError(err.response?.data?.message || "Error al buscar tiendas");
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

  /* -----------------------------
   | Initial fetch
   ----------------------------- */
  useEffect(() => {
    fetchShops();
    fetchLatestShops();
  }, []);

  return (
    <ShopContext.Provider
      value={{
        // Estados existentes
        shops,
        latestShops,
        shop,
        loading,
        error,
        
        // Estados de búsqueda
        searchResults,
        searching,
        
        // Métodos existentes
        fetchShops,
        fetchLatestShops,
        fetchMyShop,
        createShop,
        deleteShop,
        
        // Métodos de búsqueda
        searchShops,
        clearSearch,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

/* -----------------------------
 | Hook
----------------------------- */
export const useShops = () => {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShops must be used inside ShopProvider");
  }

  return context;
};