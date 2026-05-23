import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';
import api from '../utils/axios';
import { Product } from '../types/product';
import { CreateProductPayload } from '../types/createProduct';

interface ProductContextProps {
  products: Product[];
  singleProduct: Product | null;
  loading: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
    fetchLatestProducts: () => Promise<void>; // 👈 AGREGAR

  fetchProductById: (id: number) => Promise<void>;
  createProduct: (data: CreateProductPayload) => Promise<Product>;
  updateProduct: (id: number, data: Partial<CreateProductPayload>) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
}

const ProductContext = createContext<ProductContextProps>(
  {} as ProductContextProps
);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [singleProduct, setSingleProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -----------------------------
   | GET /products
   ----------------------------- */
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
 | GET /products/latest
----------------------------- */
const fetchLatestProducts = async () => {
  setLoading(true);
  setError(null);

  try {
    const res = await api.get('/products/latest');
    setProducts(res.data);
  } catch (err: any) {
    setError(err.response?.data?.message || 'Error al cargar últimos productos');
  } finally {
    setLoading(false);
  }
};

  /* -----------------------------
   | GET /products/{id}
   ----------------------------- */
  const fetchProductById = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/products/${id}`);
      setSingleProduct(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Producto no encontrado');
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | POST /products
   ----------------------------- */
const createProduct = async (data: any): Promise<Product> => {
  setLoading(true);
  setError(null);

  try {
    const res = await api.post('/products', data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const created = res.data.data;

    setProducts((prev) => [created, ...prev]);

    return created;
  } catch (err: any) {
    setError(err.response?.data?.message || 'Error al crear producto');
    throw err;
  } finally {
    setLoading(false);
  }
};

  /* -----------------------------
   | PUT /products/{id}
   ----------------------------- */
  const updateProduct = async (
    id: number,
    data: Partial<CreateProductPayload>
  ): Promise<Product> => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.put(`/api/products/${id}`, data);
      const updated = res.data.data;

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );

      if (singleProduct?.id === id) {
        setSingleProduct(updated);
      }

      return updated;
    } catch (err: any) {
      setError(err.response?.data?.message || 'No autorizado');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
   | DELETE /products/{id}
   ----------------------------- */
  const deleteProduct = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'No autorizado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        singleProduct,
        loading,
        error,
        fetchProducts,
        fetchLatestProducts,
        fetchProductById,
        createProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
