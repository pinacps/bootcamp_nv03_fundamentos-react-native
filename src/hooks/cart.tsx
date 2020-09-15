/* eslint-disable prettier/prettier */
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
      const productsStorage = await AsyncStorage.getItem('@GoMarketPlace:Products');
      if (productsStorage) setProducts(JSON.parse(productsStorage));
    }
    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const product = products.find(f => f.id === id);
      if (!product) throw new Error('Produto não localizado no carrinho');
      const newProducts = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p);
      setProducts([...newProducts]);
      await AsyncStorage.setItem(
        '@GoMarketPlace:Products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const index = products.findIndex(f => f.id === id);
      if (index < 0) throw new Error('Produto não localizado no carrinho');
      let newProducts;
      const productFinded = products[index];
      if (productFinded.quantity === 1) {
        products.splice(index, 1);
        newProducts = products;
      }
      else {
        newProducts = products.map(item => item.id !== id ? item : { ...item, quantity: item.quantity - 1});
      }
      setProducts([...newProducts]);
      await AsyncStorage.setItem('@GoMarketPlace:Products', JSON.stringify(newProducts));
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      let newProducts;
      const productFind = products.find(f => f.id === product.id);
      if (productFind) {
        newProducts = products.map(p =>
          p.id !== productFind.id ? p : { ...p, quantity: p.quantity + 1 }
          )} else {
            newProducts = [...products, { ...product, quantity: 1}]
          }
      setProducts([...newProducts]);
      await AsyncStorage.setItem(
        '@GoMarketPlace:Products',
        JSON.stringify(newProducts),
      );
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
