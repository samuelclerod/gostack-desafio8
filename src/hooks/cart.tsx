import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const projectsString = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (projectsString) {
        const newProjects: Product[] = JSON.parse(projectsString);
        setProducts(newProjects);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const index = products.findIndex(({ id }) => product.id === id);
      const newProducts = [...products];
      if (index === -1) {
        newProducts.push({ ...product, quantity: 1 });
      } else {
        newProducts[index].quantity += 1;
      }
      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const index = products.findIndex(product => product.id == id);
      if (index >= 0) {
        const newProducts = [...products];
        newProducts[index].quantity += 1;
        setProducts(newProducts);
      }
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(product => product.id == id);
      if (index >= 0 && products[index].quantity > 0) {
        const newProducts = [...products];
        newProducts[index].quantity -= 1;
        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
