import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/axios";
import { Shop } from "../types/shop";
import { CreateShopPayload } from "../types/createShop";

type ShopContextType = {
  shops: Shop[];
  latestShops: Shop[];
  shop: Shop | null;
  loading: boolean;
  error: string | null;

  fetchShops: () => Promise<void>;
  fetchLatestShops: () => Promise<void>;
  fetchMyShop: () => Promise<void>;
  createShop: (payload: CreateShopPayload) => Promise<Shop | null>;
  deleteShop: (id: number) => Promise<boolean>;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: React.ReactNode }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [latestShops, setLatestShops] = useState<Shop[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -----------------------------
   | Fetch all shops
   ----------------------------- */
  const fetchShops = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get<Shop[]>("/shops");

      setShops(Array.isArray(data) ? data : []);
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
        shops,
        latestShops,
        shop,
        loading,
        error,
        fetchShops,
        fetchLatestShops,
        fetchMyShop,
        createShop,
        deleteShop,
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